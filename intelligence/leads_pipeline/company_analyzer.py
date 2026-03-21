"""
company_analyzer.py
Análise profunda de empresa usando Gemini (multimodal: site + Instagram + Maps).

Retorna: resumo_empresa, diferenciais[], todos_telefones[], emails[]
"""

import os
import re
import json
import logging
from typing import Dict, Any, List

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

HEADERS = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1",
    "Accept-Language": "pt-BR,pt;q=0.9",
}

ABOUT_PATHS = ["/sobre", "/about", "/quem-somos", "/quem_somos", "/a-empresa", "/nossa-historia"]
PHONE_RE = re.compile(
    r'(?:\+55\s?)?(?:\(?\d{2}\)?[\s.\-]?)(?:\d{4,5})[\s.\-]?\d{4}', re.MULTILINE
)


def _fetch_text(url: str, max_chars: int = 5000) -> str:
    """Busca o texto limpo de uma URL."""
    if not url:
        return ""
    try:
        if not url.startswith("http"):
            url = "https://" + url
        resp = requests.get(url, headers=HEADERS, timeout=12, allow_redirects=True)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(["script", "style", "noscript", "nav", "footer", "meta", "head"]):
            tag.decompose()
        text = re.sub(r'\s+', ' ', soup.get_text(separator=" ", strip=True))
        return text[:max_chars]
    except Exception as e:
        logger.warning(f"[analyzer] Erro ao acessar {url}: {e}")
        return ""


def _extract_phones_from_text(text: str) -> List[str]:
    """Extrai todos os números de telefone de um texto."""
    raw = PHONE_RE.findall(text)
    cleaned = []
    seen = set()
    for phone in raw:
        digits = re.sub(r'\D', '', phone)
        if len(digits) >= 10 and digits not in seen:
            seen.add(digits)
            cleaned.append(phone.strip())
    return cleaned


def _analyze_with_gemini(
    company_name: str,
    site_text: str = "",
    instagram_bio: str = "",
    maps_description: str = "",
) -> Dict[str, Any]:
    """Análise profunda com Gemini combinando dados de múltiplas fontes."""
    empty = {
        "resumo_empresa": "",
        "diferenciais": [],
        "todos_telefones": [],
        "emails": [],
    }

    if not GEMINI_AVAILABLE:
        return empty

    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key:
        return empty

    raw_phones = []
    for text in [site_text, instagram_bio, maps_description]:
        raw_phones.extend(_extract_phones_from_text(text))

    sections = []
    if maps_description:
        sections.append(f"## Dados do Google Meu Negócio:\n{maps_description[:1500]}")
    if site_text:
        sections.append(f"## Texto do Site:\n{site_text[:2000]}")
    if instagram_bio:
        sections.append(f"## Bio / Posts do Instagram:\n{instagram_bio[:1000]}")
    if raw_phones:
        sections.append(f"## Números encontrados no conteúdo:\n{', '.join(raw_phones)}")

    full_context = "\n\n".join(sections)
    if not full_context.strip():
        return empty

    genai.configure(api_key=key)
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config={"response_mime_type": "application/json"},
    )

    prompt = f"""Você é um analista de inteligência de mercado B2B especializado em prospecção no Brasil.

Analise todas as informações abaixo da empresa "{company_name}" e gere um perfil comercial completo.

{full_context}

INSTRUÇÕES:
- "resumo_empresa": o que a empresa faz, em 1-3 frases claras, como se fosse apresentar para um vendedor antes de uma cold call.
- "diferenciais": pontos de diferenciação para personalizar a abordagem de vendas.
- "todos_telefones": QUALQUER número de telefone encontrado. Formate com DDD no padrão +55 (DDD) XXXXX-XXXX.
- "emails": todos os endereços de e-mail de contato.

Retorne SOMENTE este JSON:
{{
  "resumo_empresa": "...",
  "diferenciais": ["diferencial 1", "diferencial 2", "diferencial 3"],
  "todos_telefones": ["+55 (34) 99999-9999"],
  "emails": ["contato@empresa.com.br"]
}}

Se algum campo não tiver informação, use string vazia ou lista vazia."""

    try:
        response = model.generate_content(prompt)
        raw = response.text or "{}"
        result = json.loads(raw)
        for k, default in empty.items():
            result.setdefault(k, default)
        return result
    except Exception as e:
        logger.error(f"[analyzer] Erro no Gemini: {e}")
        return empty


def enrich_company_deep(
    company_name: str,
    site_url: str = "",
    instagram_url: str = "",
    maps_description: str = "",
) -> Dict[str, Any]:
    """Ponto de entrada: busca textos de múltiplas fontes e chama Gemini."""
    logger.info(f"[analyzer] Análise profunda de: {company_name}")

    site_text = ""
    instagram_text = ""

    if site_url:
        site_text = _fetch_text(site_url)
        if site_url.rstrip("/"):
            base = site_url.rstrip("/")
            for path in ABOUT_PATHS:
                about_text = _fetch_text(base + path, max_chars=2000)
                if about_text and len(about_text) > 100:
                    site_text = site_text + " | SOBRE: " + about_text
                    break

    if instagram_url:
        instagram_text = _fetch_text(instagram_url, max_chars=2000)

    return _analyze_with_gemini(
        company_name=company_name,
        site_text=site_text,
        instagram_bio=instagram_text,
        maps_description=maps_description,
    )
