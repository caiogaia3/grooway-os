from skills_engine.core import PredatorSkill
from apify_client import ApifyClient
import os
import json
import re
from google import genai
from google.genai import types

class SocialMediaResearchSkill(PredatorSkill):
    def __init__(self, target_handle):
        # Limpa o input do usuário. Tratando se for URL ou se tiver '@'
        clean_handle = target_handle.strip().rstrip('/')
        if 'instagram.com/' in clean_handle:
            clean_handle = clean_handle.split('instagram.com/')[-1].split('?')[0]
        if clean_handle.startswith('@'):
            clean_handle = clean_handle[1:]
            
        super().__init__(f"https://instagram.com/{clean_handle}")
        self.target_handle = clean_handle
        self.apify_token = os.getenv("APIFY_API_TOKEN")
        
        from dotenv import load_dotenv
        load_dotenv(dotenv_path=".env")
        load_dotenv(dotenv_path="../raio-x-digital/.env.local")
        
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

    def _extract_urls_from_text(self, text):
        """Extrai URLs encontradas em um texto (bio, etc)."""
        url_pattern = r'https?://[^\s<>"\']+|(?:www\.)[^\s<>"\']+|[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}(?:/[^\s<>"\']*)?'
        matches = re.findall(url_pattern, text)
        return [m for m in matches if len(m) > 5]

    def _scrape_link_compiler(self, url):
        """Tenta abrir um linktree/compilador e raspar os links diretos dele."""
        try:
            import requests
            from bs4 import BeautifulSoup
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
            resp = requests.get(url, headers=headers, timeout=5)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, 'html.parser')
                links = []
                for a in soup.find_all('a', href=True):
                    href = a['href']
                    if href.startswith('http') and 'linktr.ee' not in href and 'instagram.com' not in href:
                        links.append(href)
                return list(set(links))[:8]
        except:
            pass
        return []

    def execute(self) -> dict:
        briefing = self._empty_boss_briefing()
        
        report = {
            "name": "Social Media Agent (Apify + AI)",
            "score": 0,
            "findings": {
                "followers": 0,
                "posts_count": 0,
                "bio_has_link": False,
                "bio_links": [],
                "compiled_links": [],
                "bio_text": "",
                "engagement_estimate": "N/A",
                "sales_alignment": "Não analisado pela IA",
                "authority_triggers": "Não analisado pela IA",
                "content_ideas": [],
                "is_profile_selling": False,
                "evidences": []
            },
            "critical_pains": [],
            "boss_briefing": briefing
        }
        
        if not self.target_handle:
            report["critical_pains"].append("Nenhuma conta de Instagram mapeada ou inferida do formulário.")
            return report

        try:
            client = ApifyClient(self.apify_token)
            
            run_input = {
                "usernames": [self.target_handle],
            }

            run = client.actor("apify/instagram-profile-scraper").call(run_input=run_input)
            
            profile = None
            for item in client.dataset(run["defaultDatasetId"]).iterate_items():
                profile = item
                break
                
            if not profile:
                report["critical_pains"].append(f"A API da Apify não encontrou dados públicos para a conta '{self.target_handle}'.")
                report["score"] = 10
                briefing["pontos_negativos"].append(f"Perfil @{self.target_handle} não localizado no Instagram.")
                return report

            # Detecta resposta de erro da Apify
            if profile.get("error"):
                error_type = profile.get("error", "unknown")
                error_desc = profile.get("errorDescription", "Sem descrição")
                report["critical_pains"].append(
                    f"A conta @{self.target_handle} não foi localizada ({error_type}: {error_desc}). "
                    "Verifique se o nome está correto ou se a conta é privada."
                )
                report["findings"]["engagement_estimate"] = "Não Localizado"
                report["score"] = 5
                briefing["pontos_negativos"].append(f"Perfil @{self.target_handle} inacessível ou inexistente.")
                return report

            followers = profile.get("followersCount", 0)
            posts = profile.get("postsCount", 0)
            external_url = profile.get("externalUrl")
            bio = profile.get("biography", "")
            
            report["findings"]["followers"] = followers
            report["findings"]["posts_count"] = posts
            report["findings"]["bio_text"] = bio
            
            # =============================================
            # ANÁLISE DE LINKS NA BIO
            # =============================================
            bio_links = []
            
            # 1. Link oficial retornado pela API
            if external_url:
                bio_links.append(external_url)
            
            # 2. Links encontrados no texto da bio
            if bio:
                urls_in_bio = self._extract_urls_from_text(bio)
                for url in urls_in_bio:
                    if url not in bio_links:
                        bio_links.append(url)
            
            report["findings"]["bio_has_link"] = len(bio_links) > 0
            report["findings"]["bio_links"] = bio_links
            
            compiled_links = []
            for link in bio_links:
                if 'linktr.ee' in link or 'bento.me' in link or 'lnk.bio' in link or 'camp.site' in link:
                    extracted = self._scrape_link_compiler(link)
                    compiled_links.extend(extracted)
            report["findings"]["compiled_links"] = list(set(compiled_links))
            
            # =============================================
            # SCORING
            # =============================================
            score = 100
            
            if followers < 500:
                score -= 30
                report["critical_pains"].append("Presença social irrelevante frente a marcas do segmento.")
                report["findings"]["evidences"].append(f"A conta @{self.target_handle} possui apenas {followers} seguidores.")
                briefing["pontos_negativos"].append(f"Base de seguidores muito pequena ({followers}). Baixa prova social.")
                briefing["recomendacoes"].append("Boss, o Instagram tem poucos seguidores. Se investir em conteúdo de valor + tráfego pago pro perfil, a prova social cresce e facilita o fechamento de novos clientes.")
            elif followers >= 5000:
                briefing["pontos_positivos"].append(f"Base sólida de {followers} seguidores no Instagram.")
            else:
                briefing["pontos_positivos"].append(f"Base de {followers} seguidores no Instagram.")
            
            if not bio_links:
                score -= 40
                report["critical_pains"].append("Funil Quebrado: Sem link na BIO para converter seguidores em visitantes do site.")
                report["findings"]["evidences"].append("O campo 'externalUrl' retornou nulo e nenhum link foi detectado no texto da bio.")
                briefing["pontos_negativos"].append("Sem link na bio do Instagram. Seguidores não têm como navegar para o site ou WhatsApp.")
                briefing["recomendacoes"].append("Boss, o Instagram não tem link na bio. Todo seguidor que quiser saber mais não tem para onde ir. Se colocar um Linktree ou link direto para o WhatsApp/site, pode converter seguidores em leads imediatamente.")
            else:
                briefing["pontos_positivos"].append(f"Links na bio: {', '.join(bio_links)}")
                # Analisa qualidade dos links
                has_linktree = any('linktr.ee' in l or 'linktree' in l for l in bio_links)
                has_whatsapp = any('wa.me' in l or 'whatsapp' in l for l in bio_links)
                if has_linktree:
                    briefing["brechas_diferenciacao"].append("Usa Linktree na bio. Pode migrar para uma landing page própria com pixel de rastreamento.")
                if has_whatsapp:
                    briefing["pontos_positivos"].append("Link de WhatsApp direto na bio do Instagram.")
            
            if posts < 20:
                score -= 20
                report["critical_pains"].append("Baixíssima densidade de conteúdo no grid.")
                report["findings"]["evidences"].append(f"Apenas {posts} posts no grid.")
                briefing["pontos_negativos"].append(f"Pouquíssimos posts ({posts}). Grade do perfil transmite abandono.")
                briefing["recomendacoes"].append("Boss, o perfil tem poucos posts. Se criar um calendário editorial com pelo menos 3 posts por semana, o algoritmo passa a entregar o conteúdo para mais pessoas e a marca ganha credibilidade visual.")
            elif posts >= 100:
                briefing["pontos_positivos"].append(f"Boa densidade de conteúdo ({posts} posts no grid).")

            # =============================================
            # ANÁLISE DE IA (Legendas + Bio)
            # =============================================
            latest_posts = profile.get("latestPosts", [])
            captions = []
            for post in latest_posts[:6]:
                cap = post.get("caption", "")
                if cap:
                    captions.append(cap)
            
            if self.api_key and (bio or captions):
                try:
                    ai_client = genai.Client(api_key=self.api_key)
                    prompt = f"""
                    Você é um Analista Estratégico de Social Media Sênior focado 100% em Conversão e Vendas.
                    A PERGUNTA DE OURO É: O perfil @{self.target_handle} VENDE?
                    
                    A biografia da empresa é: "{bio}"
                    Links na bio: {bio_links}
                    Links ocultos extraídos da árvore de links da Bio: {report["findings"]["compiled_links"]}
                    As últimas legendas postadas foram:
                    "{' | '.join(captions)}"
                    
                    PROIBIÇÕES: NÃO invente legendas ou dados. Analise APENAS o que foi fornecido.
                    
                    1. Analise se as legendas possuem a estrutura AIDA (Atenção, Interesse, Desejo, Ação).
                    2. Verifique se existem CTAs claras para produtos/serviços/contato.
                    3. Entregue 5 ideias TÁTICAS de conteúdo (3 estáticos, 2 reels) focados em gerar leads.
                    
                    Me responda ESTRITAMENTE num formato JSON válido:
                    {{
                        "is_profile_selling": true/false,
                        "sales_alignment": "Análise detalhada do Copy, uso do modelo AIDA e CTAs. O perfil vende?",
                        "authority_triggers": "Demonstram domínio real no assunto? Sim/Não e evidência da legenda.",
                        "content_ideas": ["Ideia 1 de post que quebra objeção", "Ideia 2 focada na dor do mercado", "Ideia 3 de carrossel de autoridade", "Ideia 4 de Reels topo de funil", "Ideia 5 de Reels com oferta direta"],
                        "evidences": ["Evidência extraída das legendas reais fornecidas", "Observação sobre a bio e links ocultos"]
                    }}
                    """
                    response = ai_client.models.generate_content(
                        model='gemini-2.5-flash',
                        contents=prompt,
                        config=types.GenerateContentConfig(response_mime_type="application/json", temperature=0.1)
                    )
                    
                    is_profile_selling = True 

                    if response.text:
                        raw_text = response.text
                        start_idx = raw_text.find('{')
                        end_idx = raw_text.rfind('}')
                        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                            raw_text = raw_text[start_idx:end_idx+1]
                            
                        ai_data = json.loads(raw_text)
                        
                        # Extrai explicitamente o booleano de venda
                        is_profile_selling = ai_data.get("is_profile_selling", False)
                        
                        report["findings"].update({
                            "is_profile_selling": is_profile_selling,
                            "sales_alignment": ai_data.get("sales_alignment", ""),
                            "authority_triggers": ai_data.get("authority_triggers", ""),
                            "content_ideas": ai_data.get("content_ideas", [])
                        })
                        for ev in ai_data.get("evidences", []):
                            report["findings"]["evidences"].append("Análise de IA: " + ev)
                        
                        # Boss briefing baseado na Venda da IA e Dedução de Score Ativa
                        if not is_profile_selling:
                            briefing["brechas_diferenciacao"].append("O conteúdo da rede social não tem CTAs ou falha na estrutura de conversão (AIDA). O perfil funciona como panfleto passivo, não como canal focado em vendas.")
                            report["critical_pains"].append("Tráfego Desperdiçado (Anti-AIDA): Ausência de gatilhos de vendas ou CTAs no conteúdo.")
                            score -= 35 # Penalização dura
                        else:
                            briefing["pontos_positivos"].append("Estratégia de Conteúdo possui estrutura AIDA e chamadas para ação (CTAs) eficientes.")
                            
                except Exception as ai_err:
                    error_str = str(ai_err)
                    if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                        if self.openai_api_key:
                            try:
                                from openai import OpenAI
                                openai_client = OpenAI(api_key=self.openai_api_key)
                                oai_response = openai_client.chat.completions.create(
                                    model="gpt-4o-mini",
                                    messages=[
                                        {"role": "system", "content": "You are an API that outputs valid JSON only."},
                                        {"role": "user", "content": prompt}
                                    ],
                                    response_format={ "type": "json_object" },
                                    temperature=0.1
                                )
                                raw_text = oai_response.choices[0].message.content
                                if raw_text:
                                    start_idx = raw_text.find('{')
                                    end_idx = raw_text.rfind('}')
                                    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                                        raw_text = raw_text[start_idx:end_idx+1]
                                    ai_data = json.loads(raw_text)
                                    is_profile_selling = ai_data.get("is_profile_selling", False)
                                    report["findings"].update({
                                        "is_profile_selling": is_profile_selling,
                                        "sales_alignment": ai_data.get("sales_alignment", ""),
                                        "authority_triggers": ai_data.get("authority_triggers", ""),
                                        "content_ideas": ai_data.get("content_ideas", [])
                                    })
                                    for ev in ai_data.get("evidences", []):
                                        report["findings"]["evidences"].append("Análise de IA: " + ev)
                                        
                                    if not is_profile_selling:
                                        briefing["brechas_diferenciacao"].append("Conteúdo genérico ou sem CTA clara focado em Vendas.")
                                        report["critical_pains"].append("Anti-AIDA: Perfil não passa autoridade firme para vendas.")
                                        score -= 35 # Penalização
                            except Exception as fallback_e:
                                report["critical_pains"].append(f"Limite do Gemini e falha no Fallback OpenAI.")
                        else:
                            report["critical_pains"].append("Cota de IA (Gemini 429) excedida em Social Media.")
                    else:
                        report["critical_pains"].append(f"Erro ao gerar veredito de Social Media: {ai_err}")

            report["score"] = max(0, score)
            
            if report["score"] > 80:
                report["findings"]["engagement_estimate"] = "Saudável (Ativo e Vendendo)"
            elif report["score"] > 50:
                report["findings"]["engagement_estimate"] = "Mediano (Precisa de Funil de Vendas Direcionado)"
            else:
                report["findings"]["engagement_estimate"] = "Crítico (Panfletário ou Abandonado)"

        except Exception as e:
            report["critical_pains"].append(f"Falha na conexão com Apify para '{self.target_handle}': {str(e)}")
            report["score"] = 10
            briefing["pontos_negativos"].append("Não foi possível acessar os dados do Instagram.")

        report["boss_briefing"] = briefing
        return report
