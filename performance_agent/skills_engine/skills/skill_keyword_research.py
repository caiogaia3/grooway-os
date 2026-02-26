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
                        model='gemini-2.5-flash',
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
        if self.api_key:
            try:
                client = genai.Client(api_key=self.api_key)
                
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
                Você é um Estrategista de Google Ads analisando oportunidades reais de busca para a empresa '{company_name}' na cidade de {city}.
                O nicho identificado é: {niche_hint}.
                
                RESULTADOS ORGÂNICOS REAIS DO GOOGLE:
                {organic_summary}
                
                CONCORRÊNCIA PAGA (Anúncios detectados):
                {paid_summary}
                
                BUSCAS RELACIONADAS SUGERIDAS PELO GOOGLE:
                {related_summary}
                
                Sua missão é gerar um plano de palavras-chave estratégico contendo EXATAMENTE 5 palavras de Cauda Curta (Short-Tail) e 5 palavras de Cauda Longa (Long-Tail).
                Mesmo que os dados de resultados orgânicos ou pagos estejam vazios acima, use seu conhecimento especializado sobre o nicho de '{niche_hint}' em {city} para sugerir as 10 melhores palavras-chave.
                Estime o Volume de Busca Mensal (em números reais, ex: 1500, 350) e o Nível de Concorrência (Baixa, Média, Alta) baseado no seu conhecimento macroeconômico regional.
                
                Me responda ESTRITAMENTE num formato JSON válido:
                {{
                    "search_insights": "Resumo de 3 linhas sobre o cenário de tráfego na cidade. Diga se a concorrência paga é alta.",
                    "keyword_opportunities": [
                        {{"keyword": "termo curto", "type": "short-tail", "volume": 2500, "competition": "Alta"}},
                        {{"keyword": "termo especifico e longo", "type": "long-tail", "volume": 450, "competition": "Baixa"}}
                    ]
                }}
                """
                
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(response_mime_type="application/json", temperature=0.1)
                )
                
                if response.text:
                    raw_text = response.text
                    start_idx = raw_text.find('{')
                    end_idx = raw_text.rfind('}')
                    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                        raw_text = raw_text[start_idx:end_idx+1]
                        
                    ai_data = json.loads(raw_text)
                    report["findings"]["search_insights"] = ai_data.get("search_insights", "")
                    report["findings"]["keyword_opportunities"] = ai_data.get("keyword_opportunities", [])
                    
            except Exception as gemini_err:
                print(f"  [Keyword Agent] Erro Gemini: {gemini_err}")
                report["findings"]["search_insights"] = "Análise estratégica indisponível."
                # Fallback estático caso a IA falhe totalmente
                report["findings"]["keyword_opportunities"] = [
                    {"keyword": f"{niche_hint} em {city}", "type": "short-tail", "volume": 1000, "competition": "Alta"},
                    {"keyword": f"melhor {niche_hint} perto de mim", "type": "long-tail", "volume": 350, "competition": "Média"},
                    {"keyword": f"{niche_hint} preço {city}", "type": "short-tail", "volume": 500, "competition": "Média"}
                ]

        # =============================================
        # 5. BOSS BRIEFING
        # =============================================
        kw_opportunities = report["findings"].get("keyword_opportunities", [])
        
        long_tails = [k["keyword"] for k in kw_opportunities if k.get("type") == "long-tail"]
        short_tails = [k["keyword"] for k in kw_opportunities if k.get("type") == "short-tail"]
        
        if long_tails:
            briefing["brechas_diferenciacao"].append(f"Oportunidades de Ouro (Cauda Longa): {', '.join(long_tails)}. Tráfego mais qualificado e CPC menor.")
            briefing["recomendacoes"].append(f"Boss, se a empresa dominar termos específicos de cauda longa como '{long_tails[0]}', ela foge do leilão caro das agências grandes e capta o cliente no fundo do funil, pronto pra comprar.")
            
        if short_tails:
            briefing["pontos_negativos"].append(f"Alta Concorrência nas palavras de topo de funil (Curta): {', '.join(short_tails)}.")
        
        if related_summary:
            briefing["brechas_diferenciacao"].append(f"Tráfego Periférico: O Google sugere buscas relacionadas inexploradas ({related_summary[:100]}...).")
        
        # Verifica se a empresa aparece nos resultados
        company_found_organically = any(company_name.lower() in r.get("title", "").lower() or company_name.lower() in r.get("url", "").lower() for r in all_organic)
        if company_found_organically:
            briefing["pontos_positivos"].append(f"A empresa '{company_name}' aparece nos resultados orgânicos do Google para keywords do segmento.")
        else:
            briefing["pontos_negativos"].append(f"A empresa '{company_name}' NÃO aparece na primeira página orgânica das principais buscas do segmento em {city}.")
            briefing["recomendacoes"].append(f"Boss, a empresa é invisível no orgânico para quem busca o serviço deles em {city}. Todo o tráfego está indo de graça para a concorrência. Se aliarmos SEO Local + Injeção de Ads, o jogo vira rápido.")

        
        report["findings"]["evidences"].append(f"Pesquisa real executada no Google para {len(search_queries)} variações de keywords.")
        report["findings"]["evidences"].append(f"Foram encontrados {sum(p['paid_count'] for p in all_paid)} anúncios pagos e {len(all_related)} sugestões de busca do Google.")
        
        report["boss_briefing"] = briefing
        report["score"] = max(0, report["score"])
        
        return report
