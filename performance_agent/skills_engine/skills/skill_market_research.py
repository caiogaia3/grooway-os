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

            # --- 2. IA ANALYSIS GROUNDED ON REAL SEARCH ---
            prompt = f"""
            Você é um analista de inteligência de mercado de elite de uma Agência de Marketing. 
            Vou te dar os dados paramétricos de um prospect coletados num formulário de Diagnóstico 360º.
            E TAMBÉM vou te fornecer os **Top Resultados Orgânicos do Google** na cidade dele agora. Sua missão é ler o que os concorrentes locais estão fazendo e diagnosticar as brechas reais.
            
            --- DADOS DO ALVO ---
            Empresa: {company_name}
            Site Institucional: {self.target_url}
            Cidade de Atuação: {city}
            Instagram URL: {insta}
            LinkedIn URL: {linkedin}
            
            --- RESULTADOS DO GOOGLE AGORA (Para embasar os Benchmarks da Cidade) ---
            {apify_context}
            
            --- CONTEÚDO ORIGINAL DO SITE DO PROSPECT ---
            "{text_context}"
            ---------------------
            
            Nós precisamos vender nossos serviços de (Trafégo, Criação de Sites, Estratégia) para eles.
            Diagnostique o prospect frente aos concorrentes mapeados no Google.
            
            Para o campo `deep_research_markdown`, elabore um "Relatório Exaustivo de Inteligência de Mercado" profundo, técnico e inegociável cruzando a macroeconomia do Brasil com a realidade da cidade de {city}. Use linguagem de consultoria C-Level (McKinsey).
            A estrutura do `deep_research_markdown` DEVE conter:
            1. Introdução Executiva e Panorama Macroeconômico (Brasil/Local)
            2. Dicotomias de Operação e Arquitetura do Negócio (Serviços Core vs Soft)
            3. A Evolução Regulatória e Impactos Jurídicos/Trabalhistas do nicho
            4. Normatização Técnica, Alvarás e Segurança Operacional
            5. Estrutura de Custos, Cadeia de Suprimentos e Mão de Obra
            6. Integração ESG e a Disrupção Tecnológica (Maturidade 4.0)
            7. Diagnóstico Geoeconômico Profundo: O Polo de {city} e Estado
            
            PROIBIÇÕES CRÍTICAS ANTIALUCINAÇÃO (Leia com atenção):
            1. Você só pode citar Dores e Objeções que façam LÓGICA IRREFUTÁVEL ao ler o site do prospect e o que os concorrentes da BUSCA REAL oferecem de diferente.
            2. Você DEVE separar claramente as DORES DO ICP (Cliente final deles) das DORES DE MARKETING da PRÓPRIA EMPRESA (ex: falta de tráfego, site ruim, não conseguir clientes, perder pro concorrente X).
            3. Em "evidences", você DEVE fazer cópia e cola (quote) COM ASPAS EXATAS ("") de frases que você leu no 'CONTEÚDO ORIGINAL DO SITE'. 
            4. Para benchmarks de concorrentes reais, CITE NOME + DADO encontrado na listagem de RESULTADOS DO GOOGLE fornecida acima.
 
            Me responda ESTRITAMENTE num formato JSON válido:
            {{
                "niche": "Nome do Nicho/Segmento exato lido no site",
                "target_icp": "Quem eles tentam atrair no site?",
                "dores_icp": ["Dor número 1 do CLIENTE FINAL (ICP) deles", "Dor 2 do ICP"],
                "sonhos_icp": ["Sonho número 1 do CLIENTE FINAL (ICP)", "Sonho 2 do ICP"],
                "objecoes_icp": ["Objeção número 1 do CLIENTE FINAL (ICP)", "Objeção 2 do ICP"],
                "dores_empresa_marketing": ["Dor número 1 DA PRÓPRIA EMPRESA relacionada a captar clientes/marketing", "Dor 2 da empresa"],
                "desafios_empresa_marketing": ["Desafio de marketing 1 da empresa", "Desafio 2"],
                "brechas_diferenciacao": ["Brecha real contra os Concorrentes no Google", "Oferta ignorada"],
                "competitor_benchmarks": [
                    "Nome Concorrente 1 do Google Acima: Avaliação de força",
                    "Nome Concorrente 2 do Google Acima: Brecha ou Força"
                ],
                "deep_research_markdown": "O mega dossiê formatado em Markdown com as 7 secções exigidas.",
                "evidences": [
                    "Evidência do SITE: 'COLOQUE A FRASE EXATA LIDA AQUI.'",
                    "Evidência da BUSCA: Fato lido nos snippets do Google sobre o concorrente Y"
                ]
            }}
            
            Em hipótese alguma retorne Markdown (como ```json). Apenas o objeto puro JSON."
            """

            # Removemos request_mime_type="application/json" pq Grounding com JSON mode conflita na API REST (Gera Erro 400)
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.3
                )
            )

            if response.text:
                raw_text = response.text
                import re
                
                # Procura explicitamente o primeiro { e o último } para limpar conversas fora do JSON
                start_idx = raw_text.find('{')
                end_idx = raw_text.rfind('}')
                
                if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                    raw_text = raw_text[start_idx:end_idx+1]
                    
                # Tentativa de parse
                try:
                    json_data = json.loads(raw_text)
                    report["findings"] = json_data
                except json.JSONDecodeError as e:
                    report["critical_pains"].append(f"Erro no parse de IA: O Google Search Grounding gerou um formato inválido: {str(e)}")
            else:
                report["critical_pains"].append("O Agente Gemini não retornou insights.")
                
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                if self.openai_api_key:
                    try:
                        from openai import OpenAI
                        openai_client = OpenAI(api_key=self.openai_api_key)
                        
                        prompt_fallback = prompt + "\nNote: Search grounding is unavailable. Use your vast internal knowledge to complete the analysis."
                        
                        oai_response = openai_client.chat.completions.create(
                            model="gpt-4o-mini",
                            messages=[
                                {"role": "system", "content": "You are an API that outputs valid JSON only."},
                                {"role": "user", "content": prompt_fallback}
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
                        report["critical_pains"].append(f"Limite do Gemini atingido e falha no Fallback (OpenAI): {fallback_e}")
                else:
                    report["critical_pains"].append("Cérebro de Inteligência Competitiva sobrecarregado (Cota Gemini 429). Aguarde 1 minuto.")
            else:
                report["critical_pains"].append(f"Erro no cérebro da inteligência: {e}")
            
        # Boss briefing baseado nos findings da pesquisa de mercado
        findings = report.get("findings", {})
        if findings.get("niche") and findings["niche"] != "Desconhecido":
            briefing["pontos_positivos"].append(f"Nicho identificado: {findings['niche']}. ICP: {findings.get('target_icp', 'N/A')}.")
        
        for brecha in findings.get("brechas_diferenciacao", []):
            briefing["brechas_diferenciacao"].append(brecha)
        
        for benchmark in findings.get("competitor_benchmarks", []):
            briefing["recomendacoes"].append(f"Boss, benchmark de concorrente local: {benchmark}")
        
        for dor in findings.get("dores_icp", []):
            briefing["pontos_negativos"].append(f"Dor do ICP (Cliente Final): {dor}")
            
        for dor in findings.get("dores_empresa_marketing", []):
            briefing["pontos_negativos"].append(f"Dor de Marketing da Própria Empresa: {dor}")
        
        report["boss_briefing"] = briefing
        return report
