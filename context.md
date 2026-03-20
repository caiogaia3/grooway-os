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

---

## Decisões Arquiteturais Tomadas

| Decisão | Escolha | Motivo |
|---|---|---|
| Deploy | VPS Hostinger via Easypanel | Já configurado |
| CI/CD | GitHub push → Easypanel auto-build | Já configurado |
| Python backend | FastAPI separado (porta 8000) | 2 serviços independentes no Easypanel |
| Módulo Tráfego no frontend | Seção separada no sidebar | Não dentro do CRM |
| Segmento cliente | Lista fechada (10 opções) | Padronização para relatórios |
| Import Decoder | Snapshot (cópia no momento da conversão) | Mais simples e previsível |
| Agente de Tráfego | Modo copiloto (usuário aprova antes de subir) | Segurança com budget real |

---

## Hierarquia de Agentes (Visão do Sistema)

```
Especialista de Marketing Sênior  [Fase 2 — ESTRATÉGICO]
│  ICP, posicionamento, conteúdo, scripts de vídeo
│
└── Tribunal Boss  [existe no Predator — ANALÍTICO]
     │  Diagnóstico + compilação de dados
     │
     └── Agentes Especialistas  [OPERACIONAL]
          ├── Gestor de Tráfego  ← BACKEND PRONTO, FALTA FRONTEND
          ├── Agente de Conteúdo [futuro]
          └── Agente de SEO [futuro]
```

---

## Pipeline Prospect → Cliente

```
Decoder (diagnóstico) → Proposta → "Converter em Cliente"
                                         ↓
                              clients + client_icp (pré-preenchido do Decoder)
                                         ↓
                              Módulo Tráfego → gera campanha → aprova → sobe
```

---

## Próximos Passos (em ordem)

### AGORA — Frontend Tráfego
- [ ] Sidebar: adicionar item "Tráfego" em `src/core/components/Sidebar`
- [ ] `/trafego/` — overview de clientes com tráfego ativo
- [ ] `/trafego/[clienteId]/` — ICP form + botão "Gerar Campanha"
- [ ] `/trafego/[clienteId]/review` — cards editáveis de campanha
- [ ] Server action `generate_campaign.ts` → chama FastAPI Python

### DEPOIS — Integração
- [ ] Configurar segundo serviço no Easypanel (intelligence/ com Dockerfile)
- [ ] Integrar mcp-google-ads para subir campanha aprovada
- [ ] Variáveis de ambiente no Easypanel: `INTELLIGENCE_API_URL`, `INTELLIGENCE_API_KEY`

### CONCLUÍDO
- [x] Aplicar migration 003 no Supabase
- [x] Criar `intelligence/api.py` — FastAPI
- [x] Criar `intelligence/Dockerfile`
- [x] Criar `intelligence/skills_engine/skills/agent_traffic_manager/`
- [x] Fix build: escaped quotes JSX + motion/react import
- [x] Criar `docs/erros-e-solucoes.md`

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
