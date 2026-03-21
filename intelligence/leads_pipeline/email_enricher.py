"""
email_enricher.py
Enriquecimento de e-mail corporativo via Hunter.io API.

Fluxo:
  1. find_domain_by_company() — descobre o domínio corporativo
  2. find_email() — busca e-mail de um contato específico (nome + domínio)
"""

import os
import logging
from typing import Optional, Tuple

import requests

logger = logging.getLogger(__name__)

HUNTER_BASE = "https://api.hunter.io/v2"


def _get_api_key() -> str:
    key = os.getenv("HUNTER_API_KEY", "").strip()
    if not key:
        raise RuntimeError("HUNTER_API_KEY não configurado")
    return key


def find_domain_by_company(company_name: str) -> Optional[str]:
    """Descobre o domínio corporativo via Hunter /domain-search."""
    if not company_name:
        return None

    try:
        resp = requests.get(
            f"{HUNTER_BASE}/domain-search",
            params={
                "company": company_name,
                "limit": 1,
                "api_key": _get_api_key(),
            },
            timeout=15,
        )
        if resp.status_code != 200:
            return None

        data = resp.json().get("data", {})
        domain = data.get("domain")
        if domain:
            logger.info(f"[hunter] Domínio de '{company_name}': {domain}")
        return domain

    except Exception as e:
        logger.error(f"[hunter] Erro ao buscar domínio: {e}")
        return None


def find_email(
    first_name: str,
    last_name: str,
    domain: str,
) -> Tuple[Optional[str], int]:
    """
    Busca e-mail corporativo via Hunter /email-finder.
    Retorna (email | None, confidence_score 0-100).
    """
    if not domain or not first_name:
        return None, 0

    try:
        resp = requests.get(
            f"{HUNTER_BASE}/email-finder",
            params={
                "domain":     domain,
                "first_name": first_name,
                "last_name":  last_name,
                "api_key":    _get_api_key(),
            },
            timeout=15,
        )
        if resp.status_code != 200:
            return None, 0

        data = resp.json().get("data", {})
        email = data.get("email")
        score = data.get("score", 0)

        if email:
            logger.info(f"[hunter] E-mail encontrado: {email} (score: {score}/100)")

        return email, score

    except Exception as e:
        logger.error(f"[hunter] Erro ao buscar e-mail: {e}")
        return None, 0
