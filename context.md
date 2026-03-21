# groowayOS — Context

> **Source of truth** para estado do projeto. Atualizado ao final de cada tarefa.
> **Regra de poda:** Manter apenas sessão atual + 1 anterior. Histórico velho → git log.

---

## Estado Atual

**Fase:** Minerador integrado. Próximo: Autopilot Engine (Tráfego V2 Fase 4).

**O que está pronto:**
- Estrutura base Next.js + Supabase no Easypanel
- Predator Orchestrator (10 agentes diagnóstico Python)
- CRM: leads, clientes, pipeline
- Tráfego V2: Mission Control, Circuit Breakers, Offline Conversions
- Minerador de Leads B2B: pipeline completo (Maps → Web → AI → LinkedIn → Email)
- MCPs: Google Ads, Meta Ads, Google Sheets

---

## 📍 Zona Ativa

**Zona:** TRÁFEGO + GOOGLE ADS API
**Trabalhando em:** Engine do Autopilot LLM (Fase 4 - Otimização e Soft-Scaling)
**Pendente:** Rodar migration 004 no Supabase, configurar APIFY_API_TOKEN e HUNTER_API_KEY no Easypanel

---

## Sessão Anterior (2026-03-20)

- Integração Minerador de Leads B2B completa (migration 004 + 10 módulos Python + 4 endpoints + UI + Kanban)
- RADAR: zona LEADS/SCRAPER limpa
- Sidebar: "Minerador" adicionado
- Sistema RADAR + context + erros otimizado (v2 adaptativo)

---

## Decisões Arquiteturais

| Decisão | Escolha | Motivo |
|---|---|---|
| Circuit Breakers | Pausa em 3x CPA (Python rígido) | Controle determinístico |
| Otimização Preditiva | LLM a cada 3 dias → JSON de mutates | Soft-scale +20% max/semana |
| Minerador ABM | Módulo separado (não PredatorSkill) | Batch processing ≠ diagnóstico |
| UI Tráfego | Mission Control | Decisões de alto valor + human-in-the-loop |

---

## Backlog Ativo

- [ ] Backend: Engine do Autopilot LLM (Fase 4 - Tráfego)
- [ ] Deploy: Migration 004 no Supabase + env vars (APIFY, HUNTER)
- [ ] Testar pipeline Minerador end-to-end

---

## Variáveis de Ambiente (Easypanel)

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

## 📈 Velocity

| Sessão | Features | Bugs | Zonas limpas |
|---|---|---|---|
| 2026-03-20 | 4 (tráfego, minerador, sidebar, funil) | 2 (escaped quotes, motion/react) | 1 (LEADS/SCRAPER) |

---

**Deploy:** `git push origin main` → Easypanel rebuild automático
**Banco:** Supabase Dashboard → SQL Editor → migrations manuais
