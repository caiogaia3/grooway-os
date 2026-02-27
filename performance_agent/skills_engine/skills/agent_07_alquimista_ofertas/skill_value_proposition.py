from skills_engine.core import PredatorSkill
import os
import json
from google import genai
from google.genai import types

class ValuePropositionSkill(PredatorSkill):
    """
    COMPLEMENTAR DO BOSS: Gerador de Proposta Comercial Irresistível.
    Baseado na metodologia "Growth Partner" — posiciona como Parceiro de
    Negócios e Tecnologia, não como agência de marketing tradicional.
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
            "name": "Value Proposition Agent (Grooway)",
            "score": 100,
            "findings": {
                "titulo_proposta": "",
                "bloco1_apresentacao": "",
                "bloco2_cenario_atual": "",
                "bloco3_estrategia": "",
                "bloco4_escopo": "",
                "bloco5_cronograma": "",
                "bloco6_resultados": "",
                "bloco7_investimentos_condicoes": "",
                "assinatura_consultor": ""
            },
            "critical_pains": []
        }

        pains = report.get("critical_pains", [])
        if not isinstance(pains, list):
            pains = []
            report["critical_pains"] = pains

        if not self.api_key and not self.openai_api_key:
            pains.append("API Key não configurada.")
            return report

        try:
            company_name = self.params.get("companyName", "Empresa Diagnosticada")
            city = self.params.get("city", "sua região")

            # ---------------------------------------------------
            # CONSOLIDA INTELIGÊNCIA ESTRATÉGICA DE TODOS OS AGENTES
            # ---------------------------------------------------
            strategic_intelligence = ""
            cmo_verdict = ""
            all_scores = {}
            critical_issues = []

            if hasattr(self, 'previous_results_context') and self.previous_results_context:
                for agent_name, agent_data in self.previous_results_context.items():
                    intel = agent_data.get("internal_briefing_for_alchemist", "")
                    score = agent_data.get("score", "?")
                    agent_pains = agent_data.get("critical_pains", [])
                    findings = agent_data.get("findings", {})

                    all_scores[agent_name] = score

                    if intel or agent_pains:
                        strategic_intelligence += f"\n--- {agent_name} (Score: {score}/100) ---\n"
                        if intel:
                            strategic_intelligence += f"INSIGHT: {intel}\n"
                        if agent_pains:
                            for pain in agent_pains[:3]:
                                critical_issues.append(pain)
                            strategic_intelligence += "DORES: " + "; ".join(agent_pains[:3]) + "\n"

                    if "Senior CMO" in agent_name or "Boss" in agent_name.title():
                        cmo_verdict = findings.get("cmo_verdict", "")
            else:
                strategic_intelligence = "Nenhum relatório anterior recebido."

            scores_summary = "\n".join([f"- {name}: {score}/100" for name, score in all_scores.items()])
            critical_summary = "\n".join([f"- {issue}" for issue in critical_issues[:8]])

            prompt = f"""
            # ROLE (PAPEL)
            Você é um Estrategista Comercial Senior especializado em vendas B2B de Alto Ticket (High Ticket). 
            Sua função não é escrever "textos bonitos", mas sim criar documentos de venda persuasivos, 
            baseados em lógica econômica, autoridade técnica e escassez.

            # OBJETIVO
            Criar uma Proposta Comercial Irresistível baseada na metodologia "Growth Partner". 
            A proposta deve fugir do padrão "agência de marketing" e posicionar o ofertante como um 
            "Parceiro de Negócios e Tecnologia".

            # TONE OF VOICE (TOM DE VOZ)
            - Confiança Técnica: Use termos que demonstrem domínio (ex: "Ecossistema", "Ativo Comercial", "Maturação de Dados").
            - Direto e Financeiro: Fale a língua do dono da empresa (ROI, Custo de Oportunidade, Margem).
            - Não use clichês: Proibido começar com "No mundo digital de hoje...". Vá direto ao ponto.
            - Parceiro, não Funcionário: A linguagem deve ser de igual para igual.

            # REGRA DE OURO
            Sempre que mencionar "Marketing", substitua por termos como "Máquina de Vendas", 
            "Aquisição de Demanda" ou "Inteligência Comercial". O cliente B2B odeia gastar com marketing, 
            mas adora investir em Vendas.

            # CONTEXTO DO DIAGNÓSTICO TÉCNICO (DADOS REAIS)
            EMPRESA: {company_name}
            CIDADE: {city}
            URL: {self.target_url}

            SCORES DOS AGENTES:
            {scores_summary}

            PROBLEMAS CRÍTICOS DETECTADOS:
            {critical_summary}

            INTELIGÊNCIA DOS AGENTES:
            {strategic_intelligence[:3000]}

            VEREDITO DO CMO:
            {cmo_verdict}

            # SUA MISSÃO: GERAR A PROPOSTA COMERCIAL EM 7 BLOCOS

            BLOCO 1 - O CONCEITO (Reframing / Apresentação):
            - Não venda o serviço (ex: "fazer site"), venda o resultado macro (ex: "Tecnologia a serviço da confiança").
            - Crie uma tese que justifique por que o método antigo do cliente está falho.
            - Use os dados reais do diagnóstico para dar peso à tese.

            BLOCO 2 - CENÁRIO ATUAL (A Dor Baseada em Dados):
            - Mostre o cenário problemático baseado nos scores reais e problemas detectados.
            - Calcule o custo de inação: quanto {company_name} perde por mês não resolvendo isso.
            - Use os problemas críticos detectados acima como argumentos.

            BLOCO 3 - PILARES DA ESTRATÉGIA:
            - Pilar 1: Curto Prazo (Dinheiro rápido — Tráfego pago, Google Ads, Social Ads)
            - Pilar 2: Longo Prazo/Autoridade (SEO, Blog com IA, Conteúdo Estratégico)
            - Pilar 3: Segurança/Dados (Tracking, Dashboards, CRM Inteligente)
            - Mostre como cada pilar resolve uma dor específica detectada.

            BLOCO 4 - ESCOPO DE ENTREGA (Módulos):
            - Descreva entregas focando no BENEFÍCIO, não na feature.
            - Inclua elemento de INOVAÇÃO/IA (Blog Automático, Avatar IA, CRM Preditivo).
            - Formate como lista de módulos com: Nome do Módulo → Benefício Direto.

            BLOCO 5 - CRONOGRAMA DE MATURAÇÃO:
            - Mês 1: Setup, implementação, correções urgentes
            - Mês 2-3: Aceleração, primeiros resultados
            - Mês 4-6: Consolidação e escala
            - Justifique a fidelidade por "necessidade técnica" (aprendizado do algoritmo, ciclo de venda, indexação).

            BLOCO 6 - RESULTADOS PROJETADOS:
            - Projete resultados baseados nos dados do diagnóstico.
            - Use métricas específicas: tráfego, leads, conversão, ROI estimado.
            - Seja ambicioso mas realista baseado nos scores atuais.

            BLOCO 7 - INVESTIMENTO E CONDIÇÕES:
            - Separe em 3 categorias: A) Setup/Implementação (valor único), B) Fee Mensal (recorrência), C) Verba de Mídia (plataformas).
            - Validade da proposta: 7 dias.
            - Próximos passos: Aceite → Contrato → Kick-off.
            - NÃO coloque valores específicos (o consultor preencherá). Use "[VALOR_SETUP]", "[VALOR_MENSAL]", "[VERBA_MIDIA]".

            JSON OUTPUT FORMAT (OBRIGATÓRIO):
            {{
                "titulo_proposta": "Título impactante da proposta (ex: 'Plano de Dominação Digital para {company_name}')",
                "bloco1_apresentacao": "Texto do Bloco 1 — O Conceito / Reframing. Máximo 4 parágrafos.",
                "bloco2_cenario_atual": "Texto do Bloco 2 — Cenário Atual e Custo de Inação. Use dados reais. Máximo 4 parágrafos.",
                "bloco3_estrategia": "Texto do Bloco 3 — Os 3 Pilares da Estratégia. Formatado com os pilares numerados.",
                "bloco4_escopo": "Texto do Bloco 4 — Escopo de Entrega com Módulos. Lista formatada.",
                "bloco5_cronograma": "Texto do Bloco 5 — Cronograma de Maturação e justificativa técnica da fidelidade.",
                "bloco6_resultados": "Texto do Bloco 6 — Resultados Projetados com métricas.",
                "bloco7_investimentos_condicoes": "Texto do Bloco 7 — Investimento (3 categorias) + Validade + Próximos Passos.",
                "assinatura_consultor": "Grooway — Inteligência Comercial & Growth Partner"
            }}
            """

            json_data = self._call_llm_json(prompt)

            if json_data and isinstance(json_data, dict):
                report["findings"].update(json_data)
                
                verdict = json_data.get("titulo_proposta", "")
                if verdict:
                    report["boss_briefing"] = {
                        "recomendacoes": [f"PROPOSTA GERADA: {verdict}"],
                        "pontos_positivos": [],
                        "pontos_negativos": []
                    }
            else:
                pains.append("O Estrategista não conseguiu gerar a proposta.")

        except Exception as e:
            pains.append(f"Erro na geração da proposta de valor: {e}")

        return report
