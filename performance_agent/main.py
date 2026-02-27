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
from skills_engine.skills.agent_05_rastreador_leads.skill_tracking import TrackingSkill
from skills_engine.skills.agent_02_perito_site.skill_performance import PerformanceSkill
from skills_engine.skills.agent_04_espiao_mercado.skill_market_research import MarketResearchSkill
from skills_engine.skills.agent_03_auditor_atencao.skill_social_media import SocialMediaResearchSkill
from skills_engine.skills.agent_08_tribunal_boss.skill_senior_analyst import SeniorAnalystSkill
from skills_engine.skills.agent_01_detetive_gmb.skill_google_my_business import GMBAuditorSkill
from skills_engine.skills.agent_06_maestro_ads.skill_keyword_research import KeywordResearchSkill
from skills_engine.skills.agent_07_alquimista_ofertas.skill_value_proposition import ValuePropositionSkill
from skills_engine.skills.agent_09_sniper_fechamento.skill_closer import CloserSkill
from skills_engine.skills.agent_10_design_visionary.skill_design_translation import DesignTranslationSkill

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
        # Array of selected agents passed from the frontend UI
        selected_agents = self.params.get("selectedAgents", [])
        
        # If no agents are selected or the parameter is missing, default to running all frontier agents
        if not selected_agents:
            selected_agents = ["tracking", "performance", "market", "social", "gmb", "keywords"]

        if "tracking" in selected_agents:
            self.skills.append(TrackingSkill(self.target_url))
        if "performance" in selected_agents:
            self.skills.append(PerformanceSkill(self.target_url))
        if "market" in selected_agents:
            self.skills.append(MarketResearchSkill(self.target_url, self.params))
            
        if "social" in selected_agents:
            insta_url = self.params.get("instagram", "")
            insta_url = insta_url.strip().rstrip("/")
            handle = insta_url.split("/")[-1].replace("@", "") if insta_url else self.target_url.split("://")[-1].split(".")[0]
            self.skills.append(SocialMediaResearchSkill(handle))
            
        if "gmb" in selected_agents:
            self.skills.append(GMBAuditorSkill(self.target_url, self.params))
            
        if "keywords" in selected_agents:
            self.skills.append(KeywordResearchSkill(self.target_url, self.params))
        
        # --- COMPILATION AGENTS (ALWAYS RUN) ---
        # Skill do Diretor de Marketing Implacável (O Boss)
        self.skills.append(SeniorAnalystSkill(self.target_url, self.params))
        
        # Skill Complementar do Boss: Proposta de Valor Irresistível
        self.skills.append(ValuePropositionSkill(self.target_url, self.params))
        
        # O GOLPE DE MISERICÓRDIA: O Fechador (SEMPRE O ÚLTIMO)
        self.skills.append(CloserSkill(self.target_url, self.params))

        # O TRADUTOR DIDÁTICO E DESIGNER (Prepara o PDF)
        self.skills.append(DesignTranslationSkill(self.target_url, self.params))

    def _fetch_target(self):
        """Faz a requisição vital 1 única vez para não afogar o servidor alvo e passa o HTML pras skills."""
        print(f"[*] Motores ligados. Mirando no alvo: {self.target_url}")
        try:
            start_time = time.time()
            # Modern browser User-Agent to avoid blocks from security systems (UX/SEO Agent fix)
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            }
            response = requests.get(self.target_url, timeout=12, headers=headers)
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
        
        # Passa o contexto para agentes de compilação que precisam dele
        if isinstance(skill, (ValuePropositionSkill, CloserSkill, DesignTranslationSkill)):
            skill.previous_results_context = previous_results_context
            
        # DesignTranslation tem assinatura especial
        if isinstance(skill, DesignTranslationSkill):
            return skill.execute(previous_results_context=previous_results_context)
        
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
                # Se a skill da vez for estratégica, enviamos o boss_briefing de cada agente anterior
                if isinstance(skill, (SeniorAnalystSkill, ValuePropositionSkill, CloserSkill, DesignTranslationSkill)):
                    previous_context = {}
                    for r in master_report["skills_results"]:
                        agent_name = r.get("name", "unknown")
                        previous_context[agent_name] = {
                            "findings": r.get("findings", {}),
                            "boss_briefing": r.get("boss_briefing", {}),
                            "score": r.get("score", 0),
                            "critical_pains": r.get("critical_pains", []),
                            "internal_briefing_for_boss": r.get("internal_briefing_for_boss", ""),
                            "internal_briefing_for_alchemist": r.get("internal_briefing_for_alchemist", "")
                        }
                    result = self._run_skill(skill, previous_results_context=previous_context)
                else:
                    result = self._run_skill(skill)
                    
                master_report["skills_results"].append(result)
                time.sleep(4) # 4s entre agentes para evitar 429 (rate limit) da Gemini API
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
