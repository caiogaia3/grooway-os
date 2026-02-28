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
            "consistencia_nap": {"status": False, "label": "Consistência de Dados (NAP)", "desc": "Telefone e endereço rigorosamente preenchidos sem keyword stuffing"},
            "estrategia_categorias": {"status": False, "label": "Categorias Estratégicas", "desc": "Uso de categoria primária específica e secundárias adequadas"},
            "gestao_avaliacoes": {"status": False, "label": "Gestão Ativa de Avaliações", "desc": "Respostas frequentes e rápidas aos comentários"},
            "conteudo_visual": {"status": False, "label": "Conteúdo Visual (Fotos/Vídeos)", "desc": "Alta densidade visual (Mínimo 20 fotos de qualidade)"},
            "google_posts": {"status": False, "label": "Uso de Google Posts", "desc": "Publicações de ofertas, dicas e novidades na ficha"},
            "descricao_otimizada": {"status": False, "label": "Descrição Otimizada", "desc": "Descrição rica utilizando a maior parte dos 750 caracteres permitidos"},
            "secao_qa": {"status": False, "label": "Perguntas e Respostas (Q&A)", "desc": "Antecipação de dúvidas frequentes dos clientes"},
            "produtos_servicos": {"status": False, "label": "Produtos, Serviços e Atributos", "desc": "Catálogo completo com descrições e atributos de identidade"},
            "chat_mensagens": {"status": False, "label": "Chat e Mensagens Ativos", "desc": "Tempo de resposta em mensagens menor que 24 horas"},
            "propriedade_reivindicada": {"status": False, "label": "Propriedade Reivindicada", "desc": "Ficha verificada e sob controle do proprietário"}
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
                "maxReviews": 100,
            }
            run = apify_client.actor("compass/crawler-google-places").call(run_input=run_input, timeout_secs=55)
            
            if run and run.get("defaultDatasetId"):
                for item in apify_client.dataset(run["defaultDatasetId"]).iterate_items():
                    img_val = item.get('imageCount') or item.get('totalPhotos') or 0
                    p_count = len(img_val) if isinstance(img_val, list) else int(img_val or 0)

                    cats = item.get('categories') or []
                    revs = item.get('reviews') or []
                    menu_svcs = item.get('menu') or item.get('services') or []
                    posts_arr = item.get('posts') or []

                    map_data = {
                        "title": item.get('title'),
                        "rating": item.get('totalScore'),
                        "reviews": item.get('reviewsCount'),
                        "phone": item.get('phone'),
                        "website": item.get('website'),
                        "address": item.get('address'),
                        "isClaimed": item.get('isClaimed', True),
                        "services": menu_svcs,
                        "reviewsList": [
                            {"text": r.get('text', ''), "stars": r.get('stars', 0), "response": r.get('responseFromOwnerText', '')}
                            for r in revs
                        ],
                        "hasPosts": bool(posts_arr),
                        "addCats": cats[1:] if len(cats) > 1 else [],
                        "mainCategory": cats[0] if cats else '',
                        "openingHours": item.get('openingHours') or [],
                        "description": item.get('description', ''),
                        "additionalInfo": item.get('additionalInfo', {}),
                        "socialMedia": item.get('socialMedia', []) or item.get('webResults', []) or [],
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
                pts += 10
                ef_breakdown["consistencia_nap"]["status"] = True
            
            if len(map_data.get('addCats', [])) > 0 or map_data.get('mainCategory'):
                pts += 10
                ef_breakdown["estrategia_categorias"]["status"] = True
            
            rev_list = map_data.get('reviewsList', [])
            responded = sum(1 for r in rev_list if r.get('response'))
            if responded > 0 and len(rev_list) > 0 and (responded / len(rev_list)) >= 0.3: 
                pts += 10
                ef_breakdown["gestao_avaliacoes"]["status"] = True
            
            if p_count >= 20: 
                pts += 10
                ef_breakdown["conteudo_visual"]["status"] = True
            
            if map_data.get('hasPosts'):
                pts += 10
                ef_breakdown["google_posts"]["status"] = True
                
            if map_data.get('description') and len(map_data.get('description', '')) > 200:
                pts += 10
                ef_breakdown["descricao_otimizada"]["status"] = True
                
            if map_data.get('services'): 
                pts += 10
                has_svcs = True
                ef_breakdown["produtos_servicos"]["status"] = True
            
            if map_data.get('isClaimed'): 
                pts += 10
                ef_breakdown["propriedade_reivindicada"]["status"] = True
                
            # As the API may not return Q&A and messages explicitly without deep crawling, 
            # they start False. The LLM vai diagnosticar como falta de otimização 100%.
            
            est_rating = str(map_data.get('rating', "N/A"))
            revs_vol = str(map_data.get('reviews', "0"))
            evid.append(f"Mapeamento de Eficácia Base (Automático): {pts}% detectado estruturalmente.")

            # Build reviews_list_raw for frontend
            reviews_list_raw = [
                {
                    "text": str(r.get("text") or "")[:300],
                    "stars": r.get("stars", 0),
                    "has_response": bool(r.get("response")),
                    "response_preview": str(r.get("response") or "")[:150]
                }
                for r in rev_list[:20]
            ]

            # Build missing_for_100 list
            missing_for_100 = []
            for key, item in ef_breakdown.items():
                if not item["status"]:
                    missing_for_100.append({
                        "item": item["label"],
                        "description": item["desc"],
                        "impact": "10%"
                    })

            # =============================================
            # 3. ANÁLISE FORENSE VIA IA (com fallback OpenAI)
            # =============================================
            revs_txt = "\n".join([f"- [{r.get('stars')}★] {str(r.get('text'))[:250]}" for r in rev_list[:20]])
            fail_points = [item["label"] for key, item in ef_breakdown.items() if not item["status"]]
            responded_count = sum(1 for r in rev_list if r.get('response'))
            total_reviews = len(rev_list)

            prompt = f"""
            PERSONA: INVESTIGADOR FORENSE DO GMB (Agente 01). 
            ARSENAL: 'Scanner dos 10 Pilares', 'Veredito Forense de Comentários', 'Damage Cost Estimator', 'Plano de Dominação Local'.
            MISSAO: Provar a negligência digital de '{map_data.get('title')}' e revelar o dinheiro deixado na mesa na busca local do Google.

            DADOS ESTRUTURAIS EXTRAÍDOS DA FICHA:
            - Título da Ficha (SEO Name): {map_data.get('title')}
            - Eficácia Atual (Base): {pts}% de 100%
            - Avaliação: {est_rating}★ ({revs_vol} avaliações)
            - Fotos: {p_count} fotos publicadas
            - Respostas às avaliações: {responded_count} de {total_reviews} respondidas
            - Serviços cadastrados: {'Sim' if has_svcs else 'Não'}
            - Website cadastrado: {'Sim' if map_data.get('website') else 'Não'}
            - Links Sociais detectados (Insta/FB etc): {map_data.get('socialMedia')}
            - Acessibilidade informada: {map_data.get('additionalInfo')}
            - Tem publicações/posts ativos?: {'Sim' if map_data.get('hasPosts') else 'Não'}
            - Descrição GMB (Análise de Keywords): {map_data.get('description') or 'Sem descrição.'}
            - Itens FALTANDO no Scanner Base: {', '.join(fail_points) if fail_points else 'Nenhum — ficha base completa!'}
            
            20 COMENTÁRIOS REAIS RECENTES DOS CLIENTES:
            {revs_txt if revs_txt else 'Nenhum comentário disponível.'}
            
            SUA MISSÃO EM JSON:
            1. VEREDITO FORENSE E REVIEWS: O que clientes amam e odeiam? Destaque as Top 3 palavras mais usadas para reclamar (Keywords Recorrentes de Reclamação).
            2. ANÁLISE CIRÚRGICA DO PERFIL (O que falta?): Avalie impiedosamente se falta (ou se tem) o link do site, redes sociais, posts recentes, informações de acessibilidade, fotos, e especificação de serviços. Aponte cada falha.
            3. AUDITORIA DE SEO LOCAL (Título e Descrição): Avalie se a descrição técnica contém palavras-chave para ranquear organicamente na região. Avalie se o nome da empresa ("{map_data.get('title')}") traz consigo o segmento para facilitar o ranqueamento orgânico, ou se é só a "Razão Social".
            4. ESTIMATIVA DE DAMAGE COST: Usando a nota ({est_rating}) e a falta de SEO/Infos, estime de forma consultiva a % de clientes locais perdidos ("Damage Cost") por preferirem concorrentes mais bem avaliados e completos. Fale de dinheiro e métricas.
            5. IMPACTO DOS 10 PILARES: Para cada item faltante e falha de SEO apontada, explique o dreno financeiro exato de não cumprir esse pilar do algoritmo do Google.
            6. PLANO DE DOMINAÇÃO LOCAL: Liste ações incisivas (táticas) para ultrapassar os top 3 da região na busca orgânica. Diga exatamente o que mudar (ex: "ativar mensagens em 24h", "renomear ficha para incluir keyword", etc).
            7. ESPINHO & DIAMANTE (Munição de Venda): O ralo por onde vaza capital (Thorns) e a mina de ouro inexplorada através de SEO Local (Pearls).

            JSON OUTPUT FORMAT:
            {{
                "forensic_verdict": "Veredito geral focado no algoritmo de Busca Local, relevância, e na experiência do usuário baseada em reviews",
                "reviews_analysis": "Análise detalhada do sentimento. Inclua as 'Keywords Recorrentes de Reclamação'",
                "sentiment_score": "Positivo/Neutro/Negativo",
                "reviews_highlights": {{
                    "best": ["Citação real positiva 1", "Citação 2"],
                    "worst": ["Citação real negativa 1", "Citação 2"]
                }},
                "damage_cost_estimate": "Estimativa consultiva e financeira de perda de clientes devido à ineficácia do perfil GMB e notas/reviews",
                "why_not_100": "Explicação detalhada contendo a 'ANÁLISE CIRÚRGICA DO PERFIL' (se falta site, social, posts, fotos) e a 'AUDITORIA DE SEO LOCAL' (título/descrição sem keywords). Aponte os erros como dinheiro perdido.",
                "thorns": "O maior dreno de dinheiro ou objeção atual (ex: falta de acessibilidade ou site)",
                "pearls": "A oportunidade de lucro local imediata",
                "local_domination_plan": ["Ação Tática 1 para Dominação", "Ação Tática 2", "Ação Tática 3", "Ação 4", "Ação 5"],
                "boss_ammo": "Munição de venda letal para o CMO fechar negócio, combinando dados do GMB"
            }}
            """

            res = self._call_llm_json(prompt)

            if res:
                sentiment_v = res.get("reviews_analysis", "")
                forensic_v = res.get("forensic_verdict", "")
                negs = [res.get("why_not_100", ""), forensic_v]
                tips = res.get("local_domination_plan", [])
                boss_ammo = res.get("boss_ammo", "")
                damage_cost = res.get("damage_cost_estimate", "")
                
                b_neg.append(f"Eficácia GMB ({pts}%): {res.get('why_not_100', '')[:200]}")
                b_neg.append(f"Damage Cost Local: {damage_cost}")
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
                        {"key": k, "label": v["label"], "description": v["desc"], "status": v["status"], "impact": "10%"}
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
                    "damage_cost": res.get("damage_cost_estimate", "") if res else "",
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
