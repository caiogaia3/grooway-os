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
        PASSO 1: Busca dados REAIS na Apify (compass/google-maps).
        PASSO 2: Analisa completude da ficha (campos vazios = penalidade).
        PASSO 3: Leitura de reviews com análise de sentimento via Gemini.
        PASSO 4: Gera boss_briefing com recomendações concretas.
        """
        briefing = self._empty_boss_briefing()
        
        report = {
            "name": "Google My Business Auditor (Local SEO)",
            "score": 100, 
            "findings": {
                "estimated_rating": "N/A",
                "reviews_volume": "N/A",
                "missing_keyword_in_title": "Não analisado",
                "has_photos": False,
                "photos_count": 0,
                "missing_fields": [],
                "review_sentiment_summary": "",
                "negative_points": [], 
                "optimization_tips": [],
                "evidences": []
            },
            "critical_pains": [],
            "boss_briefing": briefing
        }

        if not self.api_key:
            report["critical_pains"].append("API Key ausente no ambiente Python.")
            return report

        try:
            company_name = self.params.get("companyName", "").strip()
            city = self.params.get("city", "").strip()
            
            if not company_name or company_name.lower() == "desconhecido" or not city:
               report["critical_pains"].append("Nome da empresa ou cidade ausentes. GMB não pôde ser auditado.")
               report["score"] = 0
               return report

            # =============================================
            # 1. BUSCA REAL NA APIFY
            # =============================================
            print(f"  [GMB Skill] Buscando '{company_name} {city}' no Google Maps via Apify...")
            map_data = None
            raw_item = None
            try:
                from apify_client import ApifyClient
                apify_client = ApifyClient(self.apify_token)
                run_input = {
                    "searchStringsArray": [f"{company_name} {city}"],
                    "maxCrawledPlacesPerSearch": 1,
                    "language": "pt-BR",
                    "maxImages": 5,
                    "maxReviews": 8,
                }
                # Timeout ajustado para 55s para não travar Next.js, mas dar mais chance pra Apify
                run = apify_client.actor("compass/crawler-google-places").call(run_input=run_input, timeout_secs=55)
                
                for item in apify_client.dataset(run["defaultDatasetId"]).iterate_items():
                    raw_item = item  # Guarda o item completo
                    map_data = {
                        "title": item.get('title'),
                        "rating": item.get('totalScore'),
                        "reviews": item.get('reviewsCount'),
                        "categories": item.get('categories', []),
                        "phone": item.get('phone'),
                        "website": item.get('website'),
                        "address": item.get('address'),
                        "isClaimed": item.get('isClaimed', True),
                        "openingHours": item.get('openingHours'),
                        "imageUrl": item.get('imageUrl'),
                        "imageCount": item.get('imageCount', item.get('totalPhotos', 0)),
                        "reviewsList": [
                            {
                                "text": r.get('text', r.get('textTranslated', '')),
                                "stars": r.get('stars', 0),
                                "publishedAtDate": r.get('publishedAtDate', '')
                            }
                            for r in item.get('reviews', [])[:10] if r.get('text') or r.get('textTranslated')
                        ]
                    }
                    break
            except Exception as apify_err:
                print(f"  [GMB Skill] Erro fatal no Apify Scrape: {apify_err}")
                report["critical_pains"].append("Erro ao comunicar com provedor Google Maps. Auditoria interrompida.")
                report["score"] = 0
                return report

            # Se não achou nada
            if not map_data:
                report["findings"]["estimated_rating"] = "Inexistente"
                report["findings"]["reviews_volume"] = "0"
                report["score"] = 0
                report["critical_pains"].append(f"A empresa '{company_name}' NÃO foi encontrada no Google Maps em {city}. Perda total de tráfego local.")
                briefing["pontos_negativos"].append("Empresa inexistente no Google Maps. Sem ficha = sem visibilidade local.")
                briefing["recomendacoes"].append("Boss, essa empresa NÃO existe no Google Maps. Se criar e otimizar a ficha do Google Meu Negócio, ela vai aparecer no mapa para quem buscar serviços do segmento na região. Isso é tráfego gratuito direto.")
                return report

            # =============================================
            # 2. ANÁLISE DE COMPLETUDE DA FICHA
            # =============================================
            print(f"  [GMB Skill] Ficha encontrada: {map_data.get('title')} (Nota: {map_data.get('rating')})")
            
            missing_fields = []
            if not map_data.get('phone'):
                missing_fields.append("Telefone")
            if not map_data.get('website'):
                missing_fields.append("Website")
            if not map_data.get('address'):
                missing_fields.append("Endereço")
            if not map_data.get('openingHours'):
                missing_fields.append("Horário de Funcionamento")
            if not map_data.get('categories') or len(map_data.get('categories', [])) == 0:
                missing_fields.append("Categorias do Negócio")
            
            report["findings"]["missing_fields"] = missing_fields
            
            if missing_fields:
                report["score"] -= len(missing_fields) * 8
                for field in missing_fields:
                    report["findings"]["evidences"].append(f"Campo '{field}' não preenchido na ficha do Google Maps.")
                briefing["pontos_negativos"].append(f"Campos incompletos na ficha: {', '.join(missing_fields)}. Isso prejudica o ranking no SEO local.")
                briefing["recomendacoes"].append(f"Boss, a ficha tem campos vazios ({', '.join(missing_fields)}). Se preencher todos os campos, o Google prioriza essa ficha nas buscas locais porque entende que a informação é completa e confiável.")
            else:
                briefing["pontos_positivos"].append("Ficha com todos os campos principais preenchidos.")

            # =============================================
            # 3. ANÁLISE DE FOTOS
            # =============================================
            photo_count = map_data.get('imageCount', 0)
            report["findings"]["photos_count"] = photo_count
            
            if photo_count and photo_count > 0:
                report["findings"]["has_photos"] = True
                if photo_count >= 10:
                    briefing["pontos_positivos"].append(f"Ficha com {photo_count} fotos publicadas.")
                else:
                    briefing["pontos_negativos"].append(f"Poucas fotos na ficha ({photo_count}). Fichas com +10 fotos recebem mais cliques.")
                    briefing["recomendacoes"].append("Boss, a ficha tem poucas fotos. Negócios com 10+ fotos no Google Maps recebem 42% mais pedidos de rota e 35% mais cliques no site. Se adicionar fotos profissionais, a conversão sobe.")
            else:
                report["score"] -= 10
                report["findings"]["has_photos"] = False
                briefing["pontos_negativos"].append("Sem fotos na ficha do Google Maps. A empresa parece fantasma.")
                briefing["recomendacoes"].append("Boss, a ficha não tem nenhuma foto. Fichas sem fotos transmitem desconfiança. Se adicionar fotos do estabelecimento, equipe e serviços, a taxa de clique aumenta drasticamente.")

            # =============================================
            # 4. PENALIDADES POR DADOS REAIS
            # =============================================
            rating = map_data.get('rating') or 0
            reviews_count = map_data.get('reviews') or 0
            
            report["findings"]["estimated_rating"] = str(rating) if rating else "Sem Nota"
            report["findings"]["reviews_volume"] = f"{reviews_count} avaliações"
            
            if float(rating) < 4.0 and reviews_count > 0:
                report["score"] -= 25
                report["critical_pains"].append(f"Avaliação perigosa no Maps (Média {rating}). Isso afasta clientes antes do clique.")
                briefing["pontos_negativos"].append(f"Nota baixa no Google Maps ({rating}). Afasta potenciais clientes.")
                briefing["recomendacoes"].append(f"Boss, a nota {rating} no Google Maps é um sinal de alerta. Se implementar um sistema de solicitação ativa de avaliações para clientes satisfeitos, a nota sobe e reverte a percepção negativa.")
            elif float(rating) >= 4.5 and reviews_count >= 50:
                briefing["pontos_positivos"].append(f"Excelente avaliação no Maps ({rating} com {reviews_count} reviews).")
            elif float(rating) >= 4.0:
                briefing["pontos_positivos"].append(f"Nota {rating} no Maps com {reviews_count} avaliações.")
            
            if reviews_count < 5:
                report["score"] -= 15
                report["critical_pains"].append("Prova social local inexpressiva (menos de 5 reviews).")
                briefing["pontos_negativos"].append(f"Apenas {reviews_count} avaliações. Sem prova social suficiente.")
                briefing["recomendacoes"].append("Boss, a empresa tem pouquíssimas avaliações. Se criar um fluxo automatizado pedindo avaliação por WhatsApp após cada serviço, o volume de reviews sobe rápido e a ficha ganha relevância.")
            
            if not map_data.get('isClaimed'):
                report["score"] -= 30
                report["critical_pains"].append("Ficha Oficial NÃO Reivindicada. Qualquer concorrente pode alterar os dados.")
                briefing["pontos_negativos"].append("Ficha NÃO reivindicada. Vulnerável a alterações maliciosas.")
                briefing["recomendacoes"].append("Boss, a ficha não foi reivindicada pelo dono. Isso é um risco gravíssimo — qualquer pessoa pode sugerir alterações no telefone, endereço ou até marcar como fechada. Se reivindicar, a empresa ganha controle total.")
            else:
                briefing["pontos_positivos"].append("Ficha reivindicada pelo dono.")

            # =============================================
            # 5. ANÁLISE DE SENTIMENTO DAS REVIEWS VIA GEMINI
            # =============================================
            reviews_text = map_data.get('reviewsList', [])
            
            if reviews_text and self.api_key:
                try:
                    reviews_for_prompt = "\n".join([
                        f"- [{r['stars']}★] \"{r['text'][:200]}\"" 
                        for r in reviews_text if r.get('text')
                    ])
                    
                    client = genai.Client(api_key=self.api_key)
                    prompt = f"""
                    Você é um Engenheiro de SEO Local analisando reviews REAIS do Google Maps.
                    
                    Empresa: {map_data.get('title')} | Nota: {rating} | Total Reviews: {reviews_count}
                    Campos Vazios na Ficha: {', '.join(missing_fields) if missing_fields else 'Nenhum'}
                    Fotos: {photo_count}
                    Ficha Reivindicada: {'Sim' if map_data.get('isClaimed') else 'Não'}
                    
                    Reviews (amostra real):
                    {reviews_for_prompt}
                    
                    PROIBIÇÃO: ANALISE APENAS os dados fornecidos. NÃO INVENTE reviews ou problemas.
                    
                    Responda ESTRITAMENTE em JSON válido, com a seguinte estrutura:
                    {{
                        "review_sentiment_summary": "Resumo em 2-3 frases do que os clientes dizem. Cite trechos literais entre aspas.",
                        "missing_keyword_in_title": "O título '{map_data.get('title')}' possui o serviço principal? Justifique.",
                        "negative_points": ["Apenas dores REAIS baseadas nos dados acima"],
                        "optimization_tips": ["Sugestão 1 baseada nos dados reais", "Sugestão 2"]
                    }}
                    """

                    response = client.models.generate_content(
                        model='gemini-2.5-flash',
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            response_mime_type="application/json",
                            temperature=0.1
                        )
                    )

                    if response.text:
                        raw_text = response.text
                        start_idx = raw_text.find('{')
                        end_idx = raw_text.rfind('}')
                        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                            raw_text = raw_text[start_idx:end_idx+1]
                            
                        json_data = json.loads(raw_text)
                        
                        report["findings"]["review_sentiment_summary"] = json_data.get("review_sentiment_summary", "")
                        report["findings"]["missing_keyword_in_title"] = json_data.get("missing_keyword_in_title", "")
                        report["findings"]["negative_points"] = json_data.get("negative_points", [])
                        report["findings"]["optimization_tips"] = json_data.get("optimization_tips", [])
                        
                        # Boss briefing from sentiment
                        sentiment = json_data.get("review_sentiment_summary", "")
                        if sentiment:
                            briefing["recomendacoes"].append(f"Boss, de acordo com as reviews públicas: {sentiment}")
                        
                        neg_count = len(json_data.get("negative_points", []))
                        report["score"] = max(0, report["score"] - (neg_count * 5))
                        
                except Exception as gemini_err:
                    print(f"  [GMB Skill] Erro Gemini na análise de reviews: {gemini_err}")
                    report["findings"]["review_sentiment_summary"] = "Análise de sentimento indisponível nesta varredura."
            elif not reviews_text:
                report["findings"]["review_sentiment_summary"] = "Nenhuma review com texto encontrada para análise."
                    
        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                report["critical_pains"].append("Cota do Gemini atingida (429). Aguarde 1 minuto.")
            else:
                report["critical_pains"].append(f"Erro na cognição do Auditor GMB: {e}")
        
        # Ensure score doesn't go below 0
        report["score"] = max(0, report["score"])
        report["boss_briefing"] = briefing
        
        return report
