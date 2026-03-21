"""
employee_finder.py
Descoberta de tomadores de decisão via LinkedIn X-Ray (Google Search + Apify).

Query: site:linkedin.com/in/ ("Gerente" OR "Diretor" OR "CEO") "Nome da Empresa"
Retorna: [{ nome, cargo_inferido, linkedin_url }]
"""

import os
import re
import logging
from typing import List, Dict, Any

from apify_client import ApifyClient

logger = logging.getLogger(__name__)

GOOGLE_SEARCH_ACTOR = "apify/google-search-scraper"
SENIOR_TITLES = ["Gerente", "Diretor", "CEO", "CFO", "CTO", "CMO", "Fundador", "Sócio", "Head", "VP"]


def _get_client() -> ApifyClient:
    token = os.getenv("APIFY_API_TOKEN", "").strip()
    if not token:
        raise RuntimeError("APIFY_API_TOKEN não configurado")
    return ApifyClient(token)


def _build_query(company_name: str) -> str:
    titles_or = " OR ".join(f'"{t}"' for t in SENIOR_TITLES)
    return f'site:linkedin.com/in/ ({titles_or}) "{company_name}"'


def _parse_employee_result(item: Dict[str, Any]) -> Dict[str, Any]:
    """Extrai nome, cargo e URL do LinkedIn a partir de um resultado do Google."""
    title = item.get("title", "")
    url = item.get("url", "")
    description = item.get("description", "") or item.get("snippet", "")

    if "linkedin.com/in/" not in url.lower():
        return {}

    clean_title = re.sub(r'\s*\|\s*LinkedIn.*$', '', title, flags=re.I).strip()
    clean_title = re.sub(r'\s*–\s*LinkedIn.*$', '', clean_title, flags=re.I).strip()

    parts = re.split(r'\s[-–|]\s|\s[-–]\s', clean_title)
    name = parts[0].strip() if parts else "Desconhecido"

    cargo = ""
    if len(parts) > 1:
        cargo = parts[1].strip()
    else:
        for title_kw in SENIOR_TITLES:
            if title_kw.lower() in description.lower():
                cargo = title_kw
                break

    if not name or len(name) < 3:
        return {}

    return {
        "nome":           name,
        "cargo_inferido": cargo,
        "linkedin_url":   url.split("?")[0],
    }


def find_employees(company_name: str, max_results: int = 10) -> List[Dict[str, Any]]:
    """Busca tomadores de decisão no LinkedIn via Google X-Ray."""
    if not company_name or len(company_name) < 3:
        return []

    query = _build_query(company_name)
    logger.info(f"[xray] Query: {query}")

    client = _get_client()

    run_input = {
        "queries":          query,
        "maxPagesPerQuery": 1,
        "resultsPerPage":   max_results,
        "languageCode":     "pt-BR",
        "countryCode":      "br",
        "customDataFunction": "",
    }

    try:
        run = client.actor(GOOGLE_SEARCH_ACTOR).call(run_input=run_input)
    except Exception as e:
        logger.error(f"[xray] Erro ao chamar Actor: {e}")
        return []

    if run.get("status") != "SUCCEEDED":
        logger.error(f"[xray] Actor falhou (status={run.get('status')})")
        return []

    items = list(client.dataset(run["defaultDatasetId"]).iterate_items())

    employees = []
    for item in items:
        organic = item.get("organicResults", []) or [item]
        for result in organic:
            parsed = _parse_employee_result(result)
            if parsed and parsed not in employees:
                employees.append(parsed)

    logger.info(f"[xray] {len(employees)} tomador(es) encontrado(s) para '{company_name}'.")
    return employees
