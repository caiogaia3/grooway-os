"""
linktree_resolver.py
Resolve agregadores de links (linktr.ee, bento.me, etc.) para encontrar site real e WhatsApp.
"""

import logging

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

IGNORED_SOCIALS = {
    "instagram.com", "facebook.com", "fb.me", "youtube.com", "youtu.be",
    "tiktok.com", "linkedin.com", "twitter.com", "x.com", "linktr.ee",
    "spotify.com", "bento.me", "beacons.ai", "taplink.cc",
}


def resolve_link_aggregator(url: str) -> dict:
    """Busca site real e WhatsApp dentro de páginas de Linktree."""
    result = {"website_url": None, "whatsapp_url": None}
    try:
        if not url.startswith("http"):
            url = "https://" + url

        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        hrefs = [a.get('href') for a in soup.find_all('a', href=True) if a.get('href')]

        for href in hrefs:
            hlower = href.lower()
            if "wa.me/" in hlower or "api.whatsapp.com/" in hlower or "whatsapp.com/send" in hlower:
                result["whatsapp_url"] = href
                continue
            if href.startswith("http") or href.startswith("https"):
                is_social = any(s in hlower for s in IGNORED_SOCIALS)
                if not is_social and not result["website_url"]:
                    result["website_url"] = href

        return result
    except Exception as e:
        logger.warning(f"[linktree] Erro ao resolver {url}: {e}")
        return result
