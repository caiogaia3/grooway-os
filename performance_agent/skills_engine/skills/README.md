# Arsenal de Skills da Agência (Inteligência 360º)

Bem-vindo à arquitetura de Skills (Agentes Isolados). O projeto deixou de ser apenas um script gigante para virar uma **máquina modular** onde você pode ligar e desligar "Auditores" a qualquer momento.

## Diretório de Especialistas e Suas Dependências

Cada Agente na pasta `skills_engine/skills/` tem uma documentação detalhada `.md` (Exemplo: `skill_tracking.md`) com seu escopo, cálculo de pontos e como ele gera lucro. 

Abaixo, a lista central de ferramentas instaladas e o que elas exigem para rodar:

### 1. Auditor de Performance (`skill_performance.py`)
- **Foco:** UX, Velocidade de Carregamento TBB e SEO On-Page Padrão.
- **Libs Obrigatórias:** `requests`, `beautifulsoup4`.

### 2. Engenheiro de Dados (`skill_tracking.py`)
- **Foco:** Vasculhar o HTML por Pixels (Meta, TikTok), GTM e Analytics.
- **Libs Obrigatórias:** Expressões Regulares padrão nativas (`re`).

### 3. Memória Estratégica (`skill_market_research.py`)
- **Foco:** Entender o Nicho da Empresa Lendo a Home e extrair o ICP / Concorrentes.
- **Libs Obrigatórias:** `google-genai` (Antiga *google-generativeai*), `python-dotenv`.

### 4. Auditor Social (`skill_social_media.py`)
- **Foco:** Vasculhar o Instagram público atrás de falta de engajamento e funil na Bio.
- **Libs Obrigatórias:** `instaloader`.

### 5. Diretor de Vendas/CMO Virtual (`skill_senior_analyst.py`)
- **Foco:** Ignorar a técnica e caçar falhas de persuasão na Copy e na Oferta da Empresa.
- **Libs Obrigatórias:** `google-genai` (Modelo focado na agressividade de negócios e ROI).

### 6. Especialista Google Meu Negócio / GMB (`skill_google_my_business.py`)
- **Foco:** SEO Local, Reputação no Maps e Auditoria completa visando 100% de performance de fluxo orgânico baseado em Fichas com informações pendentes.
- **Libs Obrigatórias:** `google-genai` (Para Inferência / Busca em tempo real da Reputação Local).

---

> [!TIP]
> **Adicionando novas Skills:** Para incluir novas táticas (Ex: Um rastreador para achar sites em WordPress Desatualizado), basta criar  `skill_seu_nome.py` aqui, colocar a classe herdando `PredatorSkill` e adicioná-la no arquivo central `main.py` -> `def _register_skills()`.
