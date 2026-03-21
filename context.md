# groowayOS — Context da Sessão

> **Atualizado em:** 2026-03-20
> **Leia este arquivo ao iniciar qualquer sessão antes de responder.**

---

## Estado Atual do Projeto

**Fase:** Backend intelligence pronto. Próximo: Frontend Tráfego.

**O que está pronto:**
- Estrutura base Next.js + Supabase funcionando no Easypanel
- Predator Orchestrator (10 agentes de diagnóstico Python)
- MCPs: Google Ads, Meta Ads, Google Sheets
- CRM: módulo de leads, proposals (UI mockada)
- CLAUDE.md configurado com arsenal e regras

**Concluído nesta sessão (2026-03-20):**
- `genesis/v2/migrations/003_clients_and_icp.sql` — migration aplicada e validada no Supabase
- `intelligence/api.py` — FastAPI com rotas `/generate-campaign`, `/run-predator`, `/optimize-campaign`
- `intelligence/Dockerfile` — container Python para Easypanel (porta 8000)
- `intelligence/skills_engine/skills/agent_traffic_manager/` — agente copiloto (herda PredatorSkill)
- `docs/erros-e-solucoes.md` — memória viva de erros do projeto
- Supabase: 1 projeto ativo (GroowayOS), org renomeada para "Grooway"
- Build Easypanel: corrigido (escaped quotes JSX + import motion/react)
- `RADAR.md` — sistema de inteligência operacional implementado (scout persistente)
- `SKILL_radar.md` — skill mestre criada no arsenal pessoal
- `CLAUDE.md` — protocolo RADAR integrado (princípio da carona)

**Concluído — Integração Minerador de Leads B2B (2026-03-20):**
- `genesis/v2/migrations/004_leads_scraper.sql` — tabelas empresas_leads, contatos_leads, pipeline_jobs + trigger auto-score + RPC pgvector
- `intelligence/leads_pipeline/` — módulo completo: pipeline.py (orquestrador), maps_scraper.py, web_enricher.py, social_enricher.py, company_analyzer.py, employee_finder.py, email_enricher.py, embedding_generator.py, social_search_enricher.py, linktree_resolver.py
- `intelligence/api.py` — endpoints: `/leads-pipeline/start`, `/leads-pipeline/status/{id}`, `/leads/mover-funil`, `/leads/search` + Supabase-backed job store
- `src/app/actions/leads_pipeline.ts` — server actions bridge (4 funções)
- `src/app/(os)/scraper/page.tsx` — UI funcional: prospecção, progresso real-time, tabela com expandable rows, seleção batch, score badges
- `src/app/(os)/scraper/funil/page.tsx` — Kanban de funil com 6 estágios (lead_novo → ganho/perdido), cards com contatos e move otimista
- `src/core/components/Sidebar.tsx` — nav item "Minerador" adicionado com ícone Database
- Pasta `/temp/leads-pro-app/` deletada após integração completa

---

## 📍 Zona Atual
- **Zona:** TRÁFEGO + GOOGLE ADS API (V2 Inteligência Suprema)
- **Trabalhando em:** Concluindo a Fase 4 Front-end (Mission Control, Naming Standards atualizado) e avançando para a Engine.
- RADAR: 10 abertos | 1 zona 🟡 | 0 zonas 🔴 | varredura: 20/03

---

## Decisões Arquiteturais Tomadas

| Decisão | Escolha | Motivo |
|---|---|---|
| Módulo Sentinela | Machine Learning Causal baseada em CRMs externos | Otimizar campanhas pela "Venda Real" e não cliques |
| Lances e Circuit Breakers | Limits rígidos (Pausa em 3x CPA) criados em Python | Controle de Danos determinístico (evitar surtos de LLM) |
| Otimização Preditiva (Fase 4) | LLM analisa métricas a cada 3 dias -> sugere JSON de Mutates no backend | Loop de feedback: Soft-scale (+20%) ou pausa de keywords ruins, com opção de 1-click approve no Frontend |
| UI/UX Tráfego | Interface "Mission Control" | Focar interações em decisões de alto valor ("Sankey diagrams", Alertas 1-click) |
| Import Decoder | Snapshot (cópia no momento da conversão) | Mais simples e previsível |

---

### AGORA — Gestor de Tráfego V2 (Fases 1, 2 e 3 Concluídas)
- [x] Backend: Adicionar lógica no Python para Nomenclatura Estrita (`[Cliente] Objetivo | Rede...`).
- [x] Backend: Expandir `google_ads_server.py` para injetar Tracking Templates na MCC e MUTATE massivo.
- [x] Backend: Cron Job / Endpoint de `Circuit Breaker` (trava de sangramento 3x CPA).
- [x] Backend: Webhooks de `Offline Conversions` prontos no FastAPI para fechar loop CRM -> Ads.
- [x] Frontend: Criar o "Cockpit Global" e o layout Sankey da Aba Tráfego (`/trafego`).
- [ ] Backend: Engine do Autopilot LLM (Fase 4 - Otimização e Soft-Scaling).

---

## Arquivos Críticos do Projeto

| Arquivo | Para quê |
|---|---|
| `intelligence/api.py` | FastAPI — entry point do serviço Python |
| `intelligence/Dockerfile` | Container Python para Easypanel |
| `intelligence/skills_engine/core.py` | Base class PredatorSkill — herdar aqui |
| `intelligence/skills_engine/skills/agent_traffic_manager/` | Agente copiloto de tráfego |
| `intelligence/skills_engine/skills/agent_06_maestro_ads/` | Keywords — reusar no traffic manager |
| `intelligence/mcp_servers/mcp-google-ads/` | API Google Ads — pronto com OAuth2 |
| `genesis/v2/migrations/003_clients_and_icp.sql` | Schema clients + ICP + campaigns |
| `genesis/v2/migrations/004_leads_scraper.sql` | Schema leads scraper + pipeline_jobs |
| `intelligence/leads_pipeline/pipeline.py` | Orquestrador ABM pipeline (5 etapas) |
| `src/app/actions/leads_pipeline.ts` | Server actions → Python leads pipeline |
| `src/core/lib/supabase/` | Clientes Supabase (client/server/middleware) |
| `src/app/(os)/crm/` | CRM existente — referência de padrão de código |
| `docs/erros-e-solucoes.md` | Memória viva de erros e soluções |

---

## Variáveis de Ambiente (Easypanel)

Configurar no painel Easypanel (não commitar):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
INTELLIGENCE_API_URL=http://grooway-intelligence:8000
INTELLIGENCE_API_KEY=
APIFY_API_TOKEN=
HUNTER_API_KEY=
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GEMINI_API_KEY=
```

---

## Problemas Conhecidos / Resolvidos

| Problema | Status | Solução |
|---|---|---|
| clients table não existia (só leads) | Resolvido | Migration 003 |
| Frontend chama Python diretamente | Decidido | FastAPI separado no Easypanel |
| Build falhava: escaped quotes JSX | Resolvido | sed global + grep de validação |
| Build falhava: motion/react import | Resolvido | Trocar por framer-motion |

> Para detalhes completos dos erros, ver `docs/erros-e-solucoes.md`

---

**Deploy:** `git push origin main` → Easypanel faz build automático
**Banco:** Supabase Dashboard → SQL Editor → migrations manuais
