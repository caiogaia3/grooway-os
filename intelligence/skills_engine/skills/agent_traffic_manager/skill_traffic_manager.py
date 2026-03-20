import os
import json
from skills_engine.core import PredatorSkill


class TrafficManagerSkill(PredatorSkill):
    """
    Agente Gestor de Tráfego Sênior.
    Opera em modo COPILOTO: gera estrutura de campanha para aprovação humana antes de subir ao Google Ads.

    Input: client_icp data (segmento, cidade, budget, objetivos, etc.)
    Output: campaign_structure JSON pronto para revisão/aprovação
    """

    def __init__(self, client_icp: dict):
        # PredatorSkill espera target_url; usamos o site do cliente se disponível
        site = client_icp.get("site_url", "https://exemplo.com")
        super().__init__(site)
        self.client_icp = client_icp

    def execute(self) -> dict:
        """
        Gera estrutura de campanha Google Ads baseada no ICP do cliente.
        Retorna JSON com campanhas, grupos de anúncios, keywords e copies.
        """
        campaign_structure = self._generate_campaign_structure()

        return {
            "name": "Traffic Manager Agent",
            "mode": "copilot",
            "client_name": self.client_icp.get("nome_fantasia", ""),
            "segmento": self.client_icp.get("segmento", ""),
            "campaign_structure": campaign_structure,
            "status": "pending_review",
            "boss_briefing": self._empty_boss_briefing(),
        }

    def _generate_campaign_structure(self) -> dict:
        """
        Usa LLM para gerar estrutura completa de campanha Google Ads.
        """
        icp = self.client_icp
        prompt = self._build_prompt(icp)

        result = self._call_llm_json(prompt, temperature=0.2)

        if not result:
            return self._fallback_structure(icp)

        return result

    def _build_prompt(self, icp: dict) -> str:
        segmento = icp.get("segmento", "negócio local")
        cidade = icp.get("cidade", "")
        budget_mensal = icp.get("budget_mensal_google", 0)
        objetivo = icp.get("objetivo_principal", "gerar leads")
        publico = icp.get("publico_alvo", "")
        diferencial = icp.get("principal_diferencial", "")
        produto = icp.get("produto_servico_principal", segmento)
        nome = icp.get("nome_fantasia", "Cliente")

        budget_diario = round(budget_mensal / 30, 2) if budget_mensal else 50.0

        return f"""
Você é um Gestor de Tráfego Sênior especialista em Google Ads para negócios locais brasileiros.

DADOS DO CLIENTE:
- Empresa: {nome}
- Segmento: {segmento}
- Cidade/Região: {cidade}
- Produto/Serviço principal: {produto}
- Objetivo: {objetivo}
- Público-alvo: {publico}
- Diferencial: {diferencial}
- Budget mensal: R$ {budget_mensal}
- Budget diário calculado: R$ {budget_diario}

SUA MISSÃO:
Crie uma estrutura de campanha Google Ads completa e pronta para revisão e aprovação.
Seja específico, realista e orientado a conversão.

OUTPUT FORMAT (JSON exato, sem markdown):
{{
    "resumo_estrategico": "2-3 linhas explicando a estratégia geral",
    "campanhas": [
        {{
            "nome": "Nome da Campanha",
            "tipo": "Search",
            "objetivo": "Leads / Tráfego / Vendas",
            "budget_diario": {budget_diario},
            "estrategia_lances": "CPA alvo / ROAS alvo / CPC manual",
            "localizacao": "{cidade}",
            "idioma": "Português",
            "grupos_anuncios": [
                {{
                    "nome": "Nome do Grupo",
                    "keywords": [
                        {{"termo": "palavra-chave exata", "match_type": "exact", "intencao": "Compra"}},
                        {{"termo": "palavra-chave frase", "match_type": "phrase", "intencao": "Pesquisa"}},
                        {{"termo": "palavra-chave ampla modificada", "match_type": "broad", "intencao": "Descoberta"}}
                    ],
                    "anuncios": [
                        {{
                            "headline_1": "Título 1 (máx 30 chars)",
                            "headline_2": "Título 2 (máx 30 chars)",
                            "headline_3": "Título 3 (máx 30 chars)",
                            "description_1": "Descrição 1 (máx 90 chars)",
                            "description_2": "Descrição 2 (máx 90 chars)",
                            "url_display": "seusite.com.br/servico",
                            "cta": "Fale Agora / Solicite Orçamento / Agende Grátis"
                        }}
                    ],
                    "extensoes": {{
                        "sitelinks": ["Link 1", "Link 2", "Link 3"],
                        "callouts": ["Atendimento 24h", "Sem Taxa de Adesão"],
                        "structured_snippets": ["Serviços: X, Y, Z"]
                    }}
                }}
            ],
            "keywords_negativas": ["concorrente", "gratuito", "curso", "emprego"]
        }}
    ],
    "recomendacoes_pre_aprovacao": [
        "Verifique se a landing page tem formulário de captura",
        "Configure conversões no Google Tag Manager antes de ativar"
    ],
    "estimativas": {{
        "cpc_medio_estimado": "R$ X.XX",
        "leads_estimados_mes": "X a Y leads",
        "cpl_estimado": "R$ X.XX por lead"
    }}
}}
"""

    def _fallback_structure(self, icp: dict) -> dict:
        """Estrutura mínima quando LLM falha."""
        nome = icp.get("nome_fantasia", "Cliente")
        segmento = icp.get("segmento", "negócio")
        cidade = icp.get("cidade", "Brasil")
        budget = round(icp.get("budget_mensal_google", 1500) / 30, 2)

        return {
            "resumo_estrategico": f"Campanha de captação de leads para {nome} no segmento {segmento} em {cidade}.",
            "campanhas": [
                {
                    "nome": f"{segmento} - {cidade} - Leads",
                    "tipo": "Search",
                    "objetivo": "Leads",
                    "budget_diario": budget,
                    "estrategia_lances": "CPC manual",
                    "localizacao": cidade,
                    "idioma": "Português",
                    "grupos_anuncios": [
                        {
                            "nome": "Serviço Principal",
                            "keywords": [
                                {"termo": f"{segmento} {cidade}", "match_type": "exact", "intencao": "Compra"},
                                {"termo": f"melhor {segmento} {cidade}", "match_type": "phrase", "intencao": "Compra"},
                            ],
                            "anuncios": [
                                {
                                    "headline_1": f"{segmento} em {cidade}",
                                    "headline_2": "Solicite seu Orçamento",
                                    "headline_3": "Atendimento Rápido",
                                    "description_1": f"Especialistas em {segmento}. Orçamento grátis.",
                                    "description_2": "Entre em contato agora e fale com um especialista.",
                                    "url_display": "",
                                    "cta": "Solicite Orçamento"
                                }
                            ],
                            "extensoes": {
                                "sitelinks": [],
                                "callouts": [],
                                "structured_snippets": []
                            }
                        }
                    ],
                    "keywords_negativas": ["gratuito", "curso", "emprego", "vagas"]
                }
            ],
            "recomendacoes_pre_aprovacao": [
                "Verifique se a landing page tem formulário de captura.",
                "Configure conversões no Google Tag Manager antes de ativar."
            ],
            "estimativas": {
                "cpc_medio_estimado": "R$ 2,50",
                "leads_estimados_mes": "15 a 40 leads",
                "cpl_estimado": "R$ 37,50 por lead"
            }
        }
