from skills_engine.core import PredatorSkill
import os
import json
from google import genai
from google.genai import types

class SeniorAnalystSkill(PredatorSkill):
    def __init__(self, target_url, params=None):
        super().__init__(target_url)
        self.params = params or {}
        
        from dotenv import load_dotenv
        load_dotenv(dotenv_path=".env")
        load_dotenv(dotenv_path="../raio-x-digital/.env.local")
        
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

    def execute(self) -> dict:
        """
        O BOSS: CMO (Chief Marketing Officer) de nível A.
        Recebe o boss_briefing de TODOS os agentes anteriores e cruza os dados
        para gerar o diagnóstico final com pontos positivos, negativos,
        brechas de diferenciação e plano comercial de serviços recomendados.
        """
        # --- BRIEFING LOCAL ---
        b_neg = []
        b_pos = []
        b_rec = []
        
        # --- FINDINGS LOCAIS (Type Safety) ---
        sc = 100
        p_neg = []
        p_pos = []
        brechas = []
        cross = []
        plano = {"servicos_recomendados": []}
        verdict = ""
        mapeamento = ""
        incoerencias = []
        evid = []
        
        if not self.api_key:
            return {
                "name": "Senior CMO Agent", 
                "score": 0, 
                "critical_pains": ["API Key ausente."],
                "findings": {}
            }

        try:
            # =============================================
            # 1. CONTEXTO DE CAMPO (BACKSTAGE)
            # =============================================
            intel = ""
            score_sum = 0
            count = 0
            
            if hasattr(self, 'previous_results_context') and self.previous_results_context:
                for agent_name, agent_data in self.previous_results_context.items():
                    info = agent_data.get("internal_briefing_for_boss", "")
                    s = agent_data.get("score", 0)
                    score_sum += s
                    count += 1
                    intel += f"\n- [{agent_name}] Score: {s}% | Relatório: {info}\n"
            else:
                intel = "Sem inteligência de campo disponível."

            avg_score = int(score_sum / count) if count > 0 else 0
            company_name = self.params.get("companyName", "Empresa Alvo")
            city = self.params.get("city", "sua região")

            # =============================================
            # 2. CATÁLOGO DE PRODUTOS GROOWAY
            # =============================================
            catalog_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "grooway_catalog.json")
            cat_data = "{}"
            try:
                if os.path.exists(catalog_path):
                    with open(catalog_path, 'r', encoding='utf-8') as f:
                        cat_data = f.read()
            except: pass

            client = genai.Client(api_key=self.api_key)
            prompt = f"""
            PERSONA: 'O COMANDANTE' (Agente 08 - The Boss) da GroowayOS. 
            ARSENAL: 'Martelo do Veredito', 'Scanner de Incoerência', 'Mapeamento de Lucro Invisível'.
            DADOS: A empresa '{company_name}' ({city}) tem média de eficácia de {avg_score}%.

            INTELIGÊNCIA CONSOLIDADA:
            {intel}

            SUA MISSÃO TÁTICA NO TRIBUNAL:
            1. MARTELO DO VEREDITO: Julgue se o ativo digital é um facilitador ou um dreno de capital.
            2. INCOERÊNCIAS: Identifique mentiras ou gaps entre o que o site diz e a realidade do GMB/Ads.
            3. LUCRO INVISÍVEL: Calcule o 'Imposto da Comoditização' (quanto perdem por serem genéricos).
            4. PLANO DE DOMINAÇÃO: Selecione 3 planos do catálogo {cat_data} para resgatar o ROI.

            JSON OUTPUT FORMAT:
            {{
                "martelo_do_veredito": "Veredito sênior e autoritário",
                "sentenca_clinica": "Tradução para dinheiro",
                "incoerencias_detectadas": ["Incoerência 1", "2"],
                "mapeamento_lucro_invisivel": "Estimativa de perda financeira mensal em R$",
                "servicos_recomendados": [
                    {{ "servico": "Nome", "por_que": "Motivo tático" }}
                ],
                "evidencias_finais": ["Fato 1", "2"]
            }}
            """

            res = self._call_llm_json(prompt)

            if res:
                verdict = res.get("martelo_do_veredito", "")
                mapeamento = res.get("mapeamento_lucro_invisivel", "")
                incoerencias = res.get("incoerencias_detectadas", [])
                evid = res.get("evidencias_finais", [])
                
                for s in res.get("servicos_recomendados", []):
                    plano["servicos_recomendados"].append({
                        "servico_grooway": s.get("servico"),
                        "meta_de_resgate": s.get("por_que")
                    })
                    b_rec.append(f"RECOMENDAÇÃO: {s.get('servico')} - {s.get('por_que')}")

                b_neg.append(f"SENTENÇA: {res.get('sentenca_clinica')}")
                b_neg.append(f"LUCRO INVISÍVEL: {mapeamento}")
                b_pos.append(f"VEREDITO: {verdict}")

            # Score logic: Start at avg and penalize for incoherencies or commoditization
            sc = avg_score
            if len(incoerencias) > 2: sc -= 20
            if "genéric" in verdict.lower() or "fraco" in verdict.lower(): sc -= 15

            return {
                "name": "The Boss (Tribunal do Comandante)",
                "score": max(0, min(100, sc)),
                "findings": {
                    "martelo_do_veredito": verdict,
                    "incoerencias_detectadas": incoerencias,
                    "mapeamento_lucro_invisivel": mapeamento,
                    "plano_de_dominacao": plano,
                    "evidencias_de_guerra": evid,
                    "cmo_verdict": verdict # Legacy compat
                },
                "boss_briefing": {
                    "pontos_negativos": b_neg,
                    "pontos_positivos": b_pos,
                    "recomendacoes": b_rec,
                    "brechas_diferenciacao": []
                }
            }

        except Exception as e:
            return {
                "name": "Senior CMO Agent", 
                "score": 0, 
                "critical_pains": [f"Erro no Tribunal: {str(e)}"],
                "findings": {}
            }

