from skills_engine.core import PredatorSkill
import os
import json
from google import genai
from google.genai import types

class DesignTranslationSkill(PredatorSkill):
    def __init__(self, target_url, params=None):
        super().__init__(target_url)
        self.params = params or {}
        
        from dotenv import load_dotenv
        load_dotenv(dotenv_path=".env")
        load_dotenv(dotenv_path="../raio-x-digital/.env.local")
        
        self.api_key = os.getenv("GEMINI_API_KEY")

    def execute(self, previous_results_context=None) -> dict:
        """
        O Agente 10 é o General do Design & Arquiteto Visionário.
        Ele atua como o Comandante Supremo da apresentação final, traduzindo
        toda a inteligência bruta acumulada para a "Linguagem de Dinheiro".
        """
        report = {
            "name": "O General do Design & Arquiteto Visionário",
            "score": 100,
            "findings": {
                "lente_de_retina_roi": "",
                "scanner_autoridade_visual": "",
                "tradutor_de_dinheiro": "",
                "visao_futuro_lucro": "",
                "veredito_do_general": ""
            }
        }

        if not self.api_key:
            return report

        # Consolida inteligência de todos os agentes do front
        full_context = ""
        score_sum = 0
        agent_count = 0
        if previous_results_context:
            for agent_name, agent_data in previous_results_context.items():
                findings = agent_data.get('findings', {})
                score = agent_data.get('score', 0)
                score_sum += score
                agent_count += 1
                full_context += f"\n--- AGENTE: {agent_name} (Score: {score}%) ---\n"
                full_context += f"Findings: {json.dumps(findings, ensure_ascii=False)}\n"

        avg_score = int(score_sum / agent_count) if agent_count > 0 else 0
        company_name = self.params.get("companyName", "Empresa Alvo")
        
        prompt = f"""
        PERSONA: GENERAL DO DESIGN & ARQUITETO VISIONÁRIO (Agente 10).
        ARSENAL: 'Lente de Retina para ROI', 'Scanner de Autoridade Visual', 'Tradutor GroowayOS'.
        CONTEXTO: O dossiê revelou uma eficácia média de {avg_score}% para a empresa {company_name}.

        DADOS BRUTOS DO FRONT:
        {full_context}

        SUA MISSÃO TÁTICA COMO GENERAL:
        1. LENTE DE RETINA PARA ROI: Traduza a falha estética em perda de autoridade e fuga de leads 'High Ticket'.
        2. SCANNER DE AUTORIDADE: Por que o design atual parece amador e como isso 'tranca a porta' para faturamentos maiores?
        3. TRADUTOR DE DINHEIRO: Crie a tabela comparativa (Estado Atual vs Estado GroowayOS) focada em LUCRO.
        4. VEREDITO DO GENERAL: O xeque-mate final. Use tom agressivo, consultivo e autoritário.

        MUNIÇÃO: 'Hemorragia de Imagem', 'Comoditização Visual', 'Upgrade para Elite', 'Linguagem de Dinheiro'.

        JSON OUTPUT FORMAT:
        {{
            "lente_de_retina_roi": "Análise da fuga de capital pela imagem amadora",
            "scanner_autoridade_visual": "Veredito sobre a autoridade visual atual",
            "tradutor_de_dinheiro": "Tabela comparativa de faturamento/ROI estimada",
            "visao_futuro_lucro": "Cenário de dominação regional após GroowayOS",
            "veredito_do_general": "Veredito final (xeque-mate)"
        }}
        """

        try:
            json_data = self._call_llm_json(prompt)
            
            if json_data:
                report["findings"] = json_data
                report["internal_briefing_for_boss"] = json_data.get("veredito_do_general", "")
                
        except Exception as e:
            print(f"  [O General] Erro: {e}")

        return report

