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
            if run and run.get("defaultDatasetId"):
                for item in client.dataset(run["defaultDatasetId"]).iterate_items():
                    profile = item
                    break
                
            if not profile:
                report["critical_pains"].append(f"A API da Apify não encontrou dados públicos (ou Timeout) para a conta '{self.target_handle}'.")
                report["score"] = 10
                briefing["pontos_negativos"].append(f"Perfil @{self.target_handle} com acesso restrito ou não localizado.")
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
            # ANÁLISE DE IA (Arsenal de Elite / Forensic IG)
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
                    PERSONA:
                    Você é o 'Auditor de Atenção' (Agente 03), um perito de elite focado em desmascarar perfis que são apenas 'Panfletos Digitais'.
                    Seu Arsenal inclui o 'Scanner de Retenção Bio-Link' e o 'Veredito de Perda de Autoridade'.
                    Sua missão é dar a 'Sentença de Estética Amadora' e mapear o 'Furo no Funil'.

                    EQUIPAMENTO DE RECONHECIMENTO (DADOS):
                    - Biografia: "{bio}"
                    - Links na bio: {bio_links}
                    - Links ocultos/Linktree: {report["findings"].get("compiled_links", [])}
                    - Legendas REAIS (Últimos {len(captions)} posts):
                    "{' | '.join(captions)}"
                    
                    SUA MISSÃO FORENSE:
                    1. VEREDITO DE PERDA DE AUTORIDADE: A bio comunica uma Proposta Única de Valor (PUV) ou é um 'Vácuo de Autoridade'?
                    2. SCANNER DE RETENÇÃO BIO-LINK: O link na bio é uma ponte para o lucro ou um 'Furo no Funil'?
                    3. SENTENÇA DE ESTÉTICA AMADORA: O grid gera desejo e autoridade ou afasta o cliente de alto ticket?
                    4. DISSONÂNCIA SOCIAL: Existe desalinhamento entre a promessa da marca e a entrega visual?

                    JSON OUTPUT FORMAT:
                    {{
                        "grid_conversion_capacity": "Status (ex: Panfleto Digital / Máquina de Autoridade)",
                        "bio_audit": "Veredito técnico sobre a Bio (ex: Miopia de Posicionamento Detectada)",
                        "conversion_friction": "Onde o lead está 'escapando' no funil social?",
                        "authority_verdict": "Veredito final sobre a autoridade percebida.",
                        "sales_bullet": "Munição de dor: Como o Boss deve usar isso para vender?",
                        "social_verdict": "Veredito implacável de 2-3 linhas para o dossiê final.",
                        "internal_boss_ammo": "O gargalo financeiro real detectado.",
                        "alchemist_briefing": "Dica tática para o Agente 07 criar anúncios de resgate.",
                        "strategic_actions": ["Ação imediata 1", "Ação imediata 2"],
                        "evidences": ["Trecho literal que prova o vácuo de autoridade"]
                    }}
                    """
                    json_data = self._call_llm_json(prompt)
                    
                    if json_data and isinstance(json_data, dict):
                            report["findings"]["is_profile_selling"] = "Máquina" in json_data.get("grid_conversion_capacity", "")
                            report["findings"]["sales_alignment"] = json_data.get("sales_bullet", "")
                            report["findings"]["authority_triggers"] = json_data.get("authority_verdict", "")
                            report["findings"]["content_ideas"] = json_data.get("strategic_actions", [])
                            
                            evidences = json_data.get("evidences", [])
                            if isinstance(evidences, list):
                                for ev in evidences:
                                    report["findings"]["evidences"].append("Arsenal Social: " + str(ev))
                            
                            verdict = json_data.get("social_verdict", "")
                            if verdict:
                                briefing["recomendacoes"].append(f"VEREDITO DO ARSENAL SOCIAL: {verdict}")
                            
                            report["internal_briefing_for_boss"] = json_data.get("internal_boss_ammo", "")
                            report["internal_briefing_for_alchemist"] = json_data.get("alchemist_briefing", "")
                            
                            bio_audit = json_data.get("bio_audit", "")
                            if "Miopia" in bio_audit or "Dissonância" in bio_audit or "Vácuo" in bio_audit:
                                score -= 30
                                briefing["brechas_diferenciacao"].append(f"Miopia de Posicionamento: {bio_audit}")
                            
                            friction = json_data.get("conversion_friction", "")
                            if friction:
                                briefing["pontos_negativos"].append(f"Furo no Funil Social: {friction}")
                                
                            if "Panfleto" in json_data.get("grid_conversion_capacity", ""):
                                score -= 20
                                briefing["pontos_negativos"].append("Síndrome do Perfil Panfleto (Baixa Conversão)")
                            
                            briefing["recomendacoes"].extend(json_data.get("strategic_actions", []))
                
                except Exception as ai_err:
                    print(f"  [Social Agent] Falha na cognição Arsenal: {ai_err}")
                    report["critical_pains"].append("O Auditor de Atenção falhou na análise forense via IA.")

            report["score"] = max(0, score)
            
            # Veredito Final de Arsenal
            if report["score"] >= 80:
                report["findings"]["engagement_estimate"] = "Ativo de Atenção Estratégico"
            elif report["score"] >= 50:
                report["findings"]["engagement_estimate"] = "Miopia de Posicionamento Moderada"
            else:
                report["findings"]["engagement_estimate"] = "Vácuo de Autoridade / Panfleto Digital"

        except Exception as e:
            report["critical_pains"].append(f"Erro no Drone de Auditoria Social: {str(e)}")
            report["score"] = 0
            briefing["pontos_negativos"].append("Drone abatido: Incapaz de processar dados sociais.")

        report["boss_briefing"] = briefing
        return report
