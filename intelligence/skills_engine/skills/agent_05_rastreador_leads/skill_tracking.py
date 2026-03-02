import re
import os
import json
from google import genai
from google.genai import types
from skills_engine.core import PredatorSkill
import requests
import time
from apify_client import ApifyClient

class TrackingSkill(PredatorSkill):
    def __init__(self, target_url):
        super().__init__(target_url)
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.apify_token = os.getenv("APIFY_API_TOKEN")

    def execute(self) -> dict:
        """
        Executa a análise de Tracking usando Navegação Real (Apify Playwright)
        para detectar GA4, GTM, Meta Pixel e CTAs dinâmicos.
        """
        print(f"  [Tracking Agent] Iniciando Sniper Mode para: {self.target_url}")
        
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
                "data_maturity_level": "Básico",
                "evidences": []
            },
            "critical_pains": [],
            "boss_briefing": briefing
        }

        apify_results = None
        if self.apify_token:
            try:
                client = ApifyClient(self.apify_token)
                
                # Actor: apify/playwright-scraper
                # pageFunction que detecta os tokens no contexto do browser
                run_input = {
                    "startUrls": [{"url": self.target_url}],
                    "useChrome": True,
                    "maxPagesPerCrawl": 1,
                    "pageFunction": """
                    async ({ page, request, log }) => {
                        const result = {
                            gtm_ids: [],
                            ga4_ids: [],
                            meta_ids: [],
                            google_ads_ids: [],
                            has_datalayer: false,
                            whatsapp_links: [],
                            utm_links: [],
                            rendered_html: ""
                        };

                        // 1. Detectar GTM e GA4 via window
                        result.has_datalayer = !!window.dataLayer;
                        
                        // Extrair IDs do HTML renderizado
                        const content = await page.content();
                        result.rendered_html = content;

                        const gtmMatch = content.match(/GTM-[A-Z0-9]+/g);
                        if (gtmMatch) result.gtm_ids = [...new Set(gtmMatch)];

                        const ga4Match = content.match(/G-[A-Z0-9]+/g);
                        if (ga4Match) result.ga4_ids = [...new Set(ga4Match)];

                        const metaMatch = content.match(/fbq\\('init',\\s*'(\\d+)'\\)/g);
                        if (metaMatch) result.meta_ids = metaMatch.map(m => m.match(/\\d+/)[0]);

                        const adsMatch = content.match(/AW-\d+/g);
                        if (adsMatch) result.google_ads_ids = [...new Set(adsMatch)];

                        // WhatsApp
                        const waLinks = await page.$$eval('a[href*="wa.me"], a[href*="api.whatsapp.com"]', 
                            els => els.map(el => el.href));
                        result.whatsapp_links = waLinks;

                        // UTMs em links internos
                        const utmLinks = await page.$$eval('a[href*="utm_"]', 
                            els => els.map(el => el.href));
                        result.utm_links = utmLinks;

                        return result;
                    }
                    """
                }
                
                run = client.actor("apify/playwright-scraper").call(run_input=run_input)
                items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
                if items:
                    apify_results = items[0]
                    print(f"  [Tracking Agent] Dados extraídos via Sniper: {len(items)} items.")

            except Exception as e:
                print(f"  [Tracking Agent] Erro ao chamar Apify: {e}")

        # Se o Apify falhou ou não trouxe dados, usamos o fallback estático (soup/raw_html)
        src_html = apify_results.get("rendered_html", self.raw_html) if apify_results else self.raw_html
        
        # =============================================
        # PROCESSAMENTO DE SINAIS (Sniper + Static Fallback)
        # =============================================
        
        # 1. GTM
        has_gtm = False
        if apify_results and apify_results.get("gtm_ids"):
            has_gtm = True
            report["findings"]["gtm_details"] = apify_results["gtm_ids"]
        elif re.search(r"GTM-[A-Z0-9]+", src_html, re.IGNORECASE):
            has_gtm = True

        if has_gtm:
            report["findings"]["has_gtm"] = True
            briefing["pontos_positivos"].append("Google Tag Manager detectado (Infraestrutura de Controle ativa).")
        else:
            report["score"] -= 25
            report["critical_pains"].append("Cegueira Completa de Eventos (GTM Inexistente).")
            report["findings"]["evidences"].append("O container 'GTM-XXXX' não foi encontrado.")

        # 2. GA4
        has_ga4 = False
        if apify_results and apify_results.get("ga4_ids"):
            has_ga4 = True
            report["findings"]["ga4_details"] = apify_results["ga4_ids"]
        elif re.search(r"G-[A-Z0-9]+", src_html, re.IGNORECASE):
            has_ga4 = True

        if has_ga4:
            report["findings"]["has_ga4_base"] = True
            briefing["pontos_positivos"].append("Google Analytics 4 detectado.")
        else:
            report["score"] -= 20
            report["critical_pains"].append("Tráfego Amador: Empresa não mede de onde vêm os visitantes.")

        # 3. Meta Pixel
        has_pixel = False
        if apify_results and apify_results.get("meta_ids"):
            has_pixel = True
            report["findings"]["meta_pixel_details"] = apify_results["meta_ids"]
        elif re.search(r"fbq\(|fbp=", src_html, re.IGNORECASE):
            has_pixel = True

        if has_pixel:
            report["findings"]["has_meta_pixel"] = True
            briefing["pontos_positivos"].append("Meta Pixel detectado.")
        else:
            report["score"] -= 30
            report["critical_pains"].append("Hemorragia de Receita: Site sem Pixel para Remarketing.")
            report["findings"]["evidences"].append("Pixel da Meta ausente. Perdendo 100% do público do Instagram/Facebook.")

        # 3.5 Google Ads (Sinais Ativos)
        has_ads = False
        if apify_results and apify_results.get("google_ads_ids"):
            has_ads = True
            report["findings"]["google_ads_details"] = apify_results["google_ads_ids"]
        elif re.search(r"AW-\d+", src_html):
            has_ads = True

        report["findings"]["has_google_ads_signals"] = has_ads
        if has_ads:
            briefing["pontos_positivos"].append("Sinais de Google Ads detectados.")
        else:
            briefing["pontos_negativos"].append("Sem sinais de Google Ads ativos.")

        # 4. WhatsApp (Sniper Especializado)
        wa_found = False
        wa_num = None
        if apify_results and apify_results.get("whatsapp_links"):
            wa_found = True
            for link in apify_results["whatsapp_links"]:
                m = re.search(r'(?:wa\.me/|phone=)(\d+)', link)
                if m: wa_num = m.group(1)
        
        if not wa_found:
            # Fallback regex no HTML renderizado
            m = re.search(r'(?:wa\.me/|api\.whatsapp\.com/send\?phone=)(\d+)', src_html)
            if m:
                wa_found = True
                wa_num = m.group(1)

        report["findings"]["has_whatsapp_button"] = wa_found
        report["findings"]["whatsapp_number"] = wa_num
        if wa_found:
            briefing["pontos_positivos"].append(f"WhatsApp detectado ({wa_num if wa_num else 'Botão Visível'}).")
        else:
            report["score"] -= 15
            report["critical_pains"].append("Canal de Vendas Diretas Ausente (Sem WhatsApp).")

        # 5. UTMs e Tráfego Cego
        has_utm = False
        if apify_results and apify_results.get("utm_links"):
            has_utm = True
        elif "utm_source" in src_html.lower():
            has_utm = True

        if has_utm:
            report["findings"]["has_utm_links"] = True
            briefing["pontos_positivos"].append("Rastreamento de origens (UTMs) detectado.")
        else:
            report["score"] -= 10
            report["critical_pains"].append("Gestão de Tráfego Cega: UTMs ausentes nos links.")

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
                    "traffic_verdict": "Veredito final de 2-3 linhas para o dossiê.",
                    "ui_strengths": ["Ponto forte 1", "Ponto forte 2"],
                    "ui_weaknesses": ["Ponto fraco 1 (Furo no balde)", "Ponto fraco 2"],
                    "ui_improvements": ["Oportunidade de melhoria 1 (Ação estratégica)", "Oportunidade de melhoria 2"]
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
