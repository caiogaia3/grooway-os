"""
social_search_enricher.py
Busca perfil de Instagram de uma empresa via DuckDuckGo.
Fallback quando Google Maps e X-Ray não encontram perfil social.
"""

import logging

logger = logging.getLogger(__name__)

try:
    from duckduckgo_search import DDGS
    DDG_AVAILABLE = True
except ImportError:
    DDG_AVAILABLE = False


def find_instagram_via_search(company_name: str, city: str) -> str:
    """Busca perfil de Instagram via DuckDuckGo."""
    if not DDG_AVAILABLE:
        logger.warning("[busca extra] duckduckgo_search não instalado.")
        return ""

    query = f"{company_name} {city} instagram"
    logger.info(f"[busca extra] Buscando '{query}' na web...")

    try:
        results = DDGS().text(query, max_results=3)
        for r in results:
            url = r.get("href", "")
            if "instagram.com/" in url:
                clean_url = url.split("?")[0].rstrip("/")
                if "/p/" in clean_url or "/reel/" in clean_url or "/dir/" in clean_url:
                    continue
                return clean_url
    except Exception as e:
        logger.warning(f"[busca extra] Erro na busca DDG: {e}")

    return ""
