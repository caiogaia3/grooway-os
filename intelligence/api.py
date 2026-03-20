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

# Fix macOS SSL/gRPC issues
os.environ["GRPC_DNS_RESOLVER"] = "native"
import ssl
try:
    ssl._create_default_https_context = ssl._create_unverified_context
except AttributeError:
    pass

from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

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
# Entrypoint (local dev)
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
