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
            Você é o 'ESTRATEGISTA PSICOGRÁFICO & ESPIÃO DE MERCADO' (Agente 04). Você não é um generalista; você é um analista de elite treinado em inteligência competitiva e comportamento humano.
            Seu objetivo é dissecar a alma do mercado e os medos mais profundos da empresa alvo.
            
            ARSENAL:
            - 'The Shadow Avatar': Mapeamento do que o cliente final REALMENTE quer (e o que ele tem medo de admitir).
            - 'The Anchor of Inefficiency': Identificação de por que a empresa alvo está presa em um ciclo de vendas medíocre.
            - 'Radar de Concorrência Local': Análise real baseada nos snippets do Google.

            DADOS DE CAMPO:
            - Empresa Alvo: {company_name}
            - Localização: {city}
            - Contexto Digital (Site): "{text_context}"
            - Radar de Concorrência Google (Realidade Local):
            {apify_context}

            SUA MISSÃO - ENTREGUE UM ARQUIVO DE INTELIGÊNCIA EM JSON COM:

            1. PSICOGRAFIA PROFUNDA DO CLIENTE IDEAL (ICP):
               - DORES REAIS: O que tira o sono dele à noite? (Ex: Medo de ser enganado, medo do negócio quebrar, medo de parecer incompetente).
               - SONHOS E DESEJOS: O que ele quer que mude na vida dele se contratar esse serviço? Como ele quer ser visto pelos outros?
               - OBJEÇÕES DE FERRO: Por que ele diz "não" mesmo precisando? (Ex: Trauma com agências anteriores, medo de custo escondido, dúvida sobre autoridade).

            2. RADIOGRAFIA COMERCIAL DA EMPRESA ALVO:
               - DORES DE NEGÓCIO: Por que eles estão perdendo para os rivais de {city}? (Ex: Ciclo de venda muito longo, dependência de indicação, site que parece amador perto dos concorrentes).
               - DESEJOS E SONHOS DA EMPRESA: Onde o dono da empresa quer chegar? (Ex: Ter um negócio previsível, parar de trabalhar 14h por dia, ser a referência absoluta na região).
               - OBJEÇÕES E GARGALOS INTERNOS: O que impede eles de escalarem? (Ex: Processo comercial inexistente, medo de investir em anúncios, incapacidade de comunicar valor premium).

            3. THREAT MATRIX (CONCORRÊNCIA):
               - Use os nomes Reais listados no Radar. Critique de forma ácida: "O Rival X domina no Google Maps mas peca no atendimento", "O Rival Y tem um site mobile melhor que o nosso alvo".

            4. VEREDITO DO ESPIÃO:
               - Seja implacável. Se a empresa está perdendo dinheiro por ser "genérica", diga isso. Use um tom consultivo e direto ao ponto.

            JSON OUTPUT FORMAT (MANDATÓRIO):
            {{
                "niche": "Segmento exato e sofisticado",
                "executive_summary_clevel": "Um parágrafo de impacto sobre o posicionamento atual vs potencial.",
                "target_icp": "Perfil psicológico denso do cliente",
                "dores_icp": ["Dor visceral 1", "Dor visceral 2", "Dor 3"],
                "sonhos_icp": ["Desejo profundo 1", "Sonho de status"],
                "objecoes_icp": ["Medo do investimento falhar", "Dúvida sobre entrega"],
                "desejos_icp": ["Desejo imediato 1", "Desejo 2"],
                
                "dores_empresa_marketing": ["Gargalo comercial 1", "Perda de leads 2"],
                "sonhos_empresa": ["Previsibilidade", "Autoridade Local"],
                "desejos_empresa": ["Desejo de escala", "Desejo de equipe"],
                "objecoes_venda_empresa": ["Trauma com marketing", "Mentalidade de preço baixo"],
                
                "desafios_empresa_marketing": ["Desafio técnico 1", "Desafio 2"],
                "brechas_diferenciacao": ["Brecha 1", "Brecha 2"],
                
                "commoditization_verdict": "Veredito técnico sobre a briga por preço vs valor",
                "blue_ocean_map": "Como quebrar a paridade com os rivais de {city}?",
                "competitor_benchmarks": ["Benchmark real 1 + análise ácida", "Benchmark real 2 + análise ácida"],
                "deep_research_markdown": "### Dossiê de Inteligência Estratégica\\n\\nEscreva 4-5 parágrafos densos e persuasivos em Markdown sobre o mercado, o ICP e as falhas críticas de posicionamento encontradas.",
                "market_verdict": "Sentença final do espião: Por que eles perdem dinheiro hoje?",
                "internal_boss_ammo": "3 argumentos de fechamento letais que o Boss usará para provar que a Grooway é a única solução."
            }}
            """

            # Ativação do LLM (Gemini com fallback OpenAI)
            json_data = self._call_llm_json(prompt)

            if json_data and isinstance(json_data, dict):
                    # Compatibilidade de arrays que o front espera iterar
                    for key in ["dores_icp", "sonhos_icp", "objecoes_icp", "desejos_icp", 
                                "dores_empresa_marketing", "sonhos_empresa", "desejos_empresa", 
                                "objecoes_venda_empresa", "desafios_empresa_marketing", "brechas_diferenciacao"]:
                        if key not in json_data:
                            json_data[key] = []
                    
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
                        
                    threats = json_data.get("competitor_benchmarks", [])
                    if threats:
                        for idx, t in enumerate(threats[:3]):
                            briefing["pontos_negativos"].append(f"Ameaça Local {idx+1}: {t}")
                    
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
