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

            # = = = = = = = = = = = = = = = = = = = = = = = = =
            # 3. THE "TRIBUNAL" - BOSS FINAL PITCH
            # = = = = = = = = = = = = = = = = = = = = = = = = =
            client = genai.Client(api_key=self.api_key)
            prompt = f"""
            PERSONA: 
            Você é o 'CHIEF STRATEGY OFFICER' (CSO) da Grooway. Você é um veterano em fechar negócios de 6 e 7 dígitos. 
            Seu tom é o de um consultor de elite: direto, incisivo, sem medo de apontar a incompetência tática, mas oferecendo o caminho da glória.
            Você não entrega "dicas", você entrega um VEREDITO DE SOBREVIVÊNCIA.

            DADOS CONSOLIDADOS DO CAMPO DE BATALHA:
            - Alvo: {company_name} ({city})
            - Saúde Digital Atual (Média do Reconhecimento): {avg_score}%
            
            INTELIGÊNCIA DOS AGENTES DE CAMPO (A munição que você deve usar):
            {intel}
            
            MISSÃO:
            Sua missão é converter esses dados técnicos e psicográficos em um PITCH DE VENDAS LETAL. 
            Você deve ignorar tecnicismos e focar em: DINHEIRO DEIXADO NA MESA, PERDA DE STATUS, E DESMORONAMENTO PERFEITO DA CONCORRÊNCIA.

            ESTRUTURA DO VEREDITO (JSON):
            1. EXECUTIVE SUMMARY C-LEVEL: Um soco no estômago. Mostre como a empresa está sendo "engolida" ou "comoditizada" baseada nos dados psicográficos do ICP.
            2. INCOERÊNCIAS COMERCIAIS: Aponte onde o site ou o marketing mentem ou falham em sustentar o que a marca diz ser.
            3. DAMAGE COST TOTAL: Estime o prejuízo anual (em R$ ou Impacto de Mercado) por eles não terem o Tracking, GMB ou Estratégia de Mercado da Grooway.
            4. BATTLE PLAN (3 FASES): 
               - Fase 1 (Resgate): Parar a perda de leads hoje.
               - Fase 2 (Escala): Dominar a mente do ICP com o novo posicionamento.
               - Fase 3 (Legado): Tornar-se o player imbatível em {city}.

            JSON OUTPUT FORMAT:
            {{
                "executive_summary_clevel": "Um parágrafo devastador sobre o custo da inércia atual.",
                "incoerencias_comerciais": ["Incoerência A: Promessa vs Realidade", "Incoerência B: Falha Ética/Técnica"],
                "damage_cost_total": "Cálculo agressivo de quanto custam os erros atuais por ano.",
                "battle_plan_phases": {{
                    "fase_1_estancar_sangria": "Resgate imediato dos leads perdidos.",
                    "fase_2_tracao": "Captura de novos desejos do ICP detectado.",
                    "fase_3_dominacao": "Exclusão total dos rivais na mente do cliente."
                }},
                "servicos_recomendados": [
                    {{ 
                        "servico": "Nome do Serviço Grooway", 
                        "pitch_de_venda_direta": "Argumento de fechamento usando a dor profunda do ICP mapeada pelo Agente 04." 
                    }}
                ],
                "martelo_do_veredito": "Punchline final: A solução não é 'mais marketing', é a Grooway."
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

