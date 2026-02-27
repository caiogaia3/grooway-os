from skills_engine.core import PredatorSkill
import os
import json
from google import genai
from google.genai import types

class CloserSkill(PredatorSkill):
    """
    O SNIPER: Especialista em Fechamento Comercial.
    O último agente da cadeia. Ele pega a Proposta de Valor e o Diagnóstico
    e cria o "Golpe de Misericórdia": um pitch de fechamento focado em
    urgência, escassez e quebra de objeções finais.
    """
    def __init__(self, target_url, params=None):
        super().__init__(target_url)
        self.params = params or {}

        from dotenv import load_dotenv
        load_dotenv(dotenv_path=".env")
        load_dotenv(dotenv_path="../raio-x-digital/.env.local")

        self.api_key = os.getenv("GEMINI_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

    def execute(self) -> dict:
        report = {
            "name": "The Closer (Sales Sniper)",
            "score": 100,
            "findings": {
                "analise_psicologica": "",
                "quebra_objecoes": "",
                "gatilhos_urgencia": "",
                "gran_finale_pitch": "",
                "cta_final_irrecusavel": ""
            },
            "critical_pains": []
        }

        pains = report.get("critical_pains", [])
        if not isinstance(pains, list):
            pains = []
            report["critical_pains"] = pains

        if not self.api_key:
            pains.append("API Key Gemini não configurada.")
            return report

        try:
            company_name = self.params.get("companyName", "Empresa Diagnosticada")
            city = self.params.get("city", "sua região")

            # ---------------------------------------------------
            # CONSOLIDAÇÃO DE INTELIGÊNCIA DE BACKSTAGE
            # ---------------------------------------------------
            backstage_briefing_boss = ""
            backstage_briefing_alchemist = ""
            value_prop_summary = ""

            if hasattr(self, 'previous_results_context') and self.previous_results_context:
                for agent_name, agent_data in self.previous_results_context.items():
                    # Captura briefings internos se existirem
                    if agent_data.get("internal_briefing_for_boss"):
                        backstage_briefing_boss += f"\n- [{agent_name}]: {agent_data['internal_briefing_for_boss']}"
                    
                    if agent_data.get("internal_briefing_for_alchemist"):
                        backstage_briefing_alchemist += f"\n- [{agent_name}]: {agent_data['internal_briefing_for_alchemist']}"
                    
                    # Captura a proposta de valor se for o Alquimista
                    if "Alchemist" in agent_name or "Alquimista" in agent_name or "Value Proposition" in agent_name:
                        value_prop_summary = json.dumps(agent_data.get("findings", {}), ensure_ascii=False)

            client = genai.Client(api_key=self.api_key)

            prompt = f"""
            PERSONA:
            Você é o 'SNIPER DE FECHAMENTO' (Agente 09) da GroowayOS. Sua missão é o Fechamento de Alto Ticket.
            Você é o agente final. Enquanto os outros agentes auditaram e o Alquimista refinou a oferta, você dá o 'Tiro de Misericórdia' comercial.
            
            INTELIGÊNCIA DE BACKSTAGE (MUNIÇÃO ESTRATÉGICA):
            Briefing do Alquimista (Munição Sniper):
            {backstage_briefing_alchemist}
            
            PROPOSTA DE VALOR REFINADA:
            {value_prop_summary}
            
            SUA MISSÃO:
            1. RIFLE DE PRECISÃO DE ROI: Focando nas dores cruéis encontradas, mostre como o ROI é inevitável.
            2. INJEÇÃO DE LUCRO CESSANTE: Use a sugestão do Alchemist para criar um pitch que force o fechamento agora.
            3. AGRESSIVIDADE COMERCIAL: Cada minuto que o dono da empresa {company_name} passa sem fechar com a Grooway, ele está financiando o crescimento da concorrência em {city}.
            
            ESTRUTURA DE SAÍDA (JSON):
            {{
                "analise_psicologica": "Por que o dono está inseguro e como apertar o botão do medo de perder dinheiro.",
                "veredito_xeque_mate": "O argumento final que mata qualquer dúvida técnica.",
                "quebra_objecoes_letal": "Como rebater o 'está caro' ou 'ver depois' com os dados como arma.",
                "gatilhos_de_escassez": "Por que só podemos atender 1 empresa desse setor em {city}.",
                "pitch_whatsapp_sniper": "Um script pronto para copiar e colar para fechar o negócio agora.",
                "sniper_verdict": "Veredito final de 2-3 linhas para o dossiê (O 'Xeque-Mate')."
            }}
            """

            json_data = self._call_llm_json(prompt)

            if json_data:
                report["findings"] = json_data
                
                verdict = json_data.get("sniper_verdict", "")
                if verdict:
                    report["boss_briefing"] = {
                        "recomendacoes": [f"AO SNIPER: {verdict}"],
                        "pontos_positivos": [],
                        "pontos_negativos": []
                    }
            else:
                pains.append("O Sniper ficou em silêncio. Falha na mira da IA.")

        except Exception as e:
            error_str = str(e)
            pains.append(f"Erro no fechamento: {e}")

        return report
