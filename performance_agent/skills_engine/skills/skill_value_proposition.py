from skills_engine.core import PredatorSkill
import os
import json
from google import genai
from google.genai import types

class ValuePropositionSkill(PredatorSkill):
    """
    COMPLEMENTAR DO BOSS: Gerador de Proposta de Valor Irresistível.
    Recebe o diagnóstico completo de todos os agentes + veredito do CMO
    e constrói uma proposta de valor persuasiva e estruturada para convencer
    a empresa diagnosticada a contratar os serviços da Grooway.
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
                "frase_gancho": "",
                "diagnostico_resumido": "",
                "proposta_valor_grooway": "",
                "por_que_agora": "",
                "provas_sociais_placeholder": [],
                "servicos_propostos": [],
                "investimento_estimado": "",
                "proximo_passo": "",
                "assinatura_consultor": ""
            },
            "critical_pains": []
        }

        if not self.api_key:
            report["critical_pains"].append("API Key Gemini não configurada.")
            return report

        try:
            company_name = self.params.get("companyName", "Empresa Diagnosticada")
            city = self.params.get("city", "sua região")

            # ---------------------------------------------------
            # CONSOLIDA O DIAGNÓSTICO COMPLETO DE TODOS OS AGENTES
            # ---------------------------------------------------
            all_briefings = ""
            cmo_verdict = ""
            cmo_plan = []

            if hasattr(self, 'previous_results_context') and self.previous_results_context:
                for agent_name, agent_data in self.previous_results_context.items():
                    bb = agent_data.get("boss_briefing", {})
                    findings = agent_data.get("findings", {})
                    score = agent_data.get("score", "?")
                    pains = agent_data.get("critical_pains", [])

                    # Extrai o veredito e plano do CMO especificamente
                    if "Senior CMO" in agent_name or "Boss" in agent_name.title():
                        cmo_verdict = findings.get("cmo_verdict", "")
                        cmo_plan = findings.get("plano_comercial", {}).get("servicos_recomendados", [])

                    agent_section = f"\n--- {agent_name} (Score: {score}/100) ---\n"
                    neg = bb.get("pontos_negativos", [])
                    pos = bb.get("pontos_positivos", [])
                    brechas = bb.get("brechas_diferenciacao", [])

                    if neg:
                        agent_section += "NEGATIVOS:\n" + "\n".join([f"  ❌ {n}" for n in neg]) + "\n"
                    if pos:
                        agent_section += "POSITIVOS:\n" + "\n".join([f"  ✅ {p}" for p in pos]) + "\n"
                    if brechas:
                        agent_section += "BRECHAS:\n" + "\n".join([f"  💡 {b}" for b in brechas]) + "\n"
                    if pains:
                        agent_section += "DORES:\n" + "\n".join([f"  🔴 {p}" for p in pains]) + "\n"

                    all_briefings += agent_section
            else:
                all_briefings = "Nenhum relatório anterior recebido."

            cmo_plan_str = json.dumps(cmo_plan, ensure_ascii=False) if cmo_plan else "Nenhum plano disponível."

            client = genai.Client(api_key=self.api_key)

            prompt = f"""
            Você é o Diretor de Crescimento da GROOWAY — uma agência premium de marketing digital brasileira.
            
            Você acabou de realizar um diagnóstico profundo e gratuito do digital da empresa "{company_name}" (localizada em {city}).
            
            Seu objetivo agora é redigir uma PROPOSTA DE VALOR IRRESISTÍVEL que convença o dono dessa empresa a contratar os serviços da Grooway.
            
            A proposta deve ser PERSUASIVA, ESPECÍFICA (com base NOS DADOS REAIS do diagnóstico) e com SENSO DE URGÊNCIA.
            
            ========== DIAGNÓSTICO COMPLETO ==========
            {all_briefings}
            ==========================================
            
            ========== VEREDITO DO CMO ==========
            {cmo_verdict}
            =====================================
            
            ========== PLANO COMERCIAL DO CMO ==========
            {cmo_plan_str}
            =============================================
            
            ESTRUTURA DA PROPOSTA (responda em JSON puro, sem markdown):
            {{
                "titulo_proposta": "Ex: Proposta Estratégica de Crescimento Digital — {company_name}",
                "frase_gancho": "Uma frase de impacto máximo (1-2 linhas) que provoque o empresário com os dados mais críticos do diagnóstico. Mostre que ele está perdendo dinheiro AGORA.",
                "diagnostico_resumido": "Resumo executivo de 3-4 frases sobre o estado atual do digital da empresa, baseado exclusivamente nos dados dos agentes. Tom: direto, sem julgamentos, mas revelando as brechas.",
                "proposta_valor_grooway": "Parágrafo de 3-5 frases descrevendo O QUE a Grooway vai fazer, COMO vai resolver cada falha crítica detectada e QUAL TRANSFORMAÇÃO o cliente vai viver. Use os dados reais.",
                "por_que_agora": "2-3 frases criando urgência real baseada nos dados: por que adiar é custoso? Mencione concorrentes, oportunidades sazonais, algoritmos, etc. Baseado nos dados do diagnóstico.",
                "provas_sociais_placeholder": [
                    "Placeholder para prova social 1 (ex: 'Cliente do setor X saiu de 0 para Y leads/mês em Z meses')",
                    "Placeholder para prova social 2",
                    "Placeholder para prova social 3"
                ],
                "servicos_propostos": [
                    {{
                        "nome": "Nome do Serviço",
                        "descricao": "O que inclui em 1-2 frases práticas",
                        "resultado_esperado": "Resultado concreto e mensurável esperado para esse cliente específico",
                        "urgencia": "Por que esse serviço é crítico AGORA para essa empresa"
                    }}
                ],
                "investimento_estimado": "Frase posicionando o investimento como ROI, não custo. Ex: 'O investimento neste programa é a partir de R$ X/mês — menos do que o custo de 1 lead perdido por dia para a concorrência.' Adapte ao porte e setor da empresa.",
                "proximo_passo": "CTA claro e urgente: o que o empresário deve fazer AGORA para avançar. Ex: 'Agende sua Sessão Estratégica de 30 minutos com nosso time...'",
                "assinatura_consultor": "Ex: 'Equipe Grooway | Marketing de Performance | grooway.com.br'"
            }}
            
            REGRAS:
            - Use SOMENTE dados comprovados pelos agentes. ZERO invenção.
            - Tom: consultivo, premium, direto e com senso de urgência.
            - O cliente deve sentir que você sabe EXATAMENTE o problema dele.
            - Em português (pt-BR) fluente e profissional.
            - Retorne APENAS o JSON puro, sem formatação markdown.
            """

            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.4
                )
            )

            if response.text:
                json_data = json.loads(response.text)
                report["findings"] = json_data
            else:
                report["critical_pains"].append("Gemini não retornou proposta de valor.")

        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                if self.openai_api_key:
                    try:
                        from openai import OpenAI
                        openai_client = OpenAI(api_key=self.openai_api_key)
                        oai_response = openai_client.chat.completions.create(
                            model="gpt-4o-mini",
                            messages=[
                                {"role": "system", "content": "You are an API that outputs valid JSON only. Respond in Portuguese (Brazil)."},
                                {"role": "user", "content": prompt}
                            ],
                            response_format={"type": "json_object"},
                            temperature=0.4
                        )
                        raw_text = oai_response.choices[0].message.content
                        if raw_text:
                            json_data = json.loads(raw_text)
                            report["findings"] = json_data
                        else:
                            report["critical_pains"].append("Fallback OpenAI: Resposta vazia.")
                    except Exception as fallback_e:
                        report["critical_pains"].append(f"Falha na geração da proposta de valor: {fallback_e}")
                else:
                    report["critical_pains"].append("Limite da IA atingido. Tente novamente em breve.")
            else:
                report["critical_pains"].append(f"Erro na geração da proposta de valor: {e}")

        return report
