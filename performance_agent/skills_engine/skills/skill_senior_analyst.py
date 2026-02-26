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
        NÃO PODE INVENTAR NENHUM DADO.
        """
        report = {
            "name": "Senior CMO Agent (Business & Sales)",
            "score": 100, 
            "findings": {
                "pontos_negativos_consolidados": [],
                "pontos_positivos_consolidados": [],
                "brechas_diferenciacao": [],
                "cross_analysis": [],
                "plano_comercial": {
                    "servicos_recomendados": []
                },
                "cmo_verdict": "",
                "evidences": []
            },
            "critical_pains": []
        }

        if not self.api_key:
            report["critical_pains"].append("API Key não configurada.")
            return report

        try:
            text_context = ""
            if self.soup:
                for script_or_style in self.soup(["script", "style", "nav", "footer"]):
                    script_or_style.decompose()
                text_content = self.soup.get_text(separator=' ', strip=True)
                text_context = text_content[:3500]

            company_name = self.params.get("companyName", "Essa empresa")
            city = self.params.get("city", "sua região")
            
            # =============================================
            # CONSTRUÇÃO DO BRIEFING CONSOLIDADO DOS AGENTES
            # =============================================
            all_briefings = ""
            all_negative = []
            all_positive = []
            all_brechas = []
            all_recommendations = []
            
            if hasattr(self, 'previous_results_context') and self.previous_results_context:
                for agent_name, agent_data in self.previous_results_context.items():
                    bb = agent_data.get("boss_briefing", {})
                    score = agent_data.get("score", "?")
                    pains = agent_data.get("critical_pains", [])
                    
                    agent_section = f"\n--- Relatório: {agent_name} (Score: {score}/100) ---\n"
                    
                    neg = bb.get("pontos_negativos", [])
                    pos = bb.get("pontos_positivos", [])
                    brechas = bb.get("brechas_diferenciacao", [])
                    recs = bb.get("recomendacoes", [])
                    
                    if neg:
                        agent_section += "NEGATIVOS:\n" + "\n".join([f"  ❌ {n}" for n in neg]) + "\n"
                        all_negative.extend(neg)
                    if pos:
                        agent_section += "POSITIVOS:\n" + "\n".join([f"  ✅ {p}" for p in pos]) + "\n"
                        all_positive.extend(pos)
                    if brechas:
                        agent_section += "BRECHAS:\n" + "\n".join([f"  💡 {b}" for b in brechas]) + "\n"
                        all_brechas.extend(brechas)
                    if recs:
                        agent_section += "RECOMENDAÇÕES:\n" + "\n".join([f"  → {r}" for r in recs]) + "\n"
                        all_recommendations.extend(recs)
                    if pains:
                        agent_section += "DORES CRÍTICAS:\n" + "\n".join([f"  🔴 {p}" for p in pains]) + "\n"
                    
                    all_briefings += agent_section
            else:
                all_briefings = "Nenhum relatório anterior recebido."

            client = genai.Client(api_key=self.api_key)
            
            prompt = f"""
            Você é um CMO (Chief Marketing Officer) de uma Agência Premium de Marketing Digital.
            Você é o ÚLTIMO analista da cadeia. Antes de você, 6 agentes especializados já auditaram a empresa e te entregaram um briefing detalhado com pontos negativos, positivos, brechas de diferenciação e recomendações concretas.
            
            O prospect é: {company_name} (URL: {self.target_url}, Cidade: {city}).
            
            ========== BRIEFINGS DOS SEUS AGENTES ==========
            {all_briefings}
            =================================================
            
            ========== TEXTO/COPY EXTRAÍDA DO SITE ==========
            "{text_context}"
            =================================================
            
            SUA MISSÃO:
            1. CONSOLIDE todos os pontos negativos e positivos que seus agentes reportaram. NÃO INVENTE novos — apenas organize e, se necessário, reformule para linguagem executiva.
            2. CRUZE os dados dos agentes entre si para identificar gargalos "ocultos" (Ex: Se o Tracking Agent disse que não tem Pixel, E o Social Media Agent disse que tem 10 mil seguidores → GARGALO DE REMARKETING).
            3. Liste as BRECHAS DE DIFERENCIAÇÃO que seus agentes identificaram.
            4. Crie um PLANO COMERCIAL com serviços recomendados baseados EXCLUSIVAMENTE nas falhas comprovadas.
            5. Dê um VEREDITO FINAL de 3 linhas que o vendedor da agência vai usar na call de fechamento.
            
            PROIBIÇÕES ABSOLUTAS (ANTIALUCINAÇÃO):
            - Você NÃO PODE citar um problema que NENHUM dos seus agentes encontrou.
            - Você NÃO PODE inventar dados de mercado, concorrentes ou estatísticas.
            - Se um agente reportou score alto e não encontrou problemas naquela área, ELOGIE a empresa nessa frente.
            - Cada ponto negativo DEVE ter como fonte o agente que o reportou.
            - Cada serviço recomendado DEVE estar ligado a uma falha comprovada nos briefings.
            
            Responda ESTRITAMENTE num formato JSON válido:
            {{
                "pontos_negativos_consolidados": [
                    "❌ [Fonte: Tracking Agent] Problema reportado pelo agente...",
                    "❌ [Fonte: UX/SEO Agent] Outro problema..."
                ],
                "pontos_positivos_consolidados": [
                    "✅ [Fonte: Social Media Agent] Ponto forte da empresa...",
                    "✅ [Fonte: GMB Agent] Outro ponto forte..."
                ],
                "brechas_diferenciacao": [
                    "💡 Brecha 1 cruzando dados dos agentes...",
                    "💡 Brecha 2 identificada nos briefings..."
                ],
                "cross_analysis": [
                    "🔗 Cruzamento: O agente X reportou Y, e o agente Z reportou W. Isso significa que...",
                    "🔗 Cruzamento: Sem Pixel (Tracking) + 10k seguidores (Social) = Remarketing morto"
                ],
                "plano_comercial": {{
                    "servicos_recomendados": [
                        {{
                            "nome_servico": "Gestão de Tráfego Pago (Google + Meta)",
                            "por_que_vender": "Baseado no briefing do Tracking Agent que reportou ausência do Pixel e do Keyword Agent que encontrou oportunidades...",
                            "impacto_esperado": "Impacto concreto baseado nos dados dos agentes"
                        }},
                        {{
                            "nome_servico": "Outro serviço",
                            "por_que_vender": "Justificativa do agente X...",
                            "impacto_esperado": "..."
                        }}
                    ]
                }},
                "cmo_verdict": "Veredito executivo de 3 linhas para o vendedor usar na call. Baseado 100% nos dados comprovados.",
                "evidences": [
                    "Fonte: Tracking Agent → O site não possui Meta Pixel nem Google Ads ativo.",
                    "Fonte: Social Media Agent → Instagram com X seguidores mas sem link na bio.",
                    "Cruzamento: Sem remarketing + base social ativa = hemorragia de receita comprovada."
                ]
            }}
            
            Em hipótese alguma retorne Markdown (como ```json). Apenas o objeto puro JSON."
            """

            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.3
                )
            )

            if response.text:
                json_data = json.loads(response.text)
                report["findings"] = json_data
                
                # Score baseado no volume de negativos vs positivos
                neg_count = len(json_data.get("pontos_negativos_consolidados", []))
                pos_count = len(json_data.get("pontos_positivos_consolidados", []))
                
                if neg_count > pos_count * 2:
                    report["score"] = 30
                    report["critical_pains"].append("Diagnóstico revela falhas sistêmicas no posicionamento digital da empresa.")
                elif neg_count > pos_count:
                    report["score"] = 55
                    report["critical_pains"].append("O digital da empresa tem pontos fortes mas apresenta gargalos significativos de conversão.")
                else:
                    report["score"] = 80
                    
                # Se a oferta do site for fraca
                verdict = json_data.get("cmo_verdict", "").lower()
                if "fraco" in verdict or "fraca" in verdict or "genéric" in verdict or "ausente" in verdict:
                    report["score"] = max(0, report["score"] - 20)
                    report["critical_pains"].append("Oferta digital inoperante: O site não comunica valor suficiente para fechar negócios.")
            else:
                report["critical_pains"].append("O CMO (Gemini) não retornou análise.")
                
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
                            response_format={ "type": "json_object" },
                            temperature=0.3
                        )
                        raw_text = oai_response.choices[0].message.content
                        if raw_text:
                            json_data = json.loads(raw_text)
                            report["findings"] = json_data
                        else:
                            report["critical_pains"].append("Fallback OpenAI: Resposta vazia.")
                    except Exception as fallback_e:
                        report["critical_pains"].append(f"Limite do Gemini e falha no Fallback OpenAI: {fallback_e}")
                else:
                    report["critical_pains"].append("Limite da IA atingido (Cota Gemini 429). Tente novamente em breve.")
            else:
                report["critical_pains"].append(f"Erro na cognição do CMO: {e}")
        
        report["score"] = max(0, report["score"])
        return report
