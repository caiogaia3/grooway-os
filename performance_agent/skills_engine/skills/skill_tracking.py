import re
from skills_engine.core import PredatorSkill

class TrackingSkill(PredatorSkill):
    def __init__(self, target_url):
        super().__init__(target_url)

    def execute(self) -> dict:
        """
        Caça pixels de conversão, Analytics, GTM, UTMs, botão de WhatsApp,
        sinais de Google Ads ativo e Meta Ads ativo no corpo do HTML.
        Gera um boss_briefing com recomendações concretas.
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
            briefing["recomendacoes"].append("Boss, essa empresa não tem GTM. Se instalar, ela centraliza todas as tags (Analytics, Pixel, conversões) num único painel e consegue rastrear cada clique sem precisar de programador.")

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
            briefing["recomendacoes"].append("Boss, sem Analytics essa empresa está completamente cega. Não sabem quantas pessoas visitam o site por dia, qual página mais converte, nem de onde veio cada clique. Se instalar o GA4, ela passa a entender o comportamento do cliente e otimizar o funil.")

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
                briefing["recomendacoes"].append("Boss, o Pixel existe mas está passivo (sem eventos). Se configurar eventos como 'Lead' ou 'Purchase', o algoritmo do Meta começa a aprender quem é o comprador ideal e barateia o custo por conversão.")
        else:
            report["score"] -= 30
            report["critical_pains"].append("Hemorragia de Receita: O site não tem Pixel para remarketing de abandono.")
            report["findings"]["evidences"].append("Pixel da Meta (função 'fbq()') ausente. Usuários não mapeáveis para campanhas no Instagram/Facebook.")
            briefing["pontos_negativos"].append("Sem Meta Pixel. Impossível fazer remarketing para quem já visitou o site.")
            briefing["recomendacoes"].append("Boss, sem o Pixel do Facebook/Instagram, essa empresa perde todo visitante que entra e sai do site sem comprar. Se instalar o Pixel, ela pode impactar essas pessoas de novo com anúncios de remarketing, que convertem até 10x mais que tráfego frio.")

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
            briefing["recomendacoes"].append("Boss, não encontrei nenhuma tag do Google Ads no site. Se a empresa quiser aparecer nas primeiras posições do Google imediatamente, precisa configurar campanhas de Search Ads com a tag de conversão instalada para medir o retorno de cada real investido.")

        # =============================================
        # 5. UTM LINKS
        # =============================================
        report["findings"]["has_utm_links"] = False
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
            briefing["recomendacoes"].append("Boss, essa empresa não usa UTMs. Se taguear os links que compartilham (Instagram, email marketing, WhatsApp), passa a saber exatamente qual canal de marketing traz mais clientes e pode investir mais no que funciona.")
        else:
            briefing["pontos_positivos"].append("Links com parâmetros UTM detectados, indicando rastreamento de origens de tráfego.")

        # =============================================
        # 6. BOTÃO DE WHATSAPP
        # =============================================
        whatsapp_found = False
        whatsapp_number = None
        
        if self.soup:
            # Procura links para WhatsApp
            for a in self.soup.find_all('a', href=True):
                href = a['href']
                if 'wa.me/' in href or 'api.whatsapp.com' in href or 'whatsapp' in href.lower():
                    whatsapp_found = True
                    # Extrai número
                    num_match = re.search(r'(?:wa\.me/|phone=)(\d+)', href)
                    if num_match:
                        whatsapp_number = num_match.group(1)
                    break
            
            # Procura widgets de WhatsApp comuns
            if not whatsapp_found:
                for tag in self.soup.find_all(['div', 'a', 'button', 'img'], class_=True):
                    classes = ' '.join(tag.get('class', []))
                    if 'whatsapp' in classes.lower() or 'wpp' in classes.lower():
                        whatsapp_found = True
                        break
        
        # Fallback: procura no HTML cru
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
            briefing["recomendacoes"].append("Boss, essa empresa não tem botão de WhatsApp no site. Hoje, mais de 70% das vendas de serviços no Brasil passam pelo WhatsApp. Se colocar um botão flutuante com mensagem pré-pronta, a taxa de conversão pode aumentar drasticamente.")

        # =============================================
        # CÁLCULO DE MATURIDADE DE DADOS
        # =============================================
        active_tools = sum([
            report["findings"]["has_gtm"],
            report["findings"]["has_ga4_base"],
            report["findings"]["has_meta_pixel"],
            report["findings"]["has_utm_links"],
            report["findings"]["has_whatsapp_button"],
            report["findings"]["has_google_ads_signals"]
        ])
        
        if active_tools >= 5:
            report["findings"]["data_maturity_level"] = "Avançado"
        elif active_tools >= 3:
            report["findings"]["data_maturity_level"] = "Intermediário"
        elif active_tools >= 1:
            report["findings"]["data_maturity_level"] = "Básico"
        else:
            report["findings"]["data_maturity_level"] = "Cego"

        # Ensure score doesn't go below 0
        report["score"] = max(0, report["score"])
        report["boss_briefing"] = briefing
        
        return report
