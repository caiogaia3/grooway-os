import re
import os
import json
from google import genai
from google.genai import types
from skills_engine.core import PredatorSkill

class TrackingSkill(PredatorSkill):
    def __init__(self, target_url):
        super().__init__(target_url)
        
        from dotenv import load_dotenv
        load_dotenv(dotenv_path=".env")
        load_dotenv(dotenv_path="../raio-x-digital/.env.local")
        
        self.api_key = os.getenv("GEMINI_API_KEY")

    def execute(self) -> dict:
        """
        Caça pixels de conversão, Analytics, GTM, UTMs, botão de WhatsApp,
        sinais de Google Ads ativo e Meta Ads ativo no corpo do HTML.
        Gera um boss_briefing com recomendações concretas e usa IA para análise estratégica.
        """
        briefing = self._empty_boss_briefing()
        
        report = {
            "name": "Tracking & Data Agent",
            "score": 100,
            "findings": {
                "has_gtm": False,
                "has_ga4_base": False,
                "has_meta_pixel": False,
                "has_utm_links": False,
                "has_whatsapp_button": False,
                "whatsapp_number": None,
                "has_google_ads_signals": False,
                "google_ads_details": [],
                "has_meta_ads_signals": False,
                "meta_ads_details": [],
                "data_maturity_level": "Cego",
                "evidences": []
            },
            "critical_pains": [],
            "boss_briefing": briefing
        }

        if not self.raw_html:
            report["critical_pains"].append("Falha Crítica: HTML não injetado para análise de Tracking.")
            return report

        html_lower = self.raw_html.lower()

        # =============================================
        # 1. GOOGLE TAG MANAGER (GTM)
        # =============================================
        if re.search(r"GTM-[A-Z0-9]+", self.raw_html, re.IGNORECASE):
            report["findings"]["has_gtm"] = True
            briefing["pontos_positivos"].append("O site possui Google Tag Manager instalado, permitindo gerenciamento centralizado de tags.")
        else:
            report["score"] -= 25
            report["critical_pains"].append("Cegueira Completa de Eventos (GTM Inexistente). Impossível otimizar CPA sem ele.")
            report["findings"]["evidences"].append("O container 'GTM-XXXX' não foi encontrado em nenhuma linha do código-fonte analisado.")
            briefing["pontos_negativos"].append("Ausência total do Google Tag Manager.")

        # =============================================
        # 2. GOOGLE ANALYTICS (GA4 / UA)
        # =============================================
        if re.search(r"G-[A-Z0-9]+|UA-\d+-\d+", self.raw_html, re.IGNORECASE):
            report["findings"]["has_ga4_base"] = True
            briefing["pontos_positivos"].append("Google Analytics detectado no site.")
        else:
            report["score"] -= 20
            report["critical_pains"].append("Tráfego Amador: A empresa não sabe de onde vêm os visitantes (Google Analytics Ausente).")
            report["findings"]["evidences"].append("A varredura completa do head/body HTML não detectou scripts 'gtag.js' do Google Analytics.")
            briefing["pontos_negativos"].append("Sem Google Analytics. Não sabem quantos visitantes recebem nem de onde vêm.")

        # =============================================
        # 3. META PIXEL (Facebook/Instagram)
        # =============================================
        has_fbq = bool(re.search(r"fbq\(|fbp=", self.raw_html, re.IGNORECASE))
        if has_fbq:
            report["findings"]["has_meta_pixel"] = True
            briefing["pontos_positivos"].append("Meta Pixel (Facebook/Instagram) detectado no site.")
            
            # Verificar se tem eventos avançados (sinais de campanha ativa)
            advanced_events = []
            for event in ["Purchase", "Lead", "AddToCart", "InitiateCheckout", "CompleteRegistration", "Contact", "Schedule"]:
                if event.lower() in html_lower or f"'{event}'" in self.raw_html or f'"{event}"' in self.raw_html:
                    advanced_events.append(event)
            
            if advanced_events:
                report["findings"]["has_meta_ads_signals"] = True
                report["findings"]["meta_ads_details"].append(f"Eventos de conversão avançados detectados: {', '.join(advanced_events)}")
                briefing["pontos_positivos"].append(f"Pixel com eventos avançados ({', '.join(advanced_events)}), indicando campanha de anúncios ativa e otimizada.")
            else:
                # Pixel existe mas só com PageView = passivo
                report["findings"]["meta_ads_details"].append("Pixel instalado mas sem eventos de conversão avançados (apenas PageView). Campanha provavelmente não otimizada.")
                briefing["pontos_negativos"].append("O Pixel do Meta está instalado mas sem eventos de conversão. Isso indica que não estão rodando campanhas otimizadas ou que o pixel está parado.")
        else:
            report["score"] -= 30
            report["critical_pains"].append("Hemorragia de Receita: O site não tem Pixel para remarketing de abandono.")
            report["findings"]["evidences"].append("Pixel da Meta (função 'fbq()') ausente. Usuários não mapeáveis para campanhas no Instagram/Facebook.")
            briefing["pontos_negativos"].append("Sem Meta Pixel. Impossível fazer remarketing para quem já visitou o site.")

        # =============================================
        # 4. SINAIS DE GOOGLE ADS ATIVO
        # =============================================
        google_ads_signals = []
        
        # Tag de conversão do Google Ads (AW-)
        aw_match = re.search(r"AW-\d+", self.raw_html)
        if aw_match:
            google_ads_signals.append(f"Tag de conversão Google Ads detectada: {aw_match.group()}")
        
        # Doubleclick (rede de display do Google Ads)
        if "googleads.g.doubleclick.net" in html_lower:
            google_ads_signals.append("Script DoubleClick detectado (Rede de Display Google Ads)")
        
        # GCLID handling (indica que recebem tráfego de Google Ads)
        if "gclid" in html_lower:
            google_ads_signals.append("Parâmetro 'gclid' referenciado no código (captura de cliques do Google Ads)")
        
        # Google Ads conversion tracking
        if "conversion.js" in html_lower or "google_tag_params" in html_lower:
            google_ads_signals.append("Script de conversão do Google Ads detectado")
        
        if google_ads_signals:
            report["findings"]["has_google_ads_signals"] = True
            report["findings"]["google_ads_details"] = google_ads_signals
            briefing["pontos_positivos"].append("Sinais de Google Ads ativos detectados no código do site.")
        else:
            report["findings"]["google_ads_details"].append("Nenhum sinal de Google Ads encontrado no código-fonte.")
            briefing["pontos_negativos"].append("Sem sinais de Google Ads. A empresa provavelmente não anuncia no Google ou nunca configurou conversões.")

        # =============================================
        # 5. UTM LINKS
        # =============================================
        if self.soup:
            anchors = self.soup.find_all('a', href=True)
            for a in anchors:
                href = a['href'].lower()
                if "utm_source=" in href or "utm_medium=" in href:
                    report["findings"]["has_utm_links"] = True
                    break
        
        if not report["findings"]["has_utm_links"]:
            report["score"] -= 10
            report["critical_pains"].append("Gestão de Tráfego Cega: Nenhum link do site mapeia a origem do clique (UTMs ausentes).")
            report["findings"]["evidences"].append("A varredura das tags <a> não encontrou parâmetros 'utm_source' ou 'utm_medium'.")
            briefing["pontos_negativos"].append("Sem UTMs nos links internos. Não conseguem saber qual canal (Instagram, Email, Google) gera mais vendas.")
        else:
            briefing["pontos_positivos"].append("Links com parâmetros UTM detectados, indicando rastreamento de origens de tráfego.")

        # =============================================
        # 6. BOTÃO DE WHATSAPP
        # =============================================
        whatsapp_found = False
        whatsapp_number = None
        
        if self.soup:
            for a in self.soup.find_all('a', href=True):
                href = a['href']
                if 'wa.me/' in href or 'api.whatsapp.com' in href or 'whatsapp' in href.lower():
                    whatsapp_found = True
                    num_match = re.search(r'(?:wa\.me/|phone=)(\d+)', href)
                    if num_match:
                        whatsapp_number = num_match.group(1)
                    break
            
            if not whatsapp_found:
                for tag in self.soup.find_all(['div', 'a', 'button', 'img'], class_=True):
                    classes = ' '.join(tag.get('class', []))
                    if 'whatsapp' in classes.lower() or 'wpp' in classes.lower():
                        whatsapp_found = True
                        break
        
        if not whatsapp_found:
            if 'wa.me/' in html_lower or 'api.whatsapp.com' in html_lower:
                whatsapp_found = True
                num_match = re.search(r'wa\.me/(\d+)', self.raw_html, re.IGNORECASE)
                if num_match:
                    whatsapp_number = num_match.group(1)
        
        report["findings"]["has_whatsapp_button"] = whatsapp_found
        report["findings"]["whatsapp_number"] = whatsapp_number
        
        if whatsapp_found:
            briefing["pontos_positivos"].append(f"Botão de WhatsApp detectado no site{' (Número: ' + whatsapp_number + ')' if whatsapp_number else ''}.")
        else:
            report["score"] -= 15
            report["critical_pains"].append("Canal de Vendas Diretas Ausente: Não existe botão de WhatsApp visível no site.")
            report["findings"]["evidences"].append("Nenhum link para 'wa.me/', 'api.whatsapp.com' ou widget de WhatsApp detectado no DOM.")
            briefing["pontos_negativos"].append("Sem botão de WhatsApp no site. O visitante não tem um canal direto e imediato de contato.")

        # =============================================
        # 7. ANÁLISE CONSULTIVA VIA IA (Arsenal Activation)
        # =============================================
        score = report["score"] # Initialize local score variable
        if self.api_key:
            try:
                ai_client = genai.Client(api_key=self.api_key)
                
                # Prepare findings for the new prompt structure
                pixels_found_list = []
                if report["findings"]["has_gtm"]:
                    pixels_found_list.append("Google Tag Manager")
                if report["findings"]["has_ga4_base"]:
                    pixels_found_list.append("Google Analytics (GA4/UA)")
                if report["findings"]["has_meta_pixel"]:
                    pixels_found_list.append("Meta Pixel")
                if report["findings"]["has_google_ads_signals"]:
                    pixels_found_list.append("Google Ads Conversion/Remarketing")
                
                findings_for_prompt = {
                    "pixels_found": ", ".join(pixels_found_list) if pixels_found_list else "Nenhum pixel/tag principal detectado",
                    "has_gtm": report["findings"]["has_gtm"],
                    "has_ga4": report["findings"]["has_ga4_base"], # Using has_ga4_base as has_ga4
                }

                prompt = f"""
                PERSONA:
                Você é o 'Perito em Tráfego' (Agente 05), um auditor técnico implacável focado em ROI e Infraestrutura de Conversão.
                Seu Arsenal inclui o 'Farejador de Tags de Conversão' e o 'Analista de Desperdício de Verba'.
                Sua missão é dar o 'Veredito de ROI Negativo' e mapear o 'Furo no Balde de Ads'.

                EQUIPAMENTO DE RECONHECIMENTO (DADOS):
                - Tags Detectadas no Site: {findings_for_prompt["pixels_found"]}
                - Falta de GTM: {not findings_for_prompt["has_gtm"]}
                - Falta de GA4: {not findings_for_prompt["has_ga4"]}
                - Site do Alvo: {self.target_url}
                
                SUA MISSÃO FORENSE:
                1. VEREDITO DE ROI NEGATIVO: Se a empresa anunciar hoje, ela conseguirá medir o retorno ou está jogando dinheiro no escuro?
                2. MAPEAMENTO DE FURO NO BALDE: Quais canais (Meta, Google, etc) estão sem rastreio e perdendo público de remarketing?
                3. SENTENÇA DE SETUP AMADOR: A infraestrutura atual é digna de uma empresa que fatura alto ou de um amador?
                4. ANALISTA DE DESPERDÍCIO: Estime o impacto de não ter remarketing ativo na perda de leads.

                JSON OUTPUT FORMAT:
                {{
                    "infrastructure_status": "Status (ex: Cego / Míope / Profissional)",
                    "roi_measurement_verdict": "Veredito técnico sobre a medição de retorno",
                    "tracking_gap_analysis": "Onde estão os furos técnicos no balde de ads?",
                    "amateur_setup_sentence": "Sentença implacável sobre o setup atual.",
                    "waste_estimate": "Estimativa de impacto financeiro (perda de leads)",
                    "internal_boss_ammo": "Munição de dor sobre desperdício de dinheiro para o Boss.",
                    "alchemist_briefing": "Dica para o Agente 07 focar na oferta de 'Recuperação de Leads'.",
                    "strategic_actions": ["Ação técnica 1", "Ação técnica 2"],
                    "traffic_verdict": "Veredito final de 2-3 linhas para o dossiê."
                }}
                """

                json_data = self._call_llm_json(prompt)

                if json_data and isinstance(json_data, dict):
                    report["findings"].update(json_data)
                    
                    verdict = json_data.get("traffic_verdict", "")
                    if verdict:
                        briefing["recomendacoes"].append(f"VEREDITO DO PERITO EM TRÁFEGO: {verdict}")
                    
                    roi_verdict = json_data.get("roi_measurement_verdict", "")
                    if "Negativo" in str(roi_verdict) or "Impossível" in str(roi_verdict) or "Escuro" in str(roi_verdict):
                        score -= 30
                        briefing["pontos_negativos"].append(f"Risco de ROI Cego: {roi_verdict}")
                    
                    gap = json_data.get("tracking_gap_analysis", "")
                    if gap:
                        briefing["pontos_negativos"].append(f"Furo no Balde de Ads: {gap}")
                    
                    report["internal_briefing_for_boss"] = json_data.get("internal_boss_ammo", "")
                    report["internal_briefing_for_alchemist"] = json_data.get("alchemist_briefing", "")
                    
                    briefing["recomendacoes"].extend(json_data.get("strategic_actions", []))

            except Exception as ai_err:
                print(f"  [Traffic Agent] Falha na cognição Arsenal: {ai_err}")
                report["critical_pains"].append("O Perito em Tráfego falhou na análise forense via IA.")

        report["score"] = max(0, score)
        
        # Veredito Final de Arsenal
        if report["score"] >= 80:
            report["findings"]["setup_quality"] = "Infraestrutura de Elite"
        elif report["score"] >= 50:
            report["findings"]["setup_quality"] = "Miopia Digital Técnica"
        else:
            report["findings"]["setup_quality"] = "Cegueira de Dados / ROI em Risco"

        report["boss_briefing"] = briefing
        return report
