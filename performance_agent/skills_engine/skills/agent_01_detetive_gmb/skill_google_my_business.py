from skills_engine.core import PredatorSkill
import os
import json
from google import genai
from google.genai import types

class GMBAuditorSkill(PredatorSkill):
    def __init__(self, target_url, params=None):
        super().__init__(target_url)
        self.params = params or {}
        
        from dotenv import load_dotenv
        load_dotenv(dotenv_path=".env")
        load_dotenv(dotenv_path="../raio-x-digital/.env.local")
        
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.apify_token = os.getenv("APIFY_API_TOKEN")

    def execute(self) -> dict:
        """
        Auditor de Local SEO / Google Meu Negócio.
        Lógica de ARSENAL: Eficácia 100% e Armas de Dominação Regional.
        """
        # --- BRIEFING LOCAL ---
        b_neg = []
        b_pos = []
        b_rec = []
        
        # --- FINDINGS LOCAIS (Type Safety) ---
        pts = 0
        p_count = 0
        est_rating = "N/A"
        revs_vol = "0"
        has_svcs = False
        sentiment_v = ""
        forensic_v = ""
        negs = []
        tips = []
        evid = []
        boss_ammo = ""
        
        ef_breakdown = {
            "identidade_digital_nap": False,
            "autoridade_visual_fotos": False,
            "vitrine_de_servicos": False,
            "interacao_com_cliente": False,
            "propriedade_reivindicada": False,
            "radar_de_postagens": False,
            "raio_x_de_categorias": False
        }

        # --- ARSENAL INPUTS ---
        company_name = str(self.params.get("companyName", "")).strip()
        city = str(self.params.get("city", "")).strip()
        
        if not self.api_key:
            return {
                "name": "Google My Business Auditor (Local SEO)", 
                "score": 0, 
                "critical_pains": ["API Key ausente."],
                "findings": {}
            }

        if not company_name or not city:
            return {
                "name": "Google My Business Auditor (Local SEO)", 
                "score": 0, 
                "critical_pains": ["Dados insuficientes. Preencha 'Empresa' e 'Localização'."],
                "findings": {}
            }

        try:
            # =============================================
            # 1. BUSCA REAL NA APIFY
            # =============================================
            print(f"  [GMB Skill] Buscando '{company_name} {city}' no Google Maps...")
            map_data = None
            from apify_client import ApifyClient
            apify_client = ApifyClient(self.apify_token)
            run_input = {
                "searchStringsArray": [f"{company_name} {city}"],
                "maxCrawledPlacesPerSearch": 1,
                "language": "pt-BR",
                "maxImages": 5,
                "maxReviews": 15,
            }
            run = apify_client.actor("compass/crawler-google-places").call(run_input=run_input, timeout_secs=55)
            
            for item in apify_client.dataset(run["defaultDatasetId"]).iterate_items():
                img_val = item.get('imageCount', item.get('totalPhotos', 0))
                p_count = len(img_val) if isinstance(img_val, list) else int(img_val or 0)

                map_data = {
                    "title": item.get('title'),
                    "rating": item.get('totalScore'),
                    "reviews": item.get('reviewsCount'),
                    "phone": item.get('phone'),
                    "website": item.get('website'),
                    "address": item.get('address'),
                    "isClaimed": item.get('isClaimed', True),
                    "services": item.get('menu', item.get('services', [])),
                    "reviewsList": [
                        {"text": r.get('text', ''), "stars": r.get('stars', 0), "response": r.get('responseFromOwnerText', '')}
                        for r in item.get('reviews', [])
                    ],
                    "hasPosts": bool(item.get('posts', [])),
                    "addCats": item.get('categories', [])[1:] if len(item.get('categories', [])) > 1 else []
                }
                break

            if not map_data:
                return {
                    "name": "Google My Business Auditor (Local SEO)", 
                    "score": 0, 
                    "critical_pains": [f"'{company_name}' não encontrada no Google Maps."],
                    "findings": {}
                }

            # =============================================
            # 2. CALCULO DE EFICÁCIA (0-100%)
            # =============================================
            if all([map_data.get('phone'), map_data.get('address')]):
                pts += 15
                ef_breakdown["identidade_digital_nap"] = True
            
            if p_count >= 20: 
                pts += 15
                ef_breakdown["autoridade_visual_fotos"] = True
            
            if map_data.get('services'): 
                pts += 15
                has_svcs = True
                ef_breakdown["vitrine_de_servicos"] = True
            
            rev_list = map_data.get('reviewsList', [])
            if any(r.get('response') for r in rev_list): 
                pts += 15
                ef_breakdown["interacao_com_cliente"] = True
            
            if map_data.get('isClaimed'): 
                pts += 15
                ef_breakdown["propriedade_reivindicada"] = True
            
            if map_data.get('hasPosts'):
                pts += 15
                ef_breakdown["radar_de_postagens"] = True
                
            if map_data.get('addCats'):
                pts += 10
                ef_breakdown["raio_x_de_categorias"] = True
            
            est_rating = str(map_data.get('rating', "N/A"))
            revs_vol = str(map_data.get('reviews', "0"))
            evid.append(f"Mapeamento de Eficácia: {pts}% detectado.")

            # =============================================
            # 3. ANÁLISE FORENSE VIA IA
            # =============================================
            revs_txt = "\n".join([f"- [{r.get('stars')}] {str(r.get('text'))[:200]}" for r in rev_list[:10]])
            fail_points = [k for k, v in ef_breakdown.items() if not v]

            client = genai.Client(api_key=self.api_key)
            prompt = f"""
            PERSONA: INVESTIGADOR FORENSE (Agente 01). 
            ARSENAL: 'Scanner de Eficácia', 'Radar de Posts Fantasmas', 'Scanner de Categorias Secundárias', 'Veredito Forense de Comentários'.
            MISSAO: Provar a negligência digital de '{map_data.get('title')}'.

            DADOS:
            - Eficácia: {pts}% | Avaliação: {est_rating}★
            - Vulnerabilidades: {', '.join(fail_points)}
            - Comentários: {revs_txt}
            
            SUA MISSÃO:
            1. VEREDITO FORENSE: Use as aspas reais para mostrar o desleixo.
            2. POR QUE NÃO É 100%: Explique como a ausência de armas mata a dominação.
            3. ESPINHO & DIAMANTE: O dreno de hoje e o lucro de amanhã.

            JSON OUTPUT FORMAT:
            {{
                "forensic_verdict": "string",
                "reviews_analysis": "string",
                "why_not_100": "string",
                "thorns": "string",
                "pearls": "string",
                "boss_ammo": "string",
                "actions": ["string"]
            }}
            """

            response = client.models.generate_content(
                model='gemini-2.0-flash',
                config=types.GenerateContentConfig(temperature=0.1, response_mime_type="application/json"),
                contents=prompt
            )

            if response.text:
                res = json.loads(response.text)
                sentiment_v = res.get("reviews_analysis", "")
                forensic_v = res.get("forensic_verdict", "")
                negs = [res.get("why_not_100", ""), forensic_v]
                tips = res.get("actions", [])
                boss_ammo = res.get("boss_ammo", "")
                
                b_neg.append(f"Eficácia: {pts}% - {res.get('why_not_100')}")
                b_neg.append(f"DOR: {res.get('thorns')}")
                b_pos.append(f"LUCRO: {res.get('pearls')}")
                b_rec.append(f"PITCH: {boss_ammo}")

            # Assemble Final Report
            r_score = float(map_data.get('rating') or 0) * 20
            final_score = int((pts + r_score) / 2)
            
            return {
                "name": "Google My Business Auditor (Local SEO)",
                "score": max(0, min(100, final_score)),
                "findings": {
                    "profile_effectiveness_pct": pts,
                    "effectiveness_breakdown": ef_breakdown,
                    "estimated_rating": est_rating,
                    "reviews_volume": revs_vol,
                    "photos_count": p_count,
                    "has_services": has_svcs,
                    "review_sentiment_summary": sentiment_v,
                    "forensic_review_verdict": forensic_v,
                    "negative_points": negs,
                    "optimization_tips": tips,
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

        except Exception as e:
            return {
                "name": "Google My Business Auditor (Local SEO)", 
                "score": 0, 
                "critical_pains": [f"Erro no Arsenal: {str(e)}"],
                "findings": {}
            }



