"""
pipeline.py
Orquestrador do pipeline ABM (Account-Based Marketing) de prospecção B2B.

Fluxo:
  ETAPA 1 — Google Maps (Apify)       → Lista de empresas
  ETAPA 2 — Web/Social Enrich (Gemini) → Resumo, diferenciais, e-mails, redes sociais
  ETAPA 3 — Deep Analysis (Gemini)     → Perfil comercial completo
  ETAPA 4 — X-Ray LinkedIn (Apify)     → Tomadores de decisão
  ETAPA 5 — Hunter.io                  → E-mail corporativo de cada contato
  ETAPA 6 — Supabase                   → Persistência + embeddings
"""

import os
import time
import logging
from typing import Dict, Any, List, Optional, Callable
from urllib.parse import urlparse

from supabase import create_client, Client

from .maps_scraper import search_google_maps
from .web_enricher import enrich_company_website
from .social_enricher import enrich_from_social
from .company_analyzer import enrich_company_deep
from .employee_finder import find_employees
from .email_enricher import find_email
from .embedding_generator import generate_and_store_embedding
from .social_search_enricher import find_instagram_via_search
from .linktree_resolver import resolve_link_aggregator

logger = logging.getLogger(__name__)


def _get_supabase() -> Optional[Client]:
    """Cria client Supabase com service role key."""
    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    if not url or not key:
        logger.error("[db] SUPABASE_URL ou SERVICE_ROLE_KEY não configurados")
        return None
    return create_client(url, key)


def _save_empresa(supabase: Client, data: Dict[str, Any]) -> Optional[str]:
    """Upsert em empresas_leads, retorna UUID."""
    clean = {k: v for k, v in data.items() if v is not None and v != "" and v != []}
    try:
        resp = supabase.table("empresas_leads").upsert(
            clean, on_conflict="user_id,place_id"
        ).execute()
        if resp.data:
            return resp.data[0].get("id")
        return None
    except Exception as e:
        err = str(e)
        if "unique" in err.lower() or "duplicate" in err.lower():
            logger.info("Empresa já existe — pulando insert.")
        else:
            logger.error(f"Erro ao salvar empresa: {err}")
        return None


def _save_contato(supabase: Client, data: Dict[str, Any]) -> bool:
    """Insere contato em contatos_leads."""
    clean = {k: v for k, v in data.items() if v is not None and v != ""}
    try:
        resp = supabase.table("contatos_leads").insert(clean).execute()
        return bool(resp.data)
    except Exception as e:
        logger.error(f"Erro ao salvar contato: {e}")
        return False


def run_abm_pipeline(
    search_term: str,
    location: str,
    max_empresas: int = 10,
    user_id: Optional[str] = None,
    progress_callback: Optional[Callable[[str], None]] = None,
) -> Dict[str, Any]:
    """
    Pipeline ABM principal.
    Retorna dict com resumo da execução.
    """
    def report(msg: str):
        logger.info(msg)
        if progress_callback:
            progress_callback(msg)

    report(f"Iniciando busca de {max_empresas} empresas em {location}...")

    empresas_salvas = 0
    contatos_salvos = 0
    sites_analisados = 0
    emails_encontrados = 0

    # ── ETAPA 1: Google Maps ──
    report("ETAPA 1: Buscando empresas no Google Maps...")
    try:
        empresas: List[Dict[str, Any]] = search_google_maps(
            search_term, location, max_results=max_empresas
        )
    except Exception as e:
        report(f"Erro fatal no Maps Scraper: {e}")
        return {"error": str(e), "total_encontradas": 0}

    # Filtragem de empresas já no funil
    supabase = _get_supabase()
    empresas_existentes = []
    if supabase and user_id:
        res = supabase.table("empresas_leads").select("nome, status_funil").eq("user_id", user_id).execute()
        empresas_existentes = res.data or []

    def deve_ignorar(nome_empresa: str) -> bool:
        for ex in empresas_existentes:
            if ex.get("nome", "").lower() == nome_empresa.lower() and ex.get("status_funil") is not None:
                return True
        return False

    total = len(empresas)
    if total == 0:
        report("Nenhuma empresa encontrada.")
        return {"total_encontradas": 0, "empresas_salvas": 0, "contatos_salvos": 0, "emails_encontrados": 0}

    report(f"{total} empresa(s) encontrada(s)!")

    # ── Loop por empresa ──
    link_aggs = ["linktr.ee", "bento.me", "beacons.ai", "taplink.cc", "lnk.bio"]

    for idx, empresa in enumerate(empresas, 1):
        nome = empresa.get("nome", "Desconhecida")
        site = empresa.get("website_url", "")

        report(f"[{idx}/{total}] Processando: {nome}")

        # Classifica Instagram/Facebook alocado por engano no campo Website
        if site:
            site_lower = site.lower()
            if "instagram.com" in site_lower:
                empresa["instagram_url"] = site
                site = ""
            elif "facebook.com" in site_lower:
                empresa["facebook_url"] = site
                site = ""

        # Resolve agregadores de links
        dominio = ""
        if site:
            if any(agg in site.lower() for agg in link_aggs):
                resolved = resolve_link_aggregator(site)
                site = resolved.get("website_url") or ""
                if resolved.get("whatsapp_url"):
                    empresa["whatsapp_url"] = resolved["whatsapp_url"]

            if site:
                parsed = urlparse(site if site.startswith("http") else "https://" + site)
                dominio = parsed.netloc.lstrip("www.") or ""

        if deve_ignorar(nome):
            report(f"[{idx}/{total}] {nome} já está no Funil — pulando.")
            continue

        # ── ETAPA 2: Investigação de Contatos ──
        web = {}
        social = {}
        final_site = site

        if final_site:
            try:
                web = enrich_company_website(final_site, company_name=nome)
                if web.get("resumo_empresa") or web.get("emails"):
                    sites_analisados += 1
            except Exception as e:
                logger.warning(f"Enriquecimento via site falhou: {e}")

        if not web.get("resumo_empresa") or not web.get("emails"):
            maps_ig = empresa.get("instagram_url")
            maps_fb = empresa.get("facebook_url")
            if maps_ig or maps_fb:
                social = enrich_from_social(nome, location, maps_ig, maps_fb)
            else:
                social = enrich_from_social(nome, location)

            bio_site = social.get("website_url")
            if bio_site and bio_site != final_site:
                try:
                    web_bio = enrich_company_website(bio_site, company_name=nome)
                    web.update(web_bio)
                    final_site = bio_site
                    parsed = urlparse(bio_site if bio_site.startswith("http") else "https://" + bio_site)
                    dominio = parsed.netloc.lstrip("www.") or ""
                    if web_bio.get("resumo_empresa"):
                        sites_analisados += 1
                except Exception as e:
                    logger.warning(f"Análise do site da bio falhou: {e}")

        # Consolidação de dados
        emails_site = web.get("emails", [])
        emails_social = [social.get("email")] if social.get("email") else []
        all_emails = list(dict.fromkeys(emails_site + emails_social))

        redes_web = web.get("redes_sociais")
        if not isinstance(redes_web, dict):
            redes_web = {}

        instagram_final = redes_web.get("instagram") or social.get("instagram_url") or empresa.get("instagram_url")
        if not instagram_final:
            instagram_final = find_instagram_via_search(nome, location)

        facebook_final = redes_web.get("facebook") or social.get("facebook_url") or empresa.get("facebook_url")
        linkedin_final = redes_web.get("linkedin") or empresa.get("linkedin_url")
        whatsapp_final = redes_web.get("whatsapp") or social.get("whatsapp") or social.get("phone")

        # ── ETAPA 3: Análise Profunda com Gemini ──
        maps_description = empresa.get("ai_resumo") or empresa.get("descricao") or ""
        deep = enrich_company_deep(
            company_name=nome,
            site_url=final_site or "",
            instagram_url=instagram_final or "",
            maps_description=maps_description,
        )

        resumo_final = deep.get("resumo_empresa") or web.get("resumo_empresa") or social.get("resumo_bio") or ""
        diferenciais_final = list(dict.fromkeys(
            (deep.get("diferenciais") or []) +
            (web.get("diferenciais") or []) +
            (social.get("diferenciais") or [])
        ))

        telefones_deep = deep.get("todos_telefones") or []
        emails_deep = deep.get("emails") or []
        all_emails = list(dict.fromkeys((web.get("emails") or []) + emails_deep + emails_social))

        todos_telefones = list(dict.fromkeys(
            ([empresa.get("telefone", "")] if empresa.get("telefone") else []) +
            telefones_deep
        ))

        # Monta payload da empresa
        empresa_payload = {
            **empresa,
            "dominio":         dominio,
            "ai_resumo":       resumo_final,
            "ai_diferenciais": diferenciais_final,
            "emails":          all_emails,
            "todos_telefones": todos_telefones,
            "instagram_url":   instagram_final,
            "facebook_url":    facebook_final,
            "linkedin_url":    linkedin_final,
            "whatsapp_url":    whatsapp_final,
            "website_url":     final_site,
            "status":          "enriquecido" if resumo_final else "novo",
            "fonte":           "google_maps",
        }
        if user_id:
            empresa_payload["user_id"] = user_id

        # Salva empresa
        empresa_id = None
        if supabase:
            empresa_id = _save_empresa(supabase, empresa_payload)
            if empresa_id:
                empresas_salvas += 1
                report(f"[{idx}/{total}] {nome} salva (id={empresa_id[:8]}...)")
                if resumo_final:
                    generate_and_store_embedding(supabase, empresa_id, resumo_final)

        # ── ETAPA 4: X-Ray de funcionários ──
        employees: List[Dict[str, Any]] = []
        try:
            employees = find_employees(nome, max_results=5)
        except Exception as e:
            logger.warning(f"X-Ray falhou: {e}")

        if employees:
            report(f"[{idx}/{total}] {len(employees)} tomador(es) de decisão encontrado(s)")

        # ── ETAPA 5: Hunter.io por contato ──
        for contact in employees:
            c_nome = contact.get("nome", "")
            c_cargo = contact.get("cargo_inferido", "")
            c_linkedin = contact.get("linkedin_url", "")

            contato_payload: Dict[str, Any] = {
                "empresa_id":  empresa_id,
                "nome":        c_nome,
                "cargo":       c_cargo,
                "linkedin_url": c_linkedin,
                "fonte":       "google_xray",
                "status":      "novo",
            }
            if user_id:
                contato_payload["user_id"] = user_id

            # Tenta encontrar e-mail via Hunter
            if dominio:
                try:
                    parts = c_nome.strip().split()
                    first = parts[0] if parts else ""
                    last = parts[-1] if len(parts) > 1 else ""  # Fix: usar parts[-1]
                    email, score = find_email(first, last, dominio)
                    if email:
                        emails_encontrados += 1
                        contato_payload["email_corporativo"] = email
                        contato_payload["email_confidence"] = score
                        contato_payload["email_domain"] = dominio
                        contato_payload["status"] = "enriquecido"
                except Exception as e:
                    logger.warning(f"Hunter falhou para {c_nome}: {e}")

            if empresa_id and supabase:
                _save_contato(supabase, contato_payload)
                contatos_salvos += 1

            time.sleep(1.0)

        time.sleep(2.0)

    # ── Resumo ──
    summary = {
        "total_encontradas":  total,
        "sites_analisados":   sites_analisados,
        "empresas_salvas":    empresas_salvas,
        "contatos_salvos":    contatos_salvos,
        "emails_encontrados": emails_encontrados,
    }

    report(f"Concluído! {empresas_salvas} empresas, {contatos_salvos} contatos.")
    return summary
