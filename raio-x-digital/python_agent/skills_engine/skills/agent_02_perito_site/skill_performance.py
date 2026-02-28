from skills_engine.core import PredatorSkill
import os
import json
import re
from google import genai
from google.genai import types

class PerformanceSkill(PredatorSkill):
    def __init__(self, target_url):
        super().__init__(target_url)
        
        from dotenv import load_dotenv
        load_dotenv(dotenv_path=".env")
        load_dotenv(dotenv_path="../raio-x-digital/.env.local")
        
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

    def execute(self) -> dict:
        """
        Audita Arquitetura Base, TTFB, fatores de UX/SEO on-page,
        formulários de contato, CTAs, e faz uma análise clínica da UI via LLM.
        Lógica de ARSENAL: Sensor de Hemorragia de ROI e Veredito do Vaso Sanitário de Ads.
        """
        # --- BRIEFING LOCAL ---
        b_neg = []
        b_pos = []
        b_rec = []
        
        # --- FINDINGS LOCAIS (Type Safety) ---
        pts = 0
        lt = self.load_time
        hemorrhage = 0
        has_h1 = False
        has_meta = False
        is_mobile = False
        has_form = False
        cta_count = 0
        has_px = False
        has_proof = False
        ui_analysis = ""
        evid = []
        boss_ammo = ""
        blog_sample = ""

        if not self.soup:
            return {
                "name": "Audit UX/SEO Agent (Site Expert)", 
                "score": 0, 
                "load_time_seconds": 0,
                "critical_pains": ["Falha no Parser."],
                "findings": {}
            }

        # =============================================
        # 1. SEO BÁSICO (H1/Meta) - 20 pts
        # =============================================
        h1 = self.soup.find('h1')
        meta_desc = self.soup.find('meta', attrs={'name': 'description'})
        
        if h1:
            has_h1 = True
            pts += 10
            h1_text = h1.get_text(strip=True)[:80]
            b_pos.append(f"Tag H1 presente: '{h1_text}'.")
        else:
            b_neg.append("Sem tag H1 no site (Miopia do Google).")

        if meta_desc and meta_desc.get('content'):
            has_meta = True
            pts += 10
        else:
            b_neg.append("Sem Meta Description (Vitrine Opaca).")

        # =============================================
        # 2. RESPONSIVIDADE MOBILE - 20 pts
        # =============================================
        meta_viewport = self.soup.find('meta', attrs={'name': 'viewport'})
        if meta_viewport:
            is_mobile = True
            pts += 20
        else:
            b_neg.append("Infraestrutura Obsoleta: Site não responsivo.")

        # =============================================
        # 3. PERFORMANCE & ROI - 20 pts
        # =============================================
        if lt < 2.0:
            pts += 20
            b_pos.append(f"Velocidade boa ({round(lt, 2)}s).")
        else:
            hemorrhage = int(min(100, (lt - 1.0) * 7))
            b_neg.append(f"Imposto da Lentidão: Site demora {round(lt, 2)}s. Perda de ROI estimada em {hemorrhage}%.")

        # =============================================
        # 4. CONVERSÃO (Forms/CTAs) - 20 pts
        # =============================================
        forms = self.soup.find_all('form')
        for form in forms:
            if any(kw in str(form).lower() for kw in ['email', 'phone', 'tel', 'zap', 'contato']):
                has_form = True
                break
        
        if has_form:
            pts += 10
        else:
            b_neg.append("Porta Trancada: Nenhum formulário de contato.")

        cta_keywords = ['comprar', 'agendar', 'orçamento', 'contato', 'whatsapp', 'compre', 'saiba mais']
        for tag in self.soup.find_all(['a', 'button']):
            text = tag.get_text(strip=True).lower()
            if any(kw in text for kw in cta_keywords) and len(text) < 50:
                cta_count += 1
        
        if cta_count >= 2:
            pts += 10
        else:
            b_neg.append("Escassez de botões de ação (CTAs).")

        # =============================================
        # 5. ARSENAL AVANÇADO (Pixel/Social Proof) - 20 pts
        # =============================================
        scripts = str(self.soup.find_all('script')).lower()
        if any(px in scripts for px in ['gtag', 'fbq', 'pixel', 'analytics', 'tagmanager']):
            has_px = True
            pts += 10
        else:
            b_neg.append("Radar de Pixel: Empresa 'cega' para dados de conversão.")

        text_content = self.soup.get_text().lower()
        if any(kw in text_content for kw in ['depoimentos', 'clientes', 'parceiros', 'casos de sucesso']):
            has_proof = True
            pts += 10
        else:
            b_neg.append("Scanner de Prova Social: Baixa autoridade percebida (Sem depoimentos).")

        # =============================================
        # 5.5 BLOG E MARKETING DE CONTEÚDO
        # =============================================
        has_blog = False
        blog_keywords = ['blog', 'artigos', 'notícias', 'conteúdo', 'news', 'materiais']
        for a_tag in self.soup.find_all('a', href=True):
            href = a_tag['href'].lower()
            text = a_tag.get_text(strip=True).lower()
            if any(kw in href or kw in text for kw in blog_keywords):
                has_blog = True
                break
        
        if has_blog:
            pts += 5
            evid.append("Detectado possível Hub de Conteúdo (Blog/Artigos).")
        else:
            b_neg.append("Sem ecossistema de conteúdo detectado: A empresa restringe suas fontes de aquisição orgânica.")

        evid.append(f"Mapeamento de Eficácia do Site: {pts}% detectado.")

        # =============================================
        # 6. ANÁLISE FORENSE DE ROI VIA LLM
        # =============================================
        if self.api_key or os.getenv("OPENAI_API_KEY"):
            try:
                headings = [h.get_text(strip=True) for h in self.soup.find_all(['h1', 'h2', 'h3'])[:10]]
                prompt = f"""
                ARSENAL DO 'PERITO DE CONVERSÃO' (AGENTE 02). 
                DADOS: {pts}% Efficacy | {round(lt, 2)}s Load | {hemorrhage}% ROI Hemorrhage | Blog Mapeado: {has_blog}.
                CONTEXTO: {headings}
                
                MISSÃO:
                1. VEREDITO DO VASO SANITÁRIO DE ADS: O site queima dinheiro ou converte?
                2. IMPOSTO DA LENTIDÃO: Como a demora técnica expulsa clientes.
                3. TÁTICA DE CONTEÚDO: Elabore UMA FRASE muito curta e incisiva de copywriting sobre como eles poderiam explorar ou monetizar o Blog (ou a falta dele) para atrair leads para a equipe comercial. 
                
                JSON OUTPUT:
                {{
                  "internal_boss_ammo": "Pitch letal",
                  "roi_verdict": "Veredito final",
                  "blog_exploration_sample": "Frase sobre o blog",
                  "tactical_actions": ["Ação 1", "2"]
                }}
                """
                res = self._call_llm_json(prompt)
                if res:
                    ui_analysis = res.get("roi_verdict", "")
                    boss_ammo = res.get("internal_boss_ammo", "")
                    blog_sample = res.get("blog_exploration_sample", "")
                    b_rec.append(f"VEREDITO: {ui_analysis}")
                    if blog_sample:
                        b_rec.append(f"TÁTICA DE CONTEÚDO: {blog_sample}")
                    b_rec.extend(res.get("tactical_actions", []))
            except Exception as ui_err:
                print(f"  [Site Agent] Falha na cognição Arsenal: {ui_err}")

        return {
            "name": "Audit UX/SEO Agent (Site Expert)",
            "score": pts,
            "load_time_seconds": round(lt, 2),
            "findings": {
                "profile_effectiveness_pct": pts,
                "has_h1": has_h1,
                "has_meta_desc": has_meta,
                "is_mobile_responsive_ui": is_mobile,
                "has_contact_form": has_form,
                "cta_buttons_count": cta_count,
                "has_pixels": has_px,
                "has_social_proof": has_proof,
                "has_blog": has_blog,
                "ui_clinical_analysis": ui_analysis,
                "blog_exploration_sample": blog_sample,
                "conversion_hemorrhage_pct": hemorrhage,
                "evidences": evid,
                "internal_briefing_for_boss": boss_ammo
            },
            "boss_briefing": {
                "pontos_negativos": b_neg,
                "pontos_positivos": b_pos,
                "recomendacoes": b_rec,
                "brechas_diferenciacao": []
            }
        }
