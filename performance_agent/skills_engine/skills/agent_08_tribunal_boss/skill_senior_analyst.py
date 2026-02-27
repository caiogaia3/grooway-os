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
        executive_summary = ""
        battle_plan = {}
        
        if not self.api_key and not self.openai_api_key:
            return {
                "name": "Senior CMO Agent (Business & Sales)", 
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
            PERSONA: O 'CHIEF STRATEGY OFFICER' (Agente 08 - The Boss) da Grooway. 
            ARSENAL: 'Executive Summary C-Level', 'Calculadora de Damage Cost', 'Plano de Resgate em 3 Fases'.
            DADOS: A empresa '{company_name}' ({city}) tem média de saúde digital de {avg_score}%.

            INTELIGÊNCIA CONSOLIDADA (Relatórios dos Agentes 01, 03, 04):
            {intel}
            CATÁLOGO DE SERVIÇOS DA GROOWAY:
            {cat_data}

            SUA MISSÃO ESTRATÉGICA (O PITCH FINAL):
            1. RESUMO EXECUTIVO C-LEVEL: Uma síntese devastadora, focada em dor comercial, perda financeira e posicionamento (nada de jargões técnicos fofos, fale de dinheiro deixado na mesa).
            2. INCOERÊNCIAS E GAPS: O que a marca promete vs a dura realidade mapeada pelos agentes (Vácuo de Autoridade, Threat Matrix, Reviews).
            3. PLANO DE BATALHA EM 3 FASES:
               - Fase 1: Estancar a Sangria (O que fazer semana 1 para parar de perder clientes ativos).
               - Fase 2: Tração de Mercado (O que fazer no mês 1 para captar nova demanda).
               - Fase 3: Dominação e Oceano Azul (O que fazer no trimestre para engolir os concorrentes).
            4. RECOMENDAÇÃO DE SERVIÇOS (ARSENAL GROOWAY): Escolha os 3 serviços exatos do catálogo que resolvem as dores e encaixe-os no pitch.

            JSON OUTPUT FORMAT:
            {{
                "executive_summary_clevel": "Um parágrafo C-Level letal sobre o estado comercial da empresa",
                "incoerencias_comerciais": ["Incoerência 1 (ex: Diz ser líder, mas tem GMB nota 3.8)", "Incoerência 2"],
                "damage_cost_total": "Soma estimada da % ou R$ perdido devido a ineficácia social e local",
                "battle_plan_phases": {{
                    "fase_1_estancar_sangria": "Ações emergenciais e recomendação Grooway",
                    "fase_2_tracao": "Ações de crescimento e recomendação Grooway",
                    "fase_3_dominacao": "Posicionamento Oceano Azul e recomendação Grooway"
                }},
                "servicos_recomendados": [
                    {{ "servico": "Nome exato", "pitch_de_venda_direta": "Argumento conectando a dor descoberta ao serviço" }}
                ],
                "martelo_do_veredito": "Uma farpa final (punchline) fechando o diagnóstico encorajando a ação"
            }}
            """

            res = self._call_llm_json(prompt)

            if res:
                verdict = res.get("martelo_do_veredito", "")
                mapeamento = res.get("damage_cost_total", "")
                incoerencias = res.get("incoerencias_comerciais", [])
                evid = [] # Legacy array support for backwards compatibility
                executive_summary = res.get("executive_summary_clevel", "")
                battle_plan = res.get("battle_plan_phases", {})
                
                for s in res.get("servicos_recomendados", []):
                    plano["servicos_recomendados"].append({
                        "servico_grooway": s.get("servico"),
                        "meta_de_resgate": s.get("pitch_de_venda_direta")
                    })
                    b_rec.append(f"RECOMENDAÇÃO TÁTICA ('{s.get('servico')}'): {s.get('pitch_de_venda_direta')}")

                b_neg.append(f"RESUMO EXECUTIVO C-LEVEL: {executive_summary}")
                b_neg.append(f"DAMAGE COST ESTIMADO: {mapeamento}")
                b_pos.append(f"VEREDITO: {verdict}")
                
                if isinstance(battle_plan, dict):
                    for phase, desc in battle_plan.items():
                        b_rec.append(f"PLANO DE BATALHA ({str(phase).replace('_', ' ').upper()}): {desc}")

            # Score logic: Start at avg and penalize for incoherencies or commoditization
            sc = avg_score
            if len(incoerencias) > 2: sc -= 20
            if "genéric" in verdict.lower() or "fraco" in verdict.lower(): sc -= 15

            return {
                "name": "Senior CMO Agent (Business & Sales)",
                "score": max(0, min(100, sc)),
                "findings": {
                    "martelo_do_veredito": verdict,
                    "incoerencias_detectadas": incoerencias,
                    "mapeamento_lucro_invisivel": mapeamento,
                    "executive_summary_clevel": executive_summary,
                    "battle_plan_phases": battle_plan,
                    "plano_de_dominacao": plano,
                    "evidencias_de_guerra": evid,
                    "cmo_verdict": verdict, # Legacy compat
                    "pontos_negativos_consolidados": [f"❌ {inc}" for inc in incoerencias] + ([f"❌ Dreno Financeiro Estimado: {mapeamento}"] if mapeamento else []),
                    "pontos_positivos_consolidados": [f"✅ Resumo C-Level: {executive_summary}"] if executive_summary else [],
                    "brechas_diferenciacao": [f"💡 {k.replace('_', ' ').title()}: {v}" for k, v in (battle_plan.items() if isinstance(battle_plan, dict) else [])],
                    "cross_analysis": [f"🔗 {s}" for s in b_rec[:3]] if b_rec else ["🔗 O CEO analisou os dados dos outros agentes e arquitetou este plano de guerra."],
                    "plano_comercial": {
                        "servicos_recomendados": [
                            {
                                "nome_servico": s.get("servico_grooway", "Serviço Recomendado"),
                                "por_que_vender": s.get("meta_de_resgate", ""),
                                "impacto_esperado": "Aumento imediato de percepção de valor e fechamentos na região."
                            }
                            for s in plano.get("servicos_recomendados", [])
                        ]
                    }
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

