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
        reviews_list_raw = []
        
        ef_breakdown = {
            "identidade_digital_nap": {"status": False, "label": "Identidade Digital (NAP)", "desc": "Telefone e endereço preenchidos"},
            "autoridade_visual_fotos": {"status": False, "label": "Autoridade Visual (Fotos)", "desc": "Mínimo 20 fotos profissionais"},
            "vitrine_de_servicos": {"status": False, "label": "Vitrine de Serviços", "desc": "Lista de serviços/menu cadastrada"},
            "interacao_com_cliente": {"status": False, "label": "Interação com Cliente", "desc": "Respostas às avaliações dos clientes"},
            "propriedade_reivindicada": {"status": False, "label": "Propriedade Reivindicada", "desc": "Ficha verificada e reivindicada pelo dono"},
            "radar_de_postagens": {"status": False, "label": "Radar de Postagens", "desc": "Publicações ativas no Google Meu Negócio"},
            "raio_x_de_categorias": {"status": False, "label": "Categorias Secundárias", "desc": "Categorias adicionais para ampliar alcance"}
        }

        # --- ARSENAL INPUTS ---
        company_name = str(self.params.get("companyName", "")).strip()
        city = str(self.params.get("city", "")).strip()
        
        if not self.api_key and not self.openai_api_key:
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
                "maxImages": 10,
                "maxReviews": 25,
            }
            run = apify_client.actor("compass/crawler-google-places").call(run_input=run_input, timeout_secs=55)
            
            if run and run.get("defaultDatasetId"):
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
                        "addCats": item.get('categories', [])[1:] if len(item.get('categories', [])) > 1 else [],
                        "mainCategory": item.get('categories', [''])[0] if item.get('categories') else '',
                        "openingHours": item.get('openingHours', []),
                        "description": item.get('description', ''),
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
                ef_breakdown["identidade_digital_nap"]["status"] = True
            
            if p_count >= 20: 
                pts += 15
                ef_breakdown["autoridade_visual_fotos"]["status"] = True
            
            if map_data.get('services'): 
                pts += 15
                has_svcs = True
                ef_breakdown["vitrine_de_servicos"]["status"] = True
            
            rev_list = map_data.get('reviewsList', [])
            if any(r.get('response') for r in rev_list): 
                pts += 15
                ef_breakdown["interacao_com_cliente"]["status"] = True
            
            if map_data.get('isClaimed'): 
                pts += 15
                ef_breakdown["propriedade_reivindicada"]["status"] = True
            
            if map_data.get('hasPosts'):
                pts += 15
                ef_breakdown["radar_de_postagens"]["status"] = True
                
            if map_data.get('addCats'):
                pts += 10
                ef_breakdown["raio_x_de_categorias"]["status"] = True
            
            est_rating = str(map_data.get('rating', "N/A"))
            revs_vol = str(map_data.get('reviews', "0"))
            evid.append(f"Mapeamento de Eficácia: {pts}% detectado.")

            # Build reviews_list_raw for frontend
            reviews_list_raw = [
                {
                    "text": r.get("text", "")[:300],
                    "stars": r.get("stars", 0),
                    "has_response": bool(r.get("response")),
                    "response_preview": str(r.get("response", ""))[:150]
                }
                for r in rev_list[:15]
            ]

            # Build missing_for_100 list
            missing_for_100 = []
            for key, item in ef_breakdown.items():
                if not item["status"]:
                    missing_for_100.append({
                        "item": item["label"],
                        "description": item["desc"],
                        "impact": "15%" if key != "raio_x_de_categorias" else "10%"
                    })

            # =============================================
            # 3. ANÁLISE FORENSE VIA IA (com fallback OpenAI)
            # =============================================
            revs_txt = "\n".join([f"- [{r.get('stars')}★] {str(r.get('text'))[:250]}" for r in rev_list[:12]])
            fail_points = [item["label"] for key, item in ef_breakdown.items() if not item["status"]]
            responded_count = sum(1 for r in rev_list if r.get('response'))
            total_reviews = len(rev_list)

            prompt = f"""
            PERSONA: INVESTIGADOR FORENSE (Agente 01). 
            ARSENAL: 'Scanner de Eficácia', 'Radar de Posts Fantasmas', 'Scanner de Categorias Secundárias', 'Veredito Forense de Comentários'.
            MISSAO: Provar a negligência digital de '{map_data.get('title')}'.

            DADOS:
            - Eficácia Atual: {pts}% de 100%
            - Avaliação: {est_rating}★ ({revs_vol} avaliações)
            - Fotos: {p_count} fotos publicadas
            - Respostas às avaliações: {responded_count} de {total_reviews} respondidas
            - Serviços cadastrados: {'Sim' if has_svcs else 'Não'}
            - Itens FALTANDO para 100%: {', '.join(fail_points) if fail_points else 'Nenhum — ficha completa!'}
            
            COMENTÁRIOS REAIS DOS CLIENTES:
            {revs_txt if revs_txt else 'Nenhum comentário disponível.'}
            
            SUA MISSÃO:
            1. VEREDITO FORENSE: Analise os comentários reais — o que os clientes elogiam e reclamam?
            2. ANÁLISE DE SENTIMENTO: Qual o sentimento geral (Positivo/Neutro/Negativo)? Cite trechos reais.
            3. POR QUE NÃO É 100%: Para cada item faltante ({', '.join(fail_points)}), explique o impacto financeiro.
            4. REVIEWS HIGHLIGHTS: Selecione os 3 melhores e 2 piores comentários.
            5. ESPINHO & DIAMANTE: O dreno de hoje e o lucro de amanhã.

            JSON OUTPUT FORMAT:
            {{
                "forensic_verdict": "Veredito geral sobre a ficha",
                "reviews_analysis": "Análise detalhada do sentimento dos comentários com citações reais",
                "sentiment_score": "Positivo/Neutro/Negativo",
                "reviews_highlights": {{
                    "best": ["Citação real positiva 1", "Citação 2", "Citação 3"],
                    "worst": ["Citação real negativa 1", "Citação 2"]
                }},
                "why_not_100": "Explicação detalhada de cada item faltante e seu impacto financeiro",
                "thorns": "Os drenos de dinheiro atuais",
                "pearls": "As oportunidades de lucro imediato",
                "boss_ammo": "Munição de venda para o Boss",
                "actions": ["Ação corretiva 1", "Ação 2", "Ação 3", "Ação 4", "Ação 5"]
            }}
            """

            res = self._call_llm_json(prompt)

            if res:
                sentiment_v = res.get("reviews_analysis", "")
                forensic_v = res.get("forensic_verdict", "")
                negs = [res.get("why_not_100", ""), forensic_v]
                tips = res.get("actions", [])
                boss_ammo = res.get("boss_ammo", "")
                
                b_neg.append(f"Eficácia: {pts}% - {res.get('why_not_100', '')[:200]}")
                b_neg.append(f"DOR: {res.get('thorns', '')}")
                b_pos.append(f"LUCRO: {res.get('pearls', '')}")
                b_rec.append(f"PITCH: {boss_ammo}")

                # Enrich findings with LLM analysis
                reviews_highlights = res.get("reviews_highlights", {})
                sentiment_score = res.get("sentiment_score", "")
            else:
                reviews_highlights = {}
                sentiment_score = ""

            # Assemble Final Report
            r_score = float(map_data.get('rating') or 0) * 20
            final_score = int((pts + r_score) / 2)
            
            return {
                "name": "Google My Business Auditor (Local SEO)",
                "score": max(0, min(100, final_score)),
                "findings": {
                    "profile_effectiveness_pct": pts,
                    "effectiveness_breakdown": {k: v["status"] for k, v in ef_breakdown.items()},
                    "effectiveness_detail": [
                        {"key": k, "label": v["label"], "description": v["desc"], "status": v["status"], "impact": "15%" if k != "raio_x_de_categorias" else "10%"}
                        for k, v in ef_breakdown.items()
                    ],
                    "missing_for_100_pct": missing_for_100,
                    "estimated_rating": est_rating,
                    "reviews_volume": revs_vol,
                    "photos_count": p_count,
                    "has_services": has_svcs,
                    "has_photos": p_count > 0,
                    "review_sentiment_summary": sentiment_v,
                    "sentiment_score": sentiment_score,
                    "reviews_highlights": reviews_highlights,
                    "reviews_list_raw": reviews_list_raw,
                    "forensic_review_verdict": forensic_v,
                    "negative_points": negs,
                    "optimization_tips": tips,
                    "evidences": evid,
                    "internal_briefing_for_boss": boss_ammo,
                    "main_category": map_data.get("mainCategory", ""),
                    "additional_categories": map_data.get("addCats", []),
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
