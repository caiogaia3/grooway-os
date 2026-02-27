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
        
        from dotenv import load_dotenv
        load_dotenv(dotenv_path=".env")
        load_dotenv(dotenv_path="../raio-x-digital/.env.local")
        
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
            "name": "Market Intelligence Agent",
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
            Você é o 'Espião de Mercado' (Agente 04), um perito em espionagem industrial focado em mapear o 'Oceano Azul' do cliente.
            Seu Arsenal inclui o 'Simulador de Cliente (Mystery Shopper)' e o 'Rastreador de Pegada Digital Competitiva'.
            Sua missão é dar o 'Veredito de Comoditização' e identificar a 'Diferenciação Irresistível'.

            EQUIPAMENTO DE RECONHECIMENTO (DADOS):
            - Alvo: {company_name} em {city}
            - Site: {self.target_url}
            - Radar de Concorrência (Top Players Reais):
            {apify_context}
            - Lexicon do Alvo (Semântica):
            "{text_context}"
            
            SUA MISSÃO FORENSE:
            1. VEREDITO DE COMODITIZAÇÃO: O cliente é apenas 'mais um' ou tem uma marca que gera desejo?
            2. MAPEAMENTO DE OCEANO AZUL: Onde a concorrência é cega e o alvo pode dominar sem brigar por preço?
            3. INTELIGÊNCIA DE PREÇO PSICOLÓGICO: O marketing atual sustenta um ticket alto ou desvaloriza o serviço?
            4. RASTREADOR DE PEGADA COMPETITIVA: Quem são os rivais que estão 'asfixiando' o crescimento do alvo?

            JSON OUTPUT FORMAT:
            {{
                "niche": "Nome técnico do nicho",
                "target_icp": "Perfil do cliente ideal (Quem compra?)",
                "commoditization_verdict": "Veredito sobre ser ou não uma commodity",
                "blue_ocean_map": "Onde está o caminho de menor resistência?",
                "price_intelligence": "Análise de valor vs preço percebido",
                "competitor_vulnerabilities": ["Vulnerabilidade 1", "Vulnerabilidade 2"],
                "dores_icp": ["Dor do cliente final 1", "Dor 2"],
                "competitor_benchmarks": ["Benchmark 1 (Nome + Falha de Armadura)"],
                "deep_research_markdown": "Mega Dossiê formatado em Markdown (7 seções)",
                "evidences": ["Trecho literal que prova a falta de diferenciação"],
                "internal_boss_ammo": "Munição tática de mercado para o Boss fechar a venda.",
                "alchemist_briefing": "Briefing para o Agente 07 criar uma oferta impossível de ignorar.",
                "market_verdict": "Sentença implacável de 2-3 linhas sobre o cenário competitivo."
            }}
            """

            # Ativação do Gemini 2.0 Flash
            response = client.models.generate_content(
                model='gemini-2.0-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    response_mime_type="application/json"
                )
            )

            if response.text:
                json_data = json.loads(response.text)
                if isinstance(json_data, dict):
                    report["findings"] = json_data
                    
                    # Injeção no Briefing do Arsenal
                    verdict = json_data.get("market_verdict", "")
                    if verdict:
                        briefing["recomendacoes"].append(f"SENTENÇA DO ESPIÃO DE MERCADO: {verdict}")
                    
                    commoditization = json_data.get("commoditization_verdict", "")
                    if "Commodity" in str(commoditization) or "Comoditizado" in str(commoditization):
                        report["score"] -= 25
                        briefing["pontos_negativos"].append(f"Veredito de Comoditização: {commoditization}")
                    
                    blue_ocean = json_data.get("blue_ocean_map", "")
                    if blue_ocean:
                        briefing["brechas_diferenciacao"].append(f"Oceano Azul Identificado: {blue_ocean}")
                    
                    report["internal_briefing_for_boss"] = json_data.get("internal_boss_ammo", "")
                    report["internal_briefing_for_alchemist"] = json_data.get("alchemist_briefing", "")

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
