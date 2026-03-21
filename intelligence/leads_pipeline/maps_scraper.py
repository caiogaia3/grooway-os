"""
maps_scraper.py
Mapeamento de empresas via Google Maps usando Apify.

Actor: compass/crawler-google-places
  - Extrai: nome, categoria, endereço, telefone, nota, reviews, site, place_id
  - Plano gratuito: ~200 resultados/execução
"""

import os
import logging
from typing import List, Dict, Any

from apify_client import ApifyClient

logger = logging.getLogger(__name__)

ACTOR_ID = "compass/crawler-google-places"


def _get_client() -> ApifyClient:
    token = os.getenv("APIFY_API_TOKEN", "").strip()
    if not token:
        raise RuntimeError("APIFY_API_TOKEN não configurado")
    return ApifyClient(token)


def _parse_place(item: Dict[str, Any]) -> Dict[str, Any]:
    """Normaliza um item bruto do Google Maps para o schema interno."""
    nota_raw = item.get("totalScore")
    nota = float(round(float(nota_raw), 1)) if nota_raw is not None else None

    return {
        "nome":            item.get("title", "").strip(),
        "categoria":       item.get("categoryName", ""),
        "endereco":        item.get("address", "") or "",
        "cidade":          item.get("city", "") or "",
        "estado":          item.get("state", "") or "",
        "cep":             item.get("postalCode", "") or "",
        "telefone":        item.get("phone", ""),
        "nota":            nota,
        "total_reviews":   item.get("reviewsCount"),
        "google_maps_url": item.get("url", ""),
        "place_id":        item.get("placeId", ""),
        "website_url":     item.get("website", ""),
        "instagram_url":   item.get("instagram", ""),
        "facebook_url":    item.get("facebook", ""),
        "linkedin_url":    item.get("linkedin", ""),
    }


def search_google_maps(
    search_term: str,
    location: str,
    max_results: int = 20,
) -> List[Dict[str, Any]]:
    """
    Busca empresas no Google Maps via Apify compass/crawler-google-places.

    Args:
        search_term: Tipo de negócio (ex: "Agências de Marketing")
        location:    Cidade/estado (ex: "São Paulo")
        max_results: Máximo de resultados (default: 20)

    Returns:
        Lista de empresas normalizadas.
    """
    query = f"{search_term} em {location}"
    logger.info(f"[maps] Buscando: '{query}' (max: {max_results})")

    client = _get_client()

    run_input = {
        "searchStringsArray": [query],
        "maxCrawledPlacesPerSearch": max_results,
        "language":           "pt-BR",
        "countryCode":        "br",
        "includeReviews":     False,
        "includeImages":      False,
        "scrapeContacts":     True,
    }

    try:
        run = client.actor(ACTOR_ID).call(run_input=run_input)
    except Exception as e:
        logger.error(f"[maps] Erro ao chamar Actor: {e}")
        return []

    if run.get("status") != "SUCCEEDED":
        logger.error(f"[maps] Actor falhou (status={run.get('status')})")
        return []

    items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
    if not items:
        logger.warning("[maps] Nenhum resultado retornado.")
        return []

    empresas = [_parse_place(item) for item in items]
    logger.info(f"[maps] {len(empresas)} empresa(s) encontrada(s).")
    return empresas
