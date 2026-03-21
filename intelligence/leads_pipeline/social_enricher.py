"""
social_enricher.py
Enriquecimento via redes sociais (Instagram / Facebook).

Fallback quando a empresa não tem site:
  1. Busca perfil Instagram/Facebook via Google X-Ray (Apify)
  2. Acessa o perfil e extrai bio, website, e-mail, WhatsApp
  3. Usa Gemini para interpretar e retornar JSON estruturado
"""

import os
import re
import json
import time
import logging
from typing import Dict, Any, Optional

import requests
from apify_client import ApifyClient

logger = logging.getLogger(__name__)

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

GOOGLE_SEARCH_ACTOR = "apify/google-search-scraper"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) "
        "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
    ),
    "Accept-Language": "pt-BR,pt;q=0.9",
    "Accept": "text/html,application/xhtml+xml",
}


def find_social_profile(company_name: str, city: str = "") -> Dict[str, Optional[str]]:
    """Busca perfil Instagram/Facebook via Google Search (Apify)."""
    result = {"instagram": None, "facebook": None}

    token = os.getenv("APIFY_API_TOKEN", "").strip()
    if not token:
        return result

    location_hint = f'"{city}"' if city else ""
    query = f'site:instagram.com "{company_name}" {location_hint}'.strip()

    logger.info(f"[social] Buscando Instagram: {query}")

    client = ApifyClient(token)
    run_input = {
        "queries":          query,
        "maxPagesPerQuery": 1,
        "resultsPerPage":   5,
        "languageCode":     "pt-BR",
        "countryCode":      "br",
        "customDataFunction": "",
    }

    try:
        run = client.actor(GOOGLE_SEARCH_ACTOR).call(run_input=run_input)
        if run.get("status") != "SUCCEEDED":
            return result

        items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
        for item in items:
            organic = item.get("organicResults", []) or [item]
            for r in organic:
                url = r.get("url", "")
                if "instagram.com/" in url and not result["instagram"]:
                    if re.match(r'https?://(?:www\.)?instagram\.com/[a-zA-Z0-9_.]+/?$', url):
                        result["instagram"] = url.split("?")[0].rstrip("/")
                elif "facebook.com/" in url and not result["facebook"]:
                    if re.match(r'https?://(?:www\.)?facebook\.com/[a-zA-Z0-9_.]+/?$', url):
                        result["facebook"] = url.split("?")[0].rstrip("/")

    except Exception as e:
        logger.warning(f"[social] Erro ao buscar perfil social: {e}")

    return result


def _fetch_profile_text(url: str) -> str:
    """Extrai texto relevante das meta tags do perfil."""
    if not url:
        return ""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=12, allow_redirects=True)
        html = resp.text

        found = []
        for pattern in [
            r'<meta\s+(?:name|property)=["\'](?:description|og:description|og:title)["\'][^>]*content=["\'](.*?)["\']',
            r'<meta\s+content=["\'](.*?)["\']\s+(?:name|property)=["\'](?:description|og:description|og:title)["\']',
        ]:
            found.extend(re.findall(pattern, html, re.I | re.S))

        json_ld = re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.S)
        for block in json_ld:
            found.append(block[:500])

        wa = re.search(r'[Ww]hats[Aa]pp.*?(\+?55\s?\d{2}\s?\d{4,5}[-.]?\d{4})', html[:50000])
        email = re.search(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}', html[:50000])

        text = " | ".join(found[:8])
        if wa:
            text += f" | WhatsApp: {wa.group(1)}"
        if email:
            d = email.group(0).split("@")[-1]
            if d not in {"sentry.io", "example.com", "w3.org", "schema.org", "google.com"}:
                text += f" | Email: {email.group(0)}"

        return text[:4000]
    except Exception as e:
        logger.warning(f"[social] Erro ao acessar perfil: {e}")
        return ""


def _analyze_profile_with_gemini(profile_text: str, company_name: str, platform: str) -> Dict[str, Any]:
    """Usa Gemini para extrair contatos estruturados do texto do perfil."""
    if not GEMINI_AVAILABLE or not profile_text:
        return {}

    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key:
        return {}

    genai.configure(api_key=key)
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config={"response_mime_type": "application/json"},
    )

    prompt = f"""Você é um analista de prospecção B2B especialista em encontrar contatos ocultos.
Analise o conteúdo abaixo extraído do perfil de {platform} da empresa "{company_name}".

CONTEÚDO DO PERFIL:
---
{profile_text}
---

Retorne APENAS este JSON válido:
{{
  "website_url":    "URL do site principal encontrado na bio ou metadados (ou null)",
  "email":          "e-mail de contato encontrado (ou null)",
  "whatsapp":       "número do WhatsApp ou link wa.me encontrado (ou null)",
  "phone":          "telefone encontrado (ou null)",
  "resumo_bio":     "Resumo objetivo da bio (1 frase)",
  "instagram_handle": "username do Instagram sem @ (ou null)",
  "diferenciais":   ["diferencial 1 extraído da bio", "diferencial 2"]
}}

Se não encontrar alguma informação, use null."""

    try:
        response = model.generate_content(prompt)
        raw = response.text or "{}"
        return json.loads(raw)
    except Exception as e:
        logger.error(f"[social] Gemini falhou: {e}")
        return {}


def enrich_from_social(
    company_name: str,
    city: str = "",
    instagram_url: str = "",
    facebook_url: str = "",
) -> Dict[str, Any]:
    """
    Ponto de entrada. Se não tiver URL social, busca via Google X-Ray.
    Depois, acessa o perfil e extrai contatos com Gemini.
    """
    empty = {
        "website_url":    None,
        "email":          None,
        "whatsapp":       None,
        "phone":          None,
        "resumo_bio":     "",
        "instagram_url":  instagram_url or None,
        "facebook_url":   facebook_url or None,
        "diferenciais":   [],
    }

    logger.info(f"[social] Enriquecimento social de '{company_name}'")

    if not instagram_url and not facebook_url:
        found = find_social_profile(company_name, city)
        instagram_url = found.get("instagram", "")
        facebook_url = found.get("facebook", "")
        empty["instagram_url"] = instagram_url or None
        empty["facebook_url"] = facebook_url or None

    profile_url = instagram_url or facebook_url
    platform = "Instagram" if instagram_url else "Facebook"

    if not profile_url:
        logger.info(f"[social] Nenhum perfil social encontrado para '{company_name}'.")
        return empty

    time.sleep(1.0)

    profile_text = _fetch_profile_text(profile_url)
    if not profile_text:
        return empty

    analysis = _analyze_profile_with_gemini(profile_text, company_name, platform)

    if analysis:
        result = {**empty, **analysis}
        result["instagram_url"] = instagram_url or analysis.get("instagram_url") or None
        result["facebook_url"] = facebook_url or None
        return result

    return empty
