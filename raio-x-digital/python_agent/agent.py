import requests
import time
import re
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import json
import sys

class PerformanceTrackerAgent:
    def __init__(self, start_url, max_pages=10):
        self.start_url = start_url if start_url.startswith("http") else f"https://{start_url}"
        self.domain = urlparse(self.start_url).netloc
        self.max_pages = max_pages
        self.visited = set()
        self.to_visit = set([self.start_url])
        
        self.report = {
            "domain": self.domain,
            "overall_status": "OK",
            "has_blog": False,
            "tracking_found": {
                "gtm": False,
                "google_analytics": False,
                "facebook_pixel": False
            },
            "performance_metrics": [],
            "ux_seo_issues": [],
            "pages_analyzed": 0
        }

    def _is_internal(self, url):
        return urlparse(url).netloc == self.domain

    def _analyze_tracking(self, html):
        # Look for common tracking snippets
        if re.search(r"GTM-[A-Z0-9]+", html, re.IGNORECASE):
            self.report["tracking_found"]["gtm"] = True
            
        if re.search(r"G-[A-Z0-9]+|UA-\d+-\d+", html, re.IGNORECASE):
            self.report["tracking_found"]["google_analytics"] = True
            
        if re.search(r"fbq\(|fbp", html, re.IGNORECASE):
            self.report["tracking_found"]["facebook_pixel"] = True

    def _analyze_page(self, url):
        try:
            # Measure TTFB and total load for the raw HTML
            start_time = time.time()
            response = requests.get(url, timeout=10, headers={'User-Agent': 'Digital-Predator-Bot/1.0'})
            load_time = time.time() - start_time
            
            if response.status_code != 200:
                print(f"[!] Erro ao acessar {url}: {response.status_code}")
                return

            html = response.text
            soup = BeautifulSoup(html, 'html.parser')
            
            # 1. Performance logs
            self.report["performance_metrics"].append({
                "url": url,
                "load_time_seconds": round(load_time, 2),
                "html_size_kb": round(len(html) / 1024, 2)
            })

            # 2. Tracking detection
            self.analyze_tracking(html)

            # 3. Basic UX/SEO tests
            title = soup.find('title')
            h1 = soup.find('h1')
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            
            issues = []
            if not title or not title.text.strip():
                issues.append("Title Tag ausente ou vazia.")
            if not h1:
                issues.append("H1 Tag ausente.")
            if not meta_desc:
                issues.append("Meta Description ausente.")

            # Check images without alt
            images = soup.find_all('img')
            images_without_alt = [img for img in images if not img.get('alt')]
            if len(images_without_alt) > 0:
                issues.append(f"{len(images_without_alt)} imagens sem atributo ALT (Problema de SEO e Acessibilidade).")
                
            if issues:
                self.report["ux_seo_issues"].append({
                    "url": url,
                    "issues": issues
                })

            # 4. Extract links to continue crawling
            for a_tag in soup.find_all('a', href=True):
                full_url = urljoin(url, a_tag['href'])
                
                # Check if it has a blog
                if '/blog' in full_url.lower() or 'blog.' in full_url.lower():
                    self.report["has_blog"] = True
                    
                # Add to queue if internal and not visited
                full_url_clean = full_url.split('#')[0] # remove fragments
                if self._is_internal(full_url_clean) and full_url_clean not in self.visited:
                    self.to_visit.add(full_url_clean)

        except requests.RequestException as e:
            print(f"[!] Falha na conexão com {url}: {e}")

    # Helper wrapper for Python < 3.8 class self-reference inside methods if needed
    def analyze_tracking(self, html):
        self._analyze_tracking(html)

    def run(self):
        print(f"[*] Iniciando Auditoria Predator em: {self.start_url}")
        
        while self.to_visit and self.report["pages_analyzed"] < self.max_pages:
            current_url = self.to_visit.pop()
            if current_url in self.visited:
                continue
                
            print(f" -> Rastreador (Spider) visitando: {current_url}")
            self._analyze_page(current_url)
            self.visited.add(current_url)
            self.report["pages_analyzed"] += 1
            
            time.sleep(0.5) # Polite delay
            
        print("[*] Varredura concluída. Gerando Relatório de Consultoria...")
        
        return self.report

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python agent.py <url_do_site>")
        sys.exit(1)
        
    target = sys.argv[1]
    agent = PerformanceTrackerAgent(target, max_pages=8)
    report_data = agent.run()
    
    # Save the output to a JSON file
    output_filename = "predator_report.json"
    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump(report_data, f, ensure_ascii=False, indent=4)
        
    print(f"[+] Relatório salvo em {output_filename}")
    
    # Print a quick summary
    print("\n" + "="*50)
    print("RESUMO DO RAIO-X (ALVO PARA VENDA DE SERVIÇOS)")
    print("="*50)
    print(f"✅ Blog Encontrado: {'Sim' if report_data['has_blog'] else 'Não (Oportunidade de Venda de Conteúdo)'}")
    
    track = report_data["tracking_found"]
    print(f"✅ Tracking (Gestão de Tráfego):")
    print(f"   - Google Tag Manager: {'Sim' if track['gtm'] else 'Não (Alerta Vermelho)'}")
    print(f"   - Facebook Pixel: {'Sim' if track['facebook_pixel'] else 'Não (Perdendo Retargeting)'}")
    print(f"   - Google Analytics: {'Sim' if track['google_analytics'] else 'Não (Tráfego Cego)'}")
    
    print(f"\n✅ Problemas Técnicos Críticos de SEO/UX encontrados em {len(report_data['ux_seo_issues'])} páginas analisadas.")
    print("="*50)
