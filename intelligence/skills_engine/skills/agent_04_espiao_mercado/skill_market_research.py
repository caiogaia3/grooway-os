from skills_engine.core import PredatorSkill
import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Carrega chaves do .env.local que está na raiz do Next.js (um nível acima)
load_dotenv(dotenv_path="../raio-x-digital/.env.local")

class MarketResearchSkill(PredatorSkill):
    def __init__(self, target_url, params=None):
        super().__init__(target_url)
        self.params = params or {}
        
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

    def execute(self) -> dict:
        """
        Lê o texto do site para entender o nicho e usa o Gemini para criar
        um dossiê de Pesquisa de Mercado (concorrentes típicos, dores do setor).
        Isso serve como "Memória Estratégica" para a Proposta Final.
        """
        briefing = self._empty_boss_briefing()
        
        report = {
            "name": "Market Research & Intelligence",
            "score": 100,
            "findings": {
                "niche": "Desconhecido",
                "target_icp": "",
                "dores_icp": [],
                "sonhos_icp": [],
                "objecoes_icp": [],
                "dores_empresa_marketing": [],
                "desafios_empresa_marketing": [],
                "brechas_diferenciacao": [],
                "competitor_benchmarks": [],
                "deep_research_markdown": "",
                "evidences": []
            },
            "critical_pains": [],
            "boss_briefing": briefing
        }

        if not self.soup:
            report["critical_pains"].append("Scraper falhou. Não foi possível extrair o texto alvo para a IA.")
            return report

        if not self.api_key:
            report["critical_pains"].append("API Key do Gemini não encontrada na skill Python.")
            return report

        try:
            # Extrair texto legível da home page
            for script_or_style in self.soup(["script", "style", "nav", "footer"]):
                script_or_style.decompose()

            text_content = self.soup.get_text(separator=' ', strip=True)
            # Limitar a ~3000 caracteres para ser rápido e econômico
            text_context = text_content[:3000]

            company_name = self.params.get("companyName", "Empresa alvo")
            city = self.params.get("city", "Cidade não informada")
            insta = self.params.get("instagram", "Não informado")
            linkedin = self.params.get("linkedin", "Não informado")

            client = genai.Client(api_key=self.api_key)
            apify_token = os.getenv("APIFY_API_TOKEN") # Note: A chave no .env atual costuma ser APIFY_API_TOKEN
            
            # --- 1. THE "INVESTIGATE" ACTION: APIFY GOOGLE SEARCH ---
            apify_context = "Pesquisa em tempo real no Google não realizada (Falta de Token ou Erro)."
            if apify_token and company_name != "Empresa alvo" and city != "Cidade não informada":
                try:
                    from apify_client import ApifyClient
                    apify_client = ApifyClient(apify_token)
                    # Busca genérica pelo serviço/nicho na cidade informada para achar concorrentes
                    search_query = f"{company_name} {city} concorrentes OR serviços na cidade de {city}"
                    
                    run_input = {
                        "queries": f"{search_query}",
                        "resultsPerPage": 5,
                        "maxPagesPerQuery": 1,
                        "languageCode": "pt-BR",
                        "mobileResults": False,
                    }
                    
                    print(f"  [Market Research] Investigando concorrentes no Google via Apify para '{search_query}'...")
                    # Adicionado timeout de 45 segundos para evitar travamento total do motor
                    run = apify_client.actor("apify/google-search-scraper").call(run_input=run_input, timeout_secs=45)
                    
                    snippets = []
                    if run and run.get("defaultDatasetId"):
                        dataset = apify_client.dataset(run["defaultDatasetId"])
                        for item in dataset.iterate_items():
                            org_results = item.get("organicResults", [])
                            for res in org_results[:5]: # Pega os top 5
                                snippets.append(f"- [{res.get('title')}] {res.get('description')} (URL: {res.get('url')})")
                    
                    if snippets:
                        apify_context = "RESULTADOS ORGÂNICOS REAIS DO GOOGLE NA CIDADE (Top 5):\n" + "\n".join(snippets)
                        print(f"  [Market Research] +{len(snippets)} concorrentes mapeados no Google.")
                    else:
                        print(f"  [Market Research] Nenhum snippet orgânico encontrado no Google.")
                except Exception as apify_err:
                    print(f"  [Market Research] Erro na busca ativa Apify (Ignorado para continuidade): {apify_err}")
                    apify_context = "Atenção: Pesquisa ativa falhou (Timeout ou Erro de API). Prosseguindo com conhecimento interno."

            # --- 2. IA ANALYSIS GROUNDED ON REAL SEARCH (Arsenal Elite) ---
            prompt = f"""
            PERSONA:
            Você é o 'ESTRATEGISTA PSICOGRÁFICO & ESPIÃO DE MERCADO' (Agente 04). Você é um analista de elite especializado em ler as entrelinhas do mercado.
            
            SUA MISSÃO: Realizar um 'Espelhamento de Dores' (Mirror of Pains) explorando dois lados:
            
            LADO A: A EMPRESA PESQUISADA ({company_name})
            - Sonhos da Empresa: O que o dono quer alcançar? (Previsibilidade, escala, sair do operacional).
            - Dores de Aquisição: Por que o marketing deles é um gargalo? (Lead caro, falta de processo, site amador).
            - Objeções à Agência: Por que eles têm medo de contratar marketing? (Traumas passados, medo de queimar caixa).

            LADO B: O CLIENTE FINAL (ICP) do segmento "{report['findings']['niche']}"
            - Sonhos do Cliente: O que ele ganha ao contratar o serviço desse nicho? (Paz de espírito, lucro, status).
            - Dores do Cliente: O que tira o sono dele em relação ao problema que essa empresa resolve?
            - Objeções do Cliente: Por que ele hesita em fechar com empresas como a {company_name}?

            DADOS DE CONTEXTO:
            - Local: {city}
            - Site: "{text_context}"
            - Radar Google: {apify_context}

            JSON OUTPUT FORMAT:
            {{
                "niche": "Segmento exato",
                "executive_summary_clevel": "Análise densa sobre o GAP entre a oferta atual e o desejo do mercado.",
                
                "company_profile": {{
                    "dreams": ["...", "..."],
                    "acquisition_pains": ["...", "..."],
                    "sales_objections": ["...", "..."]
                }},
                
                "icp_psychography": {{
                    "dreams": ["...", "..."],
                    "deep_pains": ["...", "..."],
                    "buying_objections": ["...", "..."]
                }},

                "competitor_benchmarks": ["Benchmark 1 + Análise Ácida", "..."],
                "deep_research_markdown": "### Dossiê de Inteligência Estratégica\\n\\nEscreva 6-8 parágrafos densos divididos em: Panorama Local, Psicologia do ICP, Falhas de Posicionamento e Oceano Azul.",
                "market_verdict": "Veredito final do espião sobre por que eles não são líderes hoje.",
                "internal_boss_ammo": "3 argumentos de fechamento brutais baseados nessa pesquisa."
            }}
            """
            """

            # Ativação do LLM (Gemini com fallback OpenAI)
            json_data = self._call_llm_json(prompt)

            if json_data and isinstance(json_data, dict):
                    report["findings"] = json_data
                    
                    # Ensure legacy/flat keys for backward compatibility or simple UI logic
                    report["findings"]["dores_icp"] = json_data.get("icp_psychography", {}).get("deep_pains", [])
                    report["findings"]["sonhos_icp"] = json_data.get("icp_psychography", {}).get("dreams", [])
                    report["findings"]["objecoes_icp"] = json_data.get("icp_psychography", {}).get("buying_objections", [])
                    
                    report["findings"]["dores_empresa_marketing"] = json_data.get("company_profile", {}).get("acquisition_pains", [])
                    report["findings"]["sonhos_empresa"] = json_data.get("company_profile", {}).get("dreams", [])
                    report["findings"]["objecoes_venda_empresa"] = json_data.get("company_profile", {}).get("sales_objections", [])
                    
                    # Injeção no Briefing do Arsenal
                    verdict = json_data.get("market_verdict", "")
                    if verdict:
                        briefing["recomendacoes"].append(f"SENTENÇA DO ESPIÃO DE MERCADO: {verdict}")
                    
                    report["internal_briefing_for_boss"] = json_data.get("internal_boss_ammo", "")

            else:
                report["critical_pains"].append("O Radar de Inteligência não retornou sinais (Vácuo de IA).")
                
        except Exception as e:
            print(f"  [Market Agent] Falha na cognição: {e}")
            report["critical_pains"].append(f"Erro no cérebro da inteligência: {e}")
            
        # Alinhamento final do Briefing baseando nos findings
        findings = report.get("findings", {})
        if isinstance(findings, dict):
            # Concorrentes
            benchmarks = findings.get("competitor_benchmarks", [])
            if isinstance(benchmarks, list):
                for benchmark in benchmarks:
                    briefing["recomendacoes"].append(f"Rival Mapeado (Alvo): {benchmark}")
            
            # Dores
            dores = findings.get("dores_icp", [])
            if isinstance(dores, list):
                for dor in dores:
                    briefing["pontos_negativos"].append(f"Dor Silenciosa do Mercado: {dor}")
        
        report["score"] = max(0, report["score"])
        report["boss_briefing"] = briefing
        return report
