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
        """
        briefing = self._empty_boss_briefing()
        
        report = {
            "name": "Audit UX/SEO Agent",
            "score": 100, 
            "load_time_seconds": round(self.load_time, 2),
            "findings": {
                "has_h1": False,
                "has_meta_desc": False,
                "images_without_alt": 0,
                "is_mobile_responsive_ui": False,
                "has_blog_or_cms": False,
                "has_contact_form": False,
                "cta_buttons_count": 0,
                "cta_examples": [],
                "ui_clinical_analysis": "",
                "evidences": []
            },
            "critical_pains": [],
            "boss_briefing": briefing
        }

        if not self.soup:
            report["critical_pains"].append("Falha Crítica: O Parser não conseguiu ler a estrutura.")
            return report

        # =============================================
        # 1. SEO BÁSICO: H1
        # =============================================
        h1 = self.soup.find('h1')
        if h1:
            report["findings"]["has_h1"] = True
            h1_text = h1.get_text(strip=True)[:80]
            briefing["pontos_positivos"].append(f"Tag H1 presente: '{h1_text}'.")
        else:
            report["score"] -= 20
            report["critical_pains"].append("Miopia do Google: Seu site não possui tag H1. Ele é ignorado pelas buscas orgânicas gratuitas.")
            report["findings"]["evidences"].append("A varredura da tag <body> não retornou nenhum elemento de título principal <H1>.")
            briefing["pontos_negativos"].append("Sem tag H1 no site. O Google não entende qual é o assunto principal da página.")
            briefing["recomendacoes"].append("Boss, o site não tem H1. Se corrigir isso com um título claro contendo a palavra-chave principal do negócio, o Google passa a indexar a página corretamente e o site sobe nas buscas orgânicas gratuitas.")

        # =============================================
        # 2. SEO BÁSICO: META DESCRIPTION
        # =============================================
        meta_desc = self.soup.find('meta', attrs={'name': 'description'})
        if meta_desc and meta_desc.get('content'):
            report["findings"]["has_meta_desc"] = True
            briefing["pontos_positivos"].append("Meta Description presente para formação de snippets no Google.")
        else:
            report["score"] -= 15
            report["critical_pains"].append("A vitrine está opaca: Falta Descrição Meta, diminuindo pela metade a taxa de clique no Google.")
            report["findings"]["evidences"].append("O HTML não possui a tag <meta name='description'> no seu <head> para formação de Snippets de Busca.")
            briefing["pontos_negativos"].append("Sem Meta Description. O resultado no Google mostra texto genérico em vez de uma descrição persuasiva.")
            briefing["recomendacoes"].append("Boss, sem Meta Description o resultado no Google mostra um trecho aleatório do site. Se escrever uma descrição de 155 caracteres focada na oferta, a taxa de clique orgânico pode dobrar.")

        # =============================================
        # 3. IMAGENS SEM ALT
        # =============================================
        images = self.soup.find_all('img')
        images_without_alt = [img for img in images if not img.get('alt')]
        report["findings"]["images_without_alt"] = len(images_without_alt)
        
        if len(images_without_alt) > 0:
            report["score"] -= min(20, len(images_without_alt) * 2)
            report["critical_pains"].append(f"Performance e Acessibilidade amadora: Encontramos {len(images_without_alt)} imagens invisíveis para o algoritmo.")
            report["findings"]["evidences"].append(f"Foram renderizadas {len(images_without_alt)} tags <img> com o atributo 'alt' em branco ou inexistente.")
            briefing["pontos_negativos"].append(f"{len(images_without_alt)} imagens sem texto alternativo. Perdem indexação no Google Imagens.")
        else:
            briefing["pontos_positivos"].append("Todas as imagens possuem atributo alt preenchido.")

        # =============================================
        # 4. RESPONSIVIDADE MOBILE
        # =============================================
        meta_viewport = self.soup.find('meta', attrs={'name': 'viewport'})
        if meta_viewport:
            report["findings"]["is_mobile_responsive_ui"] = True
            briefing["pontos_positivos"].append("Site com viewport mobile configurado.")
        else:
            report["findings"]["is_mobile_responsive_ui"] = False
            report["score"] -= 25
            report["critical_pains"].append("UI Trágica no Celular: O site não possui tag Viewport. O layout quebra no mobile.")
            report["findings"]["evidences"].append("Ausência da tag <meta name='viewport'>, indicando quebra do grid mobile.")
            briefing["pontos_negativos"].append("Site não responsivo. Mais de 70% do tráfego está no celular e a experiência é quebrada.")
            briefing["recomendacoes"].append("Boss, o site não é responsivo. Se adaptar para mobile, a taxa de rejeição cai e as conversões aumentam, já que a maioria dos acessos vem de celular.")

        # =============================================
        # 5. VELOCIDADE
        # =============================================
        if self.load_time > 3.0:
            report["score"] -= 25
            report["critical_pains"].append(f"A Carga da Morte: O site demora {round(self.load_time, 2)}s para responder. 53% dos usuários fecham abas lentas.")
            report["findings"]["evidences"].append(f"Tempo de resposta inicial: {round(self.load_time, 2)}s.")
            briefing["pontos_negativos"].append(f"Site muito lento ({round(self.load_time, 2)}s). Visitantes desistem antes de ver o conteúdo.")
            briefing["recomendacoes"].append("Boss, o site está carregando em mais de 3 segundos. Se otimizar as imagens, minificar o CSS/JS e usar cache, o tempo cai para menos de 1.5s e a taxa de conversão melhora significativamente.")
        elif self.load_time > 1.5:
            report["score"] -= 10
            report["critical_pains"].append(f"Experiência com Fricção (Load Time: {round(self.load_time, 2)}s).")
            report["findings"]["evidences"].append(f"TTFB operando no limite: {round(self.load_time, 2)}s.")
        else:
            briefing["pontos_positivos"].append(f"Velocidade de carregamento boa ({round(self.load_time, 2)}s).")

        # =============================================
        # 6. BLOG / CMS / CONTEÚDO ORGÂNICO
        # =============================================
        report["findings"]["has_blog_or_cms"] = False
        if self.soup:
            has_wp = "wp-content/" in self.raw_html
            has_blog_link = False
            for a in self.soup.find_all('a', href=True):
                href = a['href'].lower()
                if "/blog" in href or "/noticias" in href or "/artigos" in href:
                    has_blog_link = True
                    break
            
            if has_wp or has_blog_link:
                report["findings"]["has_blog_or_cms"] = True
                briefing["pontos_positivos"].append("Blog/seção de conteúdo detectada. Isso gera tráfego orgânico recorrente.")

        if not report["findings"]["has_blog_or_cms"]:
            report["score"] -= 10
            report["critical_pains"].append("Máquina Orgânica Quebrada: Inexistência de Blog. Total dependência de Tráfego Pago.")
            report["findings"]["evidences"].append("Não foram localizados diretórios '/blog', '/noticias' ou '/artigos' na navegação.")
            briefing["pontos_negativos"].append("Sem Blog. Todo tráfego depende de anúncios pagos.")
            briefing["recomendacoes"].append("Boss, essa empresa não tem blog. Se criar uma seção de blog com artigos otimizados para SEO, começa a atrair visitantes do Google de graça todos os meses, reduzindo a dependência de tráfego pago.")

        # =============================================
        # 7. FORMULÁRIOS DE CONTATO
        # =============================================
        forms = self.soup.find_all('form')
        has_contact_form = False
        for form in forms:
            # Verifica se o form parece ser de contato (tem input de email ou telefone)
            inputs = form.find_all('input')
            for inp in inputs:
                inp_type = (inp.get('type') or '').lower()
                inp_name = (inp.get('name') or '').lower()
                inp_placeholder = (inp.get('placeholder') or '').lower()
                if inp_type in ['email', 'tel'] or any(kw in inp_name for kw in ['email', 'phone', 'telefone', 'nome', 'name']) or any(kw in inp_placeholder for kw in ['email', 'telefone', 'seu nome']):
                    has_contact_form = True
                    break
            if has_contact_form:
                break
        
        report["findings"]["has_contact_form"] = has_contact_form
        if has_contact_form:
            briefing["pontos_positivos"].append("Formulário de contato/captação detectado no site.")
        else:
            report["score"] -= 10
            report["critical_pains"].append("Funil de Captação Inexistente: Nenhum formulário de contato detectado no site.")
            report["findings"]["evidences"].append("A varredura das tags <form> não encontrou campos de email, telefone ou nome.")
            briefing["pontos_negativos"].append("Sem formulário de captação de leads. Visitantes não têm como deixar contato.")
            briefing["recomendacoes"].append("Boss, o site não tem formulário de contato. Se adicionar um formulário pedindo nome, email e telefone, a empresa passa a captar leads automaticamente mesmo quando não está online.")

        # =============================================
        # 8. BOTÕES DE CTA (CALL TO ACTION)
        # =============================================
        cta_keywords = ['comprar', 'agendar', 'orçamento', 'contato', 'whatsapp', 'compre', 'saiba mais', 'fale conosco', 
                        'solicite', 'peça', 'inscreva', 'cadastre', 'começar', 'experimente', 'teste grátis', 'baixar',
                        'download', 'agende', 'reserve', 'consulta', 'cotação']
        
        cta_count = 0
        cta_examples = []
        
        for tag in self.soup.find_all(['a', 'button']):
            text = tag.get_text(strip=True).lower()
            if any(kw in text for kw in cta_keywords) and len(text) < 60:
                cta_count += 1
                if len(cta_examples) < 3:
                    cta_examples.append(tag.get_text(strip=True))
        
        report["findings"]["cta_buttons_count"] = cta_count
        report["findings"]["cta_examples"] = cta_examples
        
        if cta_count == 0:
            report["score"] -= 15
            report["critical_pains"].append("Ausência Total de CTAs: Nenhum botão de ação (Compre, Agende, Orçamento) detectado.")
            report["findings"]["evidences"].append("Nenhum elemento <a> ou <button> contém palavras de ação comercial.")
            briefing["pontos_negativos"].append("Sem botões de ação (CTA) no site. O visitante não é guiado para nenhuma ação de compra.")
            briefing["recomendacoes"].append("Boss, o site não tem botões claros como 'Peça um Orçamento' ou 'Agende uma Consulta'. Se adicionar CTAs visíveis em cada seção, a taxa de conversão sobe porque o visitante sabe exatamente o que fazer.")
        elif cta_count <= 2:
            briefing["pontos_negativos"].append(f"Poucos CTAs ({cta_count}). Sites de alta conversão possuem CTAs em cada seção.")
            briefing["brechas_diferenciacao"].append("Pode melhorar drasticamente a conversão apenas adicionando mais botões de ação ao longo da página.")
        else:
            briefing["pontos_positivos"].append(f"{cta_count} botões de ação encontrados (CTAs): {', '.join(cta_examples)}.")

        # =============================================
        # 9. ANÁLISE CLÍNICA DE UI VIA LLM
        # =============================================
        if self.api_key and self.soup:
            try:
                # Monta um resumo estrutural do site para o LLM
                headings = []
                for tag in ['h1', 'h2', 'h3']:
                    for h in self.soup.find_all(tag):
                        headings.append(f"<{tag}>{h.get_text(strip=True)}</{tag}>")
                
                sections_summary = "\n".join(headings[:15])
                forms_count = len(forms)
                links_count = len(self.soup.find_all('a'))
                
                ui_context = f"""
                Títulos encontrados no site:
                {sections_summary}
                
                Total de links: {links_count}
                Total de formulários: {forms_count}
                Total de CTAs detectados: {cta_count} (Exemplos: {', '.join(cta_examples)})
                Responsivo: {'Sim' if report['findings']['is_mobile_responsive_ui'] else 'Não'}
                Velocidade: {round(self.load_time, 2)}s
                Blog: {'Sim' if report['findings']['has_blog_or_cms'] else 'Não'}
                """
                
                client = genai.Client(api_key=self.api_key)
                prompt = f"""
                Você é um Auditor Expert de UI/UX focado em Conversão. 
                Analise a estrutura de conteúdo deste site e dê um veredicto CURTO (máximo 3 frases).
                
                Estrutura do site:
                {ui_context}
                
                Responda APENAS se a estrutura parece organizada para converter visitantes em clientes.
                Cite os títulos exatos como evidência.
                Responda em texto puro, sem JSON.
                """
                
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=prompt,
                    config=types.GenerateContentConfig(temperature=0.1)
                )
                
                if response.text:
                    report["findings"]["ui_clinical_analysis"] = response.text.strip()
                    
            except Exception as ui_err:
                print(f"  [UX Agent] Análise clínica UI falhou: {ui_err}")
                report["findings"]["ui_clinical_analysis"] = "Análise clínica indisponível nesta varredura."

        # Ensure score doesn't go below 0
        report["score"] = max(0, report["score"])
        report["boss_briefing"] = briefing
        
        return report
