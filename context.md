# groowayOS — Context da Sessão

> **Atualizado em:** 2026-03-20
> **Leia este arquivo ao iniciar qualquer sessão antes de responder.**

---

## 🎯 Estado Atual do Projeto

**Fase:** Planejamento concluído. Iniciando implementação do módulo Tráfego.

**O que está pronto:**
- Estrutura base Next.js + Supabase funcionando no Easypanel
- Predator Orchestrator (10 agentes de diagnóstico Python)
- MCPs: Google Ads, Meta Ads, Google Sheets
- CRM: módulo de leads, proposals (UI mockada)
- CLAUDE.md configurado com arsenal e regras

**O que acabou de ser criado (2026-03-20):**
- `genesis/v2/migrations/003_clients_and_icp.sql` — migration completa (clients + client_icp + campaigns + função convert_lead_to_client)
- `CLAUDE.md` — configurado com arsenal, modo autônomo, regras obrigatórias

---

## 📋 Decisões Arquiteturais Tomadas

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

## 🚀 Hierarquia de Agentes (Visão do Sistema)

```
Especialista de Marketing Sênior  [Fase 2 — ESTRATÉGICO]
│  ICP, posicionamento, conteúdo, scripts de vídeo
│
└── Tribunal Boss  [existe no Predator — ANALÍTICO]
     │  Diagnóstico + compilação de dados
     │
     └── Agentes Especialistas  [OPERACIONAL]
          ├── Gestor de Tráfego  ← CONSTRUINDO AGORA
          ├── Agente de Conteúdo [futuro]
          └── Agente de SEO [futuro]
```

---

## 📁 Pipeline Prospect → Cliente

```
Decoder (diagnóstico) → Proposta → "Converter em Cliente"
                                         ↓
                              clients + client_icp (pré-preenchido do Decoder)
                                         ↓
                              Módulo Tráfego → gera campanha → aprova → sobe
```

---

## ⏭️ Próximos Passos (em ordem)

### AGORA — Pendente
- [ ] **Aplicar migration no Supabase** (manual): Supabase Dashboard → SQL Editor → rodar `003_clients_and_icp.sql`

### PRÓXIMO — FastAPI Python
- [ ] Criar `intelligence/api.py` — FastAPI com rotas `/generate-campaign`, `/run-predator`
- [ ] Criar `intelligence/Dockerfile` — container Python para Easypanel

### DEPOIS — Agente Traffic Manager
- [ ] Criar `intelligence/skills_engine/skills/agent_traffic_manager/` (herda PredatorSkill)
- [ ] Agente recebe client_icp, usa agent_06 para keywords, gera JSON de campanha

### DEPOIS — Frontend Tráfego
- [ ] Sidebar: adicionar item "Tráfego" em `src/core/components/Sidebar`
- [ ] `/trafego/` — overview de clientes com tráfego ativo
- [ ] `/trafego/[clienteId]/` — ICP form + botão "Gerar Campanha"
- [ ] `/trafego/[clienteId]/review` — cards editáveis de campanha
- [ ] Server action `generate_campaign.ts` → chama FastAPI Python

---

## 🗂️ Arquivos Críticos do Projeto

| Arquivo | Para quê |
|---|---|
| `intelligence/skills_engine/core.py` | Base class `PredatorSkill` — herdar aqui |
| `intelligence/skills_engine/skills/agent_06_maestro_ads/` | Keywords — reusar no traffic manager |
| `intelligence/mcp_servers/mcp-google-ads/` | API Google Ads — pronto com OAuth2 |
| `genesis/v2/migrations/003_clients_and_icp.sql` | Schema completo — aplicar no Supabase |
| `src/core/lib/supabase/` | Clientes Supabase (client/server/middleware) |
| `src/app/(os)/crm/` | CRM existente — referência de padrão de código |

---

## 🔑 Variáveis de Ambiente (Easypanel)

Configurar no painel Easypanel (não commitar):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
INTELLIGENCE_API_URL=http://grooway-intelligence:8000
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GEMINI_API_KEY=
```

---

## 🐛 Problemas Conhecidos / Resolvidos

| Problema | Status | Solução |
|---|---|---|
| clients table não existia (só leads) | ✅ Resolvido | Migration 003 cria clients + client_icp + campaigns |
| Frontend chama Python diretamente | ✅ Decidido | FastAPI separado no Easypanel |

---

**Deploy:** `git push origin main` → Easypanel faz build automático
**Banco:** Supabase Dashboard → SQL Editor → migrations manuais
