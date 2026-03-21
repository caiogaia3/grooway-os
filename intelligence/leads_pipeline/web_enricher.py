"""
web_enricher.py
Enriquecimento de sites de empresas via BeautifulSoup + Gemini.

Retorna: emails[], redes_sociais{}, resumo_empresa, diferenciais[]
"""

import os
import re
import json
import logging
from typing import Dict, Any, Optional

import requests
from bs4 import BeautifulSoup, Comment

logger = logging.getLogger(__name__)

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

HEADERS = {
    "User-Agent": ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                   "AppleWebKit/537.36 (KHTML, like Gecko) "
                   "Chrome/120.0.0.0 Safari/537.36"),
    "Accept-Language": "pt-BR,pt;q=0.9",
}

EMAIL_RE = re.compile(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}')
SOCIAL_PATTERNS = {
    "instagram": re.compile(r'(?:https?://)?(?:www\.)?instagram\.com/[a-zA-Z0-9_.]+/?', re.I),
    "facebook":  re.compile(r'(?:https?://)?(?:www\.)?facebook\.com/[a-zA-Z0-9_.]+/?', re.I),
    "linkedin":  re.compile(r'(?:https?://)?(?:www\.)?linkedin\.com/company/[a-zA-Z0-9_.\-]+/?', re.I),
    "twitter":   re.compile(r'(?:https?://)?(?:www\.)?(?:twitter|x)\.com/[a-zA-Z0-9_]+/?', re.I),
    "whatsapp":  re.compile(r'(?:wa\.me|api\.whatsapp\.com/send)[?/+\d]+', re.I),
}
IGNORED_DOMAINS = {"sentry.io", "example.com", "domain.com", "w3.org", "schema.org", "google.com"}


def _fetch_text(url: str) -> Optional[str]:
    """Faz GET da URL e retorna o texto puro (sem HTML)."""
    if not url.startswith("http"):
        url = "https://" + url.lstrip("/")
    try:
        resp = requests.get(url, headers=HEADERS, timeout=12, allow_redirects=True)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(["script", "style", "noscript", "meta", "head"]):
            tag.decompose()
        for c in soup.find_all(string=lambda t: isinstance(t, Comment)):
            c.extract()
        text = soup.get_text(separator=" ", strip=True)
        text = re.sub(r'\s+', ' ', text)
        return text[:5000]
    except Exception as e:
        logger.warning(f"[web] Erro ao acessar {url}: {type(e).__name__}")
        return None


def _analyze_with_gemini(text: str, company_name: str) -> Dict[str, Any]:
    """Envia o texto para o Gemini e retorna o JSON de análise."""
    if not GEMINI_AVAILABLE:
        return {}

    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key:
        return {}

    genai.configure(api_key=key)
    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash",
        generation_config={"response_mime_type": "application/json"},
    )

    prompt = f"""Você é um analista de inteligência de mercado B2B.
Analise o texto extraído do site da empresa "{company_name}" e retorne um JSON estruturado.

TEXTO DO SITE:
---
{text}
---

Retorne APENAS este JSON válido (sem markdown):
{{
  "emails": ["lista de e-mails de contato encontrados no texto, máximo 5"],
  "redes_sociais": {{
    "instagram": "URL do Instagram ou null",
    "facebook": "URL do Facebook ou null",
    "linkedin": "URL do LinkedIn da empresa ou null",
    "twitter": "URL do Twitter/X ou null",
    "whatsapp": "número ou link do WhatsApp ou null"
  }},
  "resumo_empresa": "O que a empresa faz em 1-2 frases claras e objetivas.",
  "diferenciais": [
    "Diferencial 1 da empresa (útil para cold call)",
    "Diferencial 2",
    "Diferencial 3"
  ]
}}

Se alguma informação não estiver disponível, use null ou lista vazia."""

    try:
        response = model.generate_content(prompt)
        raw = response.text or "{}"
        return json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r'\{.*\}', response.text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except Exception:
                pass
        return {}
    except Exception as e:
        logger.error(f"[web] Erro no Gemini: {e}")
        return {}


def _regex_fallback(text: str) -> Dict[str, Any]:
    """Extração básica via regex quando Gemini não está disponível."""
    emails = []
    for e in EMAIL_RE.findall(text):
        d = e.split("@")[-1]
        if d not in IGNORED_DOMAINS and len(e) < 100:
            emails.append(e.lower())

    socials = {}
    for key, pattern in SOCIAL_PATTERNS.items():
        m = pattern.search(text)
        socials[key] = m.group(0).rstrip("/") if m else None

    return {
        "emails": list(dict.fromkeys(emails))[:5],
        "redes_sociais": socials,
        "resumo_empresa": "",
        "diferenciais": [],
    }


def enrich_company_website(url: str, company_name: str = "") -> Dict[str, Any]:
    """
    Acessa o site da empresa, extrai texto e analisa com Gemini.
    Retorna: emails[], redes_sociais{}, resumo_empresa, diferenciais[]
    """
    empty = {
        "emails":         [],
        "redes_sociais":  {"instagram": None, "facebook": None,
                           "linkedin": None, "twitter": None, "whatsapp": None},
        "resumo_empresa": "",
        "diferenciais":   [],
    }

    if not url:
        return empty

    logger.info(f"[web] Varrendo: {url}")
    text = _fetch_text(url)
    if not text:
        return empty

    result = _analyze_with_gemini(text, company_name)
    if not result:
        result = _regex_fallback(text)

    for k, v in empty.items():
        result.setdefault(k, v)

    return result
