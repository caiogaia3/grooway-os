from skills_engine.core import PredatorSkill
import os
import json
from google import genai
from google.genai import types

class KeywordResearchSkill(PredatorSkill):
    def __init__(self, target_url, params=None):
        super().__init__(target_url)
        self.params = params or {}
        
        from dotenv import load_dotenv
        load_dotenv(dotenv_path=".env")
        load_dotenv(dotenv_path="../raio-x-digital/.env.local")
        
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.apify_token = os.getenv("APIFY_API_TOKEN")

    def execute(self) -> dict:
        """
        Pesquisa de Palavras-Chave via Google Search real (Apify).
        1. Busca variações de keywords do segmento na cidade.
        2. Coleta relatedQueries (sugestões reais do Google).
        3. Conta paidResults para estimar concorrência paga.
        4. Gera um relatório de oportunidades para Google Ads.
        """
        briefing = self._empty_boss_briefing()
        
        report = {
            "name": "Keyword Research Agent",
            "score": 100,
            "findings": {
                "keywords_analyzed": [],
                "related_queries": [],
                "paid_competition_map": [],
                "opportunity_chart_data": [],
                "keyword_opportunities": [],
                "search_insights": "",
                "evidences": []
            },
            "critical_pains": [],
            "boss_briefing": briefing
        }

        company_name = self.params.get("companyName", "").strip()
        city = self.params.get("city", "").strip()
        
        if not city or city == "Cidade não informada":
            report["critical_pains"].append("Cidade não informada. Pesquisa de keywords local impossível.")
            report["score"] = 0
            return report

        # =============================================
        # 1. DETERMINAR O NICHO VIA TEXTO DO SITE
        # =============================================
        niche_hint = ""
        if self.soup:
            for script_or_style in self.soup(["script", "style"]):
                script_or_style.decompose()
            text = self.soup.get_text(separator=' ', strip=True)[:1500]
            
            # Usa o Gemini rapidamente para extrair o nicho em 1 palavra
            if self.api_key:
                try:
                    client = genai.Client(api_key=self.api_key)
                    niche_resp = client.models.generate_content(
                        model='gemini-2.0-flash',
                        contents=f"Leia o texto abaixo e responda APENAS o serviço/produto principal da empresa em no máximo 3 palavras (ex: 'dentista', 'advogado trabalhista', 'hamburgueria artesanal'). Texto: \"{text}\"",
                        config=types.GenerateContentConfig(temperature=0.0)
                    )
                    if niche_resp.text:
                        niche_hint = niche_resp.text.strip().strip('"').strip("'")
                except Exception:
                    pass
        
        if not niche_hint:
            niche_hint = company_name  # fallback

        # =============================================
        # 2. BUSCAR NO GOOGLE VIA APIFY
        # =============================================
        search_queries = [
            f"{niche_hint} {city}",
            f"{niche_hint} {city} preço",
            f"melhor {niche_hint} {city}",
        ]
        
        all_organic = []
        all_paid = []
        all_related = []
        
        try:
            from apify_client import ApifyClient
            apify_client = ApifyClient(self.apify_token)
            
            print(f"  [Keyword Agent] Pesquisando {len(search_queries)} variações de keywords para '{niche_hint}' em {city}...")
            
            run_input = {
                "queries": "\n".join(search_queries),
                "resultsPerPage": 10,
                "maxPagesPerQuery": 1,
                "languageCode": "pt-BR",
                "countryCode": "br",
                "mobileResults": False,
            }
            
            # Adicionado timeout_secs e try/except interno para não travar o motor
            run = apify_client.actor("apify/google-search-scraper").call(run_input=run_input, timeout_secs=45)
            
            dataset = apify_client.dataset(run["defaultDatasetId"])
            for item in dataset.iterate_items():
                query = item.get("searchQuery", {}).get("term", "")
                
                # Orgânicos
                for org in item.get("organicResults", [])[:5]:
                    all_organic.append({
                        "keyword": query,
                        "title": org.get("title", ""),
                        "url": org.get("url", ""),
                        "description": org.get("description", "")[:100]
                    })
                
                # Anúncios pagos (indica concorrência forte)
                paid_results = item.get("paidResults", [])
                all_paid.append({
                    "keyword": query,
                    "paid_count": len(paid_results),
                    "paid_examples": [p.get("title", "") for p in paid_results[:3]]
                })
                
                # Related queries (sugestões do Google)
                for rq in item.get("relatedQueries", []):
                    title = rq.get("title", "")
                    if title and title not in all_related:
                        all_related.append(title)
            
            print(f"  [Keyword Agent] {len(all_organic)} resultados orgânicos + {sum(p['paid_count'] for p in all_paid)} anúncios pagos mapeados.")
            
        except Exception as apify_err:
            print(f"  [Keyword Agent] Erro Apify (Ignorado): {apify_err}")
            report["findings"]["search_insights"] = "Pesquisa em tempo real indisponível. Usando projeção estatística."
            # Não retornamos mais erro crítico aqui para permitir que o relatório seja gerado mesmo sem Apify

        # =============================================
        # 3. MONTAR DADOS DE OPORTUNIDADE
        # =============================================
        report["findings"]["keywords_analyzed"] = [q for q in search_queries]
        report["findings"]["related_queries"] = all_related[:10]
        report["findings"]["paid_competition_map"] = all_paid
        
        # Chart data: keyword vs nível de concorrência paga
        opportunity_chart = []
        for paid_info in all_paid:
            kw = paid_info["keyword"]
            paid_count = paid_info["paid_count"]
            
            if paid_count == 0:
                competition_level = "Baixa"
                opportunity_score = 90
            elif paid_count <= 2:
                competition_level = "Média"
                opportunity_score = 65
            else:
                competition_level = "Alta"
                opportunity_score = 35
            
            opportunity_chart.append({
                "keyword": kw,
                "competition_level": competition_level,
                "paid_ads_count": paid_count,
                "opportunity_score": opportunity_score,
                "paid_examples": paid_info.get("paid_examples", [])
            })
        
        report["findings"]["opportunity_chart_data"] = opportunity_chart

        # =============================================
        # 4. ANÁLISE ESTRATÉGICA VIA LLM
        # =============================================
        if self.api_key or os.getenv("OPENAI_API_KEY"):
            try:
                client = genai.Client(api_key=self.api_key) if self.api_key else None
                
                organic_summary = "\n".join([
                    f"- [{r['keyword']}] {r['title']} ({r['url'][:50]})"
                    for r in all_organic[:10]
                ])
                
                paid_summary = "\n".join([
                    f"- Keyword '{p['keyword']}': {p['paid_count']} anúncios pagos"
                    for p in all_paid
                ])
                
                related_summary = ", ".join(all_related[:10])
                
                prompt = f"""
                PERSONA:
                Você é o 'Maestro Ads' (Agente 06), um estrategista de guerra cibernética e arquiteto de aquisição.
                Seu Arsenal inclui o 'Planejador de Campanhas de Guerra' e o 'Arquiteto de Funil de Conversão'.
                Sua missão é projetar o 'Plano de Dominação de Busca' e dar o 'Veredito de Poder de Compra'.

                DADOS DE RECONHECIMENTO (LIVE SEARCH):
                - Nicho Detectado: {niche_hint}
                - Cidade/Região: {city}
                - Orgânicos: {organic_summary[:1000]}
                - Anúncios Pagos: {paid_summary}
                - Buscas Sugeridas: {related_summary}
                - Site do Alvo: {self.target_url}

                SUA MISSÃO TÁTICA:
                1. TOP 10 KEYWORDS DA REGIÃO: Liste as 10 palavras-chave mais buscadas para o nicho '{niche_hint}' na cidade/região '{city}'. Categorize por intenção (Compra, Pesquisa, Comparação).
                2. PLANO DE DOMINAÇÃO DE BUSCA: Liste 5-7 palavras-chave estratégicas para "sequestrar" o mercado.
                3. VEREDITO DE PODER DE COMPRA: Onde está o dinheiro imediato? (Ex: 'Melhor [Serviço]' vs '[Serviço] Preço').
                4. MAPEAMENTO DE INTENÇÃO: Qual a dor que o anúncio deve atacar para cada busca?
                5. ESTRATEGIA DE RETARGETING: Como pegaremos o lead que o Agente 05 detectou que está 'vazando'?

                JSON OUTPUT FORMAT:
                {{
                    "top_10_keywords_regiao": [
                        {{"keyword": "palavra 1", "volume_estimado": "Alto/Médio/Baixo", "intencao": "Compra/Pesquisa/Comparação", "cidade": "{city}"}},
                        {{"keyword": "palavra 2", "volume_estimado": "Alto/Médio/Baixo", "intencao": "Compra/Pesquisa/Comparação", "cidade": "{city}"}}
                    ],
                    "search_domination_plan": ["Palavra 1", "Palavra 2"],
                    "purchasing_power_verdict": "Veredito sobre onde focar para lucro rápido",
                    "funnel_architecture_brief": "Como deve ser a jornada do lead",
                    "offensive_copy_triggers": ["Gatilho 1", "Gatilho 2"],
                    "retargeting_strategy": "Plano para fechar o furo no balde detectado pelo Agente 05",
                    "internal_boss_ammo": "Munição de ganidade sobre lucro fácil para o Boss.",
                    "alchemist_briefing": "Dica para o Agente 07 criar uma 'Oferta Irresistível' para estas palavras.",
                    "strategic_recommendations": ["Recomendação 1", "Recomendação 2"],
                    "maestro_verdict": "Veredito final de 2-3 linhas para o dossiê."
                }}
                """

                json_data = self._call_llm_json(prompt)

                if json_data and isinstance(json_data, dict):
                        report["findings"].update(json_data)
                        
                        verdict = json_data.get("maestro_verdict", "")
                        if verdict:
                            briefing["recomendacoes"].append(f"PLANO DO MAESTRO ADS: {verdict}")
                        
                        plan = json_data.get("search_domination_plan", [])
                        if plan:
                            briefing["brechas_diferenciacao"].append(f"Oportunidades de Ouro (Dominação): {', '.join(plan[:3])}")
                        
                        briefing["recomendacoes"].extend(json_data.get("strategic_recommendations", []))
                        
                        report["internal_briefing_for_boss"] = json_data.get("internal_boss_ammo", "")
                        report["internal_briefing_for_alchemist"] = json_data.get("alchemist_briefing", "")

            except Exception as gemini_err:
                print(f"  [Maestro Ads] Erro Gemini: {gemini_err}")
                report["critical_pains"].append("O Maestro Ads falhou na cognição estratégica.")

        # =============================================
        # 5. BOSS BRIEFING & SCORE
        # =============================================
        # Penalidade por baixa presença orgânica
        company_found_organically = any(company_name.lower() in r.get("title", "").lower() or company_name.lower() in r.get("url", "").lower() for r in all_organic)
        if not company_found_organically and all_organic:
            report["score"] -= 30
            briefing["pontos_negativos"].append(f"A empresa '{company_name}' NÃO aparece na primeira página orgânica estratégica em {city}.")
        elif company_found_organically:
            briefing["pontos_positivos"].append(f"Presença orgânica detectada para keywords do segmento.")

        report["score"] = max(0, report["score"])
        
        # Status de Arsenal
        if report["score"] >= 80:
            report["findings"]["strategic_readiness"] = "Pronto para Dominação Total"
        else:
            report["findings"]["strategic_readiness"] = "Vulnerável a Invasão de Busca"

        report["findings"]["evidences"].append(f"Varredura live no Google para {len(search_queries)} variações de keywords.")
        report["findings"]["evidences"].append(f"Detectados {sum(p['paid_count'] for p in all_paid)} anúncios ativos na região.")

        report["boss_briefing"] = briefing
        return report
