import sys
import time
from typing import Dict, Any
import json
import requests
import os
from dotenv import load_dotenv

# Carrega ambiente vital (Supabase, OpenAI, Gemini) ANTES de carregar qualquer módulo dependente delas.
load_dotenv(dotenv_path=".env")
load_dotenv(dotenv_path="../raio-x-digital/.env.local")

# Correção vital para macOS (LibreSSL / OpenSSL conflitos com Gemini/gRPC)
os.environ["GRPC_DNS_RESOLVER"] = "native"
import ssl
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

from concurrent.futures import ThreadPoolExecutor
from skills_engine.skills.skill_tracking import TrackingSkill
from skills_engine.skills.skill_performance import PerformanceSkill
from skills_engine.skills.skill_market_research import MarketResearchSkill
from skills_engine.skills.skill_social_media import SocialMediaResearchSkill
from skills_engine.skills.skill_senior_analyst import SeniorAnalystSkill
from skills_engine.skills.skill_google_my_business import GMBAuditorSkill
from skills_engine.skills.skill_keyword_research import KeywordResearchSkill
from skills_engine.skills.skill_value_proposition import ValuePropositionSkill

class PredatorOrchestrator:
    def __init__(self, params):
        self.params = params
        target_url = params.get("url", "")
        self.target_url = target_url if target_url.startswith("http") else f"https://{target_url}"
        self.raw_html = ""
        self.load_time = 0.0
        self.skills = []
        
        # Onde a mágica acontece. Adicione novas skills aqui.
        self._register_skills()

    def _register_skills(self):
        self.skills.append(TrackingSkill(self.target_url))
        self.skills.append(PerformanceSkill(self.target_url))
        self.skills.append(MarketResearchSkill(self.target_url, self.params))
        
        insta_url = self.params.get("instagram", "")
        insta_url = insta_url.strip().rstrip("/")
        handle = insta_url.split("/")[-1].replace("@", "") if insta_url else self.target_url.split("://")[-1].split(".")[0]
        self.skills.append(SocialMediaResearchSkill(handle))
        
        # Skill do Auditor Local de GMB
        self.skills.append(GMBAuditorSkill(self.target_url, self.params))
        
        # Skill de Pesquisa de Palavras-Chave (NOVO)
        self.skills.append(KeywordResearchSkill(self.target_url, self.params))
        
        # Skill do Diretor de Marketing Implacável (O Boss)
        self.skills.append(SeniorAnalystSkill(self.target_url, self.params))
        
        # Skill Complementar do Boss: Proposta de Valor Irresistível (SEMPRE POR ÚLTIMO)
        self.skills.append(ValuePropositionSkill(self.target_url, self.params))

    def _fetch_target(self):
        """Faz a requisição vital 1 única vez para não afogar o servidor alvo e passa o HTML pras skills."""
        print(f"[*] Motores ligados. Mirando no alvo: {self.target_url}")
        try:
            start_time = time.time()
            response = requests.get(self.target_url, timeout=12, headers={'User-Agent': 'Digital-Predator-Bot/2.0'})
            self.load_time = time.time() - start_time
            
            if response.status_code == 200:
                self.raw_html = response.text
                print(f"[+] Alvo engajado. Load real capturado: {round(self.load_time, 2)}s.")
            else:
                print(f"[!] O servidor rejeitou o contato HTTP {response.status_code}.")
        except Exception as e:
            print(f"[!] Escudo bloqueou a análise: {e}")

    def _run_skill(self, skill, previous_results_context=None):
        """Injeta os dados base e ativa a Skill específica."""
        # Se for o Senior Analyst, além do HTML, passamos o histórico de tudo que as skills acharam
        if isinstance(skill, SeniorAnalystSkill):
            skill.setup(self.raw_html, self.load_time, previous_results_context)
        else:
            skill.setup(self.raw_html, self.load_time)
            
        return skill.execute()

    def run(self):
        self._fetch_target()
        
        master_report: Dict[str, Any] = {
            "target_url": self.target_url,
            "company_name": self.params.get("companyName", ""),
            "scan_timestamp": time.time(),
            "skills_results": []
        }

        print(f"[*] Lançando {len(self.skills)} Agentes sequencialmente (Prevenção Antifraude API)...")
        
        for skill in self.skills:
            try:
                print(f"  -> Executando {skill.__class__.__name__}...")
                # Se a skill da vez for o CMO, enviamos o boss_briefing de cada agente anterior
                if isinstance(skill, (SeniorAnalystSkill, ValuePropositionSkill)):
                    previous_context = {}
                    for r in master_report["skills_results"]:
                        agent_name = r.get("name", "unknown")
                        previous_context[agent_name] = {
                            "findings": r.get("findings", {}),
                            "boss_briefing": r.get("boss_briefing", {}),
                            "score": r.get("score", 0),
                            "critical_pains": r.get("critical_pains", [])
                        }
                    result = self._run_skill(skill, previous_results_context=previous_context)
                else:
                    result = self._run_skill(skill)
                    
                master_report["skills_results"].append(result)
                time.sleep(2) # Reduzido de 5s para 2s para acelerar o motor (evitando timeouts de front)
            except Exception as e:
                print(f"  [!] Falha crítica no agente {skill.__class__.__name__}: {e}")
                
        return master_report

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python main.py <url_ou_parametros_json>")
        sys.exit(1)
        
    arg_input = sys.argv[1]
    try:
        # Next.js manda um JSON stringificado
        params = json.loads(arg_input)
    except Exception:
        # Fallback rodando nativo no terminal `python main.py site.com`
        params = {
            "url": arg_input,
            "companyName": "Desconhecido",
            "city": "",
            "instagram": "",
            "linkedin": ""
        }
        
    orchestrator = PredatorOrchestrator(params)
    
    # Roda a inteligência
    report_data = orchestrator.run()
    
    # Salva o Output como JSON 
    # (No futuro, o Next.js vai ler esse arquivo para gerar a Proposta e a tela)
    output_filename = "predator_report.json"
    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump(report_data, f, ensure_ascii=False, indent=4)
        
    print(f"\n[+] Relatório de Guerra gerado em {output_filename}")
    
    # Snapshot no Terminal
    for skill_data in report_data["skills_results"]:
        print(f" -> {skill_data['name']} reportou nota: {skill_data.get('score', 0)}")
