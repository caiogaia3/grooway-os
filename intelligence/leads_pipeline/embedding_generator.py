"""
embedding_generator.py
Gera embeddings com Gemini text-embedding-004 e salva no pgvector (Supabase).
"""

import os
import logging
from typing import Optional, List

logger = logging.getLogger(__name__)

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


def get_embedding(text: str) -> Optional[List[float]]:
    """Gera embedding de 768 dimensões usando Gemini text-embedding-004."""
    if not GEMINI_AVAILABLE or not text or not text.strip():
        return None

    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key:
        return None

    genai.configure(api_key=key)

    try:
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text.strip(),
            task_type="retrieval_document",
        )
        embedding = result.get("embedding")
        if embedding and len(embedding) == 768:
            return embedding
        return None
    except Exception as e:
        logger.error(f"[embedding] Erro ao gerar embedding: {e}")
        return None


def generate_and_store_embedding(supabase_client, empresa_id: str, resumo: str) -> bool:
    """Gera embedding do resumo e salva na coluna `embedding` da empresa."""
    if not resumo or not resumo.strip():
        return False

    embedding = get_embedding(resumo)
    if not embedding:
        return False

    if not supabase_client:
        return False

    try:
        supabase_client.table("empresas_leads").update(
            {"embedding": embedding}
        ).eq("id", empresa_id).execute()
        logger.info(f"[embedding] Embedding salvo para empresa {empresa_id[:8]}...")
        return True
    except Exception as e:
        logger.error(f"[embedding] Erro ao salvar embedding: {e}")
        return False
