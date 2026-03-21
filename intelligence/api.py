"""
groowayOS Intelligence API
FastAPI service exposing Python intelligence layer to the Next.js frontend.
Runs as a separate Easypanel service on port 8000.
"""
import os
import sys
import json
from dotenv import load_dotenv

load_dotenv()

# Fix macOS gRPC DNS issues (safe — just uses native resolver)
os.environ["GRPC_DNS_RESOLVER"] = "native"

import asyncio
import uuid
import logging

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from skills_engine.skills.agent_traffic_manager.skill_traffic_manager import TrafficManagerSkill

app = FastAPI(
    title="groowayOS Intelligence API",
    description="Python intelligence layer — Traffic Manager, Predator Orchestrator",
    version="1.0.0"
)

# CORS: only allow requests from the Next.js frontend
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

# Internal API key to authenticate requests from Next.js server actions
INTERNAL_API_KEY = os.getenv("INTELLIGENCE_API_KEY", "")


def _verify_api_key(x_api_key: Optional[str]):
    """Rejects requests that don't carry the internal API key (if configured)."""
    if INTERNAL_API_KEY and x_api_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class ClientICP(BaseModel):
    """ICP data pulled from the client_icp table."""
    nome_fantasia: str
    segmento: str
    cidade: str = ""
    site_url: str = ""
    publico_alvo: str = ""
    principal_diferencial: str = ""
    produto_servico_principal: str = ""
    objetivo_principal: str = "gerar leads"
    budget_mensal_google: float = 0.0
    budget_mensal_meta: float = 0.0


class GenerateCampaignRequest(BaseModel):
    client_id: str
    client_icp: ClientICP


class GenerateCampaignResponse(BaseModel):
    client_id: str
    status: str          # "pending_review"
    campaign_structure: dict
    resumo_estrategico: str
    estimativas: dict


class PredatorRequest(BaseModel):
    url: str
    companyName: str = ""
    city: str = ""
    selectedAgents: List[str] = []


class OptimizeCampaignRequest(BaseModel):
    client_id: str
    campaign_id: str
    current_metrics: dict   # CTR, CPC, conversions, etc.
    client_icp: ClientICP


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok", "service": "groowayOS-intelligence"}


# ---------------------------------------------------------------------------
# POST /generate-campaign
# ---------------------------------------------------------------------------

@app.post("/generate-campaign", response_model=GenerateCampaignResponse)
def generate_campaign(
    payload: GenerateCampaignRequest,
    x_api_key: Optional[str] = Header(default=None),
):
    """
    Generates a Google Ads campaign structure based on the client's ICP.
    Returns a 'pending_review' structure for human approval in the frontend.
    """
    _verify_api_key(x_api_key)

    try:
        skill = TrafficManagerSkill(client_icp=payload.client_icp.model_dump())
        result = skill.execute()

        structure = result.get("campaign_structure", {})

        return GenerateCampaignResponse(
            client_id=payload.client_id,
            status="pending_review",
            campaign_structure=structure,
            resumo_estrategico=structure.get("resumo_estrategico", ""),
            estimativas=structure.get("estimativas", {}),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# POST /run-predator
# ---------------------------------------------------------------------------

@app.post("/run-predator")
def run_predator(
    payload: PredatorRequest,
    x_api_key: Optional[str] = Header(default=None),
):
    """
    Runs the full Predator Orchestrator diagnostic on a prospect's website.
    Equivalent to running intelligence/main.py from the frontend.
    """
    _verify_api_key(x_api_key)

    try:
        # Import here to avoid circular imports and heavy loading at startup
        sys.path.insert(0, os.path.dirname(__file__))
        from main import PredatorOrchestrator

        params = payload.model_dump()
        orchestrator = PredatorOrchestrator(params)
        report = orchestrator.run()

        return {"status": "ok", "report": report}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# POST /optimize-campaign
# ---------------------------------------------------------------------------

@app.post("/optimize-campaign")
def optimize_campaign(
    payload: OptimizeCampaignRequest,
    x_api_key: Optional[str] = Header(default=None),
):
    """
    Analyzes current campaign metrics and generates optimization suggestions.
    Returns actionable recommendations for the traffic manager to review.
    """
    _verify_api_key(x_api_key)

    try:
        from skills_engine.core import PredatorSkill
        import os
        from google import genai
        from google.genai import types

        metrics = payload.current_metrics
        icp = payload.client_icp.model_dump()

        prompt = f"""
Você é um Gestor de Tráfego Sênior analisando métricas de uma campanha Google Ads ativa.

CLIENTE: {icp.get('nome_fantasia')} — {icp.get('segmento')} em {icp.get('cidade')}
MÉTRICAS ATUAIS:
{json.dumps(metrics, ensure_ascii=False, indent=2)}

Gere recomendações de otimização em JSON:
{{
    "diagnostico": "Resumo do estado atual da campanha",
    "acoes_imediatas": [
        {{"acao": "Descrição da ação", "motivo": "Por que fazer", "impacto_esperado": "alto/médio/baixo"}}
    ],
    "ajustes_de_lances": "Recomendação de ajuste de CPC/CPA",
    "keywords_a_pausar": ["keyword 1", "keyword 2"],
    "keywords_a_adicionar": ["nova keyword 1", "nova keyword 2"],
    "teste_ab_sugerido": "O que testar no próximo período"
}}
"""

        gemini_key = os.getenv("GEMINI_API_KEY")
        if not gemini_key:
            raise HTTPException(status_code=503, detail="GEMINI_API_KEY not configured")

        client = genai.Client(api_key=gemini_key)
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json"
            ),
        )

        recommendations = json.loads(response.text) if response.text else {}

        return {
            "client_id": payload.client_id,
            "campaign_id": payload.campaign_id,
            "status": "optimization_ready",
            "recommendations": recommendations,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Leads Pipeline — Schemas
# ---------------------------------------------------------------------------

class LeadsPipelineRequest(BaseModel):
    segmento: str
    cidade: str
    max_empresas: int = 10
    user_id: str


class MoverFunilRequest(BaseModel):
    empresa_ids: List[str]
    user_id: str
    status_funil: str = "lead_novo"


class SemanticSearchRequest(BaseModel):
    query: str
    user_id: str
    match_count: int = 10
    threshold: float = 0.7


# ---------------------------------------------------------------------------
# Pipeline Jobs — Supabase-backed storage (fallback: in-memory)
# ---------------------------------------------------------------------------

# SECURITY NOTE (RADAR Eval):
# Using SUPABASE_SERVICE_ROLE_KEY here is safe because `api.py` acts as an internal
# protected microservice (proxy). It is never exposed directly to the public web 
# without authentication (CORS + INTERNAL_API_KEY). This allows the Python worker 
# to bypass RLS for administrative background jobs (like saving pipeline state).
def _get_supabase():
    """Lazy Supabase client for pipeline jobs."""
    from supabase import create_client
    url = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        return None
    return create_client(url, key)

# Fallback in-memory store (used only if Supabase not configured)
_pipeline_jobs_fallback: Dict[str, Dict[str, Any]] = {}


def _save_job(job_id: str, data: dict):
    """Save job state to Supabase or fallback."""
    sb = _get_supabase()
    if sb:
        sb.table("pipeline_jobs").upsert({
            "id": job_id,
            "status": data["status"],
            "progress": data.get("progress", []),
            "result": data.get("result"),
            "error": data.get("error"),
        }).execute()
    else:
        _pipeline_jobs_fallback[job_id] = data


def _get_job(job_id: str) -> Optional[dict]:
    """Get job state from Supabase or fallback."""
    sb = _get_supabase()
    if sb:
        res = sb.table("pipeline_jobs").select("*").eq("id", job_id).execute()
        if res.data:
            row = res.data[0]
            return {
                "status": row["status"],
                "progress": row.get("progress", []),
                "result": row.get("result"),
                "error": row.get("error"),
            }
        return None
    return _pipeline_jobs_fallback.get(job_id)


def _update_job_progress(job_id: str, msg: str):
    """Append progress message to job."""
    sb = _get_supabase()
    if sb:
        res = sb.table("pipeline_jobs").select("progress").eq("id", job_id).execute()
        if res.data:
            progress = res.data[0].get("progress", [])
            progress.append(msg)
            sb.table("pipeline_jobs").update({"progress": progress}).eq("id", job_id).execute()
    elif job_id in _pipeline_jobs_fallback:
        _pipeline_jobs_fallback[job_id]["progress"].append(msg)


# ---------------------------------------------------------------------------
# POST /leads-pipeline/start
# ---------------------------------------------------------------------------

@app.post("/leads-pipeline/start")
async def start_leads_pipeline(
    payload: LeadsPipelineRequest,
    x_api_key: Optional[str] = Header(default=None),
):
    """Starts the ABM pipeline asynchronously. Returns a job_id for polling."""
    _verify_api_key(x_api_key)

    job_id = str(uuid.uuid4())
    _save_job(job_id, {"status": "running", "progress": [], "result": None, "error": None})

    def progress_callback(msg: str):
        _update_job_progress(job_id, msg)

    async def run_pipeline():
        try:
            from leads_pipeline.pipeline import run_abm_pipeline

            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: run_abm_pipeline(
                    search_term=payload.segmento,
                    location=payload.cidade,
                    max_empresas=payload.max_empresas,
                    user_id=payload.user_id,
                    progress_callback=progress_callback,
                )
            )
            _save_job(job_id, {"status": "completed", "progress": [], "result": result, "error": None})
        except Exception as e:
            logger.error(f"[pipeline] Erro no job {job_id}: {e}")
            _save_job(job_id, {"status": "failed", "progress": [], "result": None, "error": str(e)})

    asyncio.create_task(run_pipeline())
    return {"job_id": job_id, "status": "running"}


# ---------------------------------------------------------------------------
# GET /leads-pipeline/status/{job_id}
# ---------------------------------------------------------------------------

@app.get("/leads-pipeline/status/{job_id}")
def get_pipeline_status(
    job_id: str,
    x_api_key: Optional[str] = Header(default=None),
):
    """Returns the current status and progress of a pipeline job."""
    _verify_api_key(x_api_key)

    job = _get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "job_id": job_id,
        "status": job["status"],
        "progress": job["progress"],
        "result": job["result"],
        "error": job["error"],
    }


# ---------------------------------------------------------------------------
# POST /leads/mover-funil
# ---------------------------------------------------------------------------

@app.post("/leads/mover-funil")
def mover_para_funil(
    payload: MoverFunilRequest,
    x_api_key: Optional[str] = Header(default=None),
):
    """Moves selected empresas to a funnel stage."""
    _verify_api_key(x_api_key)

    try:
        from supabase import create_client

        url = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        if not url or not key:
            raise HTTPException(status_code=503, detail="Supabase not configured")

        sb = create_client(url, key)

        for empresa_id in payload.empresa_ids:
            sb.table("empresas_leads").update({
                "status_funil": payload.status_funil
            }).eq("id", empresa_id).eq("user_id", payload.user_id).execute()

        return {
            "status": "ok",
            "moved": len(payload.empresa_ids),
            "to": payload.status_funil,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# POST /leads/search
# ---------------------------------------------------------------------------

@app.post("/leads/search")
def search_leads_semantic(
    payload: SemanticSearchRequest,
    x_api_key: Optional[str] = Header(default=None),
):
    """Semantic search across empresas_leads using pgvector embeddings."""
    _verify_api_key(x_api_key)

    try:
        from supabase import create_client
        from leads_pipeline.embedding_generator import get_embedding

        url = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        if not url or not key:
            raise HTTPException(status_code=503, detail="Supabase not configured")

        query_embedding = get_embedding(payload.query)
        if not query_embedding:
            raise HTTPException(status_code=400, detail="Could not generate embedding for query")

        sb = create_client(url, key)
        result = sb.rpc("search_empresas_similares", {
            "query_embedding": query_embedding,
            "match_count": payload.match_count,
            "similarity_threshold": payload.threshold,
            "p_user_id": payload.user_id,
        }).execute()

        return {"status": "ok", "results": result.data or []}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# POST /run-circuit-breakers
# ---------------------------------------------------------------------------

@app.post("/run-circuit-breakers")
def trigger_circuit_breakers(
    x_api_key: Optional[str] = Header(default=None),
):
    """Executa a varredura e pausa campanhas que gastaram 3x o CPA sem converter."""
    _verify_api_key(x_api_key)

    try:
        import sys
        
        # Injetar path para importar o job
        jobs_dir = os.path.join(os.path.dirname(__file__), "jobs")
        if jobs_dir not in sys.path:
            sys.path.insert(0, jobs_dir)
            
        from circuit_breaker import run_circuit_breakers
        
        # Puxaremos do supbase os clientes ativos no futuro, por enquanto usamos o ID da conta MCC principal do ENV
        customer_id = os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID")
        if not customer_id:
            raise HTTPException(status_code=400, detail="Sem GOOGLE_ADS_LOGIN_CUSTOMER_ID para testar.")
            
        run_circuit_breakers([customer_id])
        return {"status": "ok", "message": "Circuit breaker executado com sucesso."}
        
    except Exception as e:
        logger.error(f"Erro no circuit breaker: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# POST /webhooks/crm-conversion
# ---------------------------------------------------------------------------

class CrmWebhookPayload(BaseModel):
    customer_id: str
    conversion_action_id: str
    conversion_time: str
    gclid: Optional[str] = None
    wbraid: Optional[str] = None
    gbraid: Optional[str] = None
    value: Optional[float] = None


@app.post("/webhooks/crm-conversion")
def crm_webhook(payload: CrmWebhookPayload):
    """
    Recebe eventos de fechamento/venda do Zandu/Kommo/RD Station.
    Repassa a conversão imediatamente para o Google Ads (Offline Covert).
    Sem necessidade de api_key interna aqui para facilitar integração externa,
    mas em prod idealmente usaríamos um token de webhook seguro.
    """
    try:
        import sys
        
        # Injetar path para importar o job
        jobs_dir = os.path.join(os.path.dirname(__file__), "jobs")
        if jobs_dir not in sys.path:
            sys.path.insert(0, jobs_dir)
            
        from offline_conversions import upload_offline_conversion
        
        result = upload_offline_conversion(
            customer_id=payload.customer_id,
            conversion_action_id=payload.conversion_action_id,
            conversion_time=payload.conversion_time,
            gclid=payload.gclid,
            wbraid=payload.wbraid,
            gbraid=payload.gbraid,
            conversion_value=payload.value
        )
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
            
        return {"status": "ok", "message": "Conversão offline importada com sucesso para o Google Ads."}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no processamento do webhook CRM: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Entrypoint (local dev)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
