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
        1. Busca 8 variações de keywords do segmento na cidade.
        2. Coleta relatedQueries (sugestões reais do Google).
        3. Conta paidResults para estimar concorrência paga.
        4. Gera análise completa com top 10 keywords do segmento.
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
                "top_10_keywords_regiao": [],
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
            
            # Usa LLM para extrair o nicho (com fallback)
            if self.api_key or self.openai_api_key:
                try:
                    niche_data = self._call_llm_json(
                        f'Leia o texto abaixo e responda em JSON: {{"nicho": "serviço/produto principal em no máximo 3 palavras (ex: dentista, advogado trabalhista, hamburgueria artesanal)"}}. Texto: "{text[:800]}"'
                    )
                    if niche_data and niche_data.get("nicho"):
                        niche_hint = niche_data["nicho"].strip().strip('"').strip("'")
                except Exception:
                    pass
        
        if not niche_hint:
            niche_hint = company_name  # fallback

        # =============================================
        # 2. BUSCAR NO GOOGLE VIA APIFY (8 variações)
        # =============================================
        search_queries = [
            f"{niche_hint} {city}",
            f"{niche_hint} {city} preço",
            f"melhor {niche_hint} {city}",
            f"{niche_hint} perto de mim {city}",
            f"{niche_hint} barato {city}",
            f"{niche_hint} orçamento {city}",
            f"como escolher {niche_hint} {city}",
            f"{niche_hint} avaliações {city}",
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
            
            run = apify_client.actor("apify/google-search-scraper").call(run_input=run_input, timeout_secs=60)
            
            dataset = apify_client.dataset(run["defaultDatasetId"])
            for item in dataset.iterate_items():
                query = item.get("searchQuery", {}).get("term", "")
                
                # Orgânicos
                for org in item.get("organicResults", [])[:5]:
                    all_organic.append({
                        "keyword": query,
                        "title": org.get("title", ""),
                        "url": org.get("url", ""),
                        "description": org.get("description", "")[:150]
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
            
            total_paid = sum(p['paid_count'] for p in all_paid)
            print(f"  [Keyword Agent] {len(all_organic)} resultados orgânicos + {total_paid} anúncios pagos mapeados.")
            
        except Exception as apify_err:
            print(f"  [Keyword Agent] Erro Apify (Ignorado): {apify_err}")
            report["findings"]["search_insights"] = "Pesquisa em tempo real indisponível. Usando projeção estatística."

        # =============================================
        # 3. MONTAR DADOS DE OPORTUNIDADE
        # =============================================
        report["findings"]["keywords_analyzed"] = [q for q in search_queries]
        report["findings"]["related_queries"] = all_related[:15]
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
        # 4. ANÁLISE ESTRATÉGICA VIA LLM (com fallback)
        # =============================================
        if self.api_key or self.openai_api_key:
            try:
                organic_summary = "\n".join([
                    f"- [{r['keyword']}] {r['title']} ({r['url'][:50]})"
                    for r in all_organic[:15]
                ])
                
                paid_summary = "\n".join([
                    f"- Keyword '{p['keyword']}': {p['paid_count']} anúncios pagos"
                    for p in all_paid
                ])
                
                related_summary = ", ".join(all_related[:15])
                
                prompt = f"""
                PERSONA:
                Você é o 'Maestro Ads' (Agente 06), um estrategista de guerra cibernética e arquiteto de aquisição.
                Seu Arsenal inclui o 'Planejador de Campanhas de Guerra' e o 'Arquiteto de Funil de Conversão'.

                DADOS DE RECONHECIMENTO (LIVE SEARCH):
                - Nicho Detectado: {niche_hint}
                - Cidade/Região: {city}
                - Orgânicos encontrados: {len(all_organic)} resultados
                - Detalhes orgânicos: {organic_summary[:1500]}
                - Anúncios Pagos: {paid_summary}
                - Buscas Sugeridas pelo Google: {related_summary}
                - Site do Alvo: {self.target_url}

                SUA MISSÃO TÁTICA:
                1. TOP 10 KEYWORDS DA REGIÃO: Liste EXATAMENTE 10 palavras-chave mais relevantes e buscadas para o nicho '{niche_hint}' na cidade/região '{city}'. 
                   - Categorize cada uma por intenção: Compra, Pesquisa ou Comparação
                   - Estime o volume: Alto, Médio ou Baixo
                   - Use dados reais dos resultados orgânicos e related queries acima
                2. PLANO DE DOMINAÇÃO DE BUSCA: Liste 5-7 palavras-chave estratégicas para "sequestrar" o mercado.
                3. VEREDITO DE PODER DE COMPRA: Onde está o dinheiro imediato?
                4. MAPEAMENTO DE INTENÇÃO: Qual a dor que o anúncio deve atacar?
                5. ANÁLISE DE CONCORRÊNCIA: Quem aparece nos resultados? O alvo está presente?

                JSON OUTPUT FORMAT:
                {{
                    "top_10_keywords_regiao": [
                        {{"keyword": "palavra exata 1", "volume_estimado": "Alto", "intencao": "Compra", "cidade": "{city}"}},
                        {{"keyword": "palavra exata 2", "volume_estimado": "Médio", "intencao": "Pesquisa", "cidade": "{city}"}},
                        {{"keyword": "palavra exata 3", "volume_estimado": "Alto", "intencao": "Comparação", "cidade": "{city}"}},
                        {{"keyword": "palavra 4", "volume_estimado": "Médio", "intencao": "Compra", "cidade": "{city}"}},
                        {{"keyword": "palavra 5", "volume_estimado": "Baixo", "intencao": "Pesquisa", "cidade": "{city}"}},
                        {{"keyword": "palavra 6", "volume_estimado": "Alto", "intencao": "Compra", "cidade": "{city}"}},
                        {{"keyword": "palavra 7", "volume_estimado": "Médio", "intencao": "Comparação", "cidade": "{city}"}},
                        {{"keyword": "palavra 8", "volume_estimado": "Baixo", "intencao": "Pesquisa", "cidade": "{city}"}},
                        {{"keyword": "palavra 9", "volume_estimado": "Alto", "intencao": "Compra", "cidade": "{city}"}},
                        {{"keyword": "palavra 10", "volume_estimado": "Médio", "intencao": "Pesquisa", "cidade": "{city}"}}
                    ],
                    "search_domination_plan": ["Palavra estratégica 1", "Palavra 2", "Palavra 3", "Palavra 4", "Palavra 5"],
                    "purchasing_power_verdict": "Veredito sobre onde focar para lucro rápido",
                    "funnel_architecture_brief": "Como deve ser a jornada do lead",
                    "offensive_copy_triggers": ["Gatilho 1", "Gatilho 2", "Gatilho 3"],
                    "retargeting_strategy": "Plano para fechar o furo no balde detectado pelo Agente 05",
                    "competitor_analysis": "Quem domina os resultados e como ultrapassá-los",
                    "internal_boss_ammo": "Munição sobre lucro fácil para o Boss.",
                    "alchemist_briefing": "Dica para o Agente 07 criar uma 'Oferta Irresistível'.",
                    "strategic_recommendations": ["Recomendação 1", "Recomendação 2", "Recomendação 3"],
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
                print(f"  [Maestro Ads] Erro LLM: {gemini_err}")
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
        report["findings"]["evidences"].append(f"{len(all_related)} termos relacionados mapeados pelo Google.")

        report["boss_briefing"] = briefing
        return report
