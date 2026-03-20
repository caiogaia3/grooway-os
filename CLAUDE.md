# Claude Code Configuration — groowayOS

## 📖 LEIA PRIMEIRO — Antes de Qualquer Ação

**Ao iniciar sessão, leia nesta ordem:**

1. `./context.md` — estado atual, decisões arquiteturais, próximos passos
2. `./docs/erros-e-solucoes.md` — erros já vistos + soluções confirmadas

**Ao resolver um erro novo:** adicionar em `docs/erros-e-solucoes.md` (Sintoma → Causa → Detecção → Fix → Prevenção)

**Protocolo Claude (AUTOMÁTICO — sem esperar pedido):**
- Ao completar qualquer tarefa/etapa: atualizar `context.md` (o que foi feito, próximos passos, decisões novas)
- Ao resolver um erro: perguntar se resolveu → se sim, registrar em `docs/erros-e-solucoes.md`
- Antes de qualquer commit: `grep -rn 'className=\\"' src/` → deve retornar zero

---

## 🎯 O Projeto

**groowayOS** — Sistema Operacional para agência de marketing digital Grooway.

Stack:
- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4
- **Backend:** Python 3.9+ (intelligence/), Node.js (Next.js server actions)
- **Database:** Supabase (PostgreSQL + RLS)
- **AI:** Google Gemini (primary) + OpenAI GPT-4o-mini (fallback)
- **Deploy:** VPS Hostinger via Easypanel (CI/CD via GitHub push)

Módulos principais:
- CRM (leads, clientes, pipeline)
- Predator Orchestrator (10 agentes de diagnóstico)
- Proposals (gerador de propostas com IA)
- Tráfego (em construção — agente Google Ads copiloto)

---

## 🤖 Modo Autônomo

Claude opera em modo autônomo neste projeto:
- Executa ações de rotina SEM pedir aprovação (criar arquivos, editar, rodar scripts)
- Pede confirmação APENAS para: `git push`, deletar arquivos, mudanças de schema em produção
- Ao iniciar sessão: lê `context.md` e confirma estado sem precisar ser solicitado

---

## 📚 Arsenal — Ferramentas Disponíveis

**Catálogo completo:**
- `/Users/CaioGaia/Documents/PROJETOS /arsenal/CATALOG.md`
- `/Users/CaioGaia/Documents/PROJETOS /arsenal/pessoal/CATALOG.md`

**UI/UX — USAR SEMPRE no frontend:**
- `/Users/CaioGaia/Documents/PROJETOS /arsenal/comunidade/skills/ui-ux-pro-max-skill/`
- 161 regras de design + 67 estilos UI — consultar antes de criar qualquer componente

**Segurança (OBRIGATÓRIO antes de deploy):**
- `/Users/CaioGaia/Documents/PROJETOS /arsenal/templates/securitycoderules.md`
- Cobre: auth, RLS, APIs, data protection, LangGraph, code quality

**Workflows disponíveis:**
- `/build-saas` → planejamento técnico (7 etapas)
- `/scale-2026` → planejamento estratégico (8 etapas)

---

## 📋 Regras que se Aplicam a Este Projeto

Leis obrigatórias do arsenal:

| Regra | Aplicação |
|---|---|
| rule-01 (security-isolation) | Frontend NUNCA acessa Service Role key |
| rule-03 (multi-tenant-shield) | RLS em TODAS as tabelas Supabase |
| rule-05 (session-hardening) | Cookies: httpOnly, secure, sameSite |
| rule-06 (clean-architecture) | Services finos, lógica nos services/ |
| rule-10 (test-first) | TDD — testes antes da implementação |
| rule-12 (conventional-commits) | Commits: feat/fix/docs/refactor |

**Referência:** `/Users/CaioGaia/Documents/PROJETOS /arsenal/pessoal/rules/`

---

## 🚀 Deploy — Easypanel (Hostinger VPS)

- **Plataforma:** Easypanel na VPS Hostinger
- **CI/CD:** Push para `main` → Easypanel faz build automático
- **Variáveis de ambiente:** Configuradas no painel Easypanel (NÃO no .env commitado)
- **Build:** nixpacks.toml já configurado no projeto
- **Sem:** vercel.json, netlify.toml ou configurações de outras plataformas

---

## 🗂️ Estrutura Crítica do Projeto

```
grooway-os/
├── intelligence/                    # Python — orquestrador e agentes
│   ├── main.py                     # PredatorOrchestrator (entry point)
│   ├── skills_engine/
│   │   ├── core.py                 # PredatorSkill base class (HERDAR AQUI)
│   │   └── skills/                 # 10 agentes especializados
│   └── mcp_servers/                # MCPs: Google Ads, Meta Ads, Sheets
├── src/
│   ├── app/
│   │   ├── (os)/crm/clientes/      # CRM — módulo de clientes
│   │   ├── actions/                # Server actions (ponte Next.js ↔ Python)
│   │   └── ...
│   └── core/lib/supabase/          # Clientes Supabase (client/server/middleware)
└── genesis/                        # Migrations SQL versionadas
    ├── v1/                         # Schema inicial
    └── v2/                         # Novas migrations (ICP, tráfego, etc.)
```

---

## 🔒 Padrões de Segurança

- NUNCA commit `.env` ou secrets
- Supabase: usar `createServerClient` em server actions (nunca client-side para dados sensíveis)
- Tokens de API dos clientes: tabela `client_api_tokens` com RLS — frontend não acessa direto
- Google Ads / Meta Ads: tokens sempre via server action, nunca expostos no browser

---

## 📝 Convenções de Código

- **Commits:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:` (Conventional Commits)
- **Branches:** `feature/nome`, `fix/nome`, `docs/nome`
- **Python:** Herdar de `PredatorSkill`, retornar schema padrão (`pontos_negativos`, `pontos_positivos`, `brechas_diferenciacao`, `recomendacoes`)
- **TypeScript:** Zod para validação de inputs, sempre tipar com interfaces
- **Testes:** Rodar `npm test` (frontend) e `pytest` (intelligence/) antes de push

---

**Projeto iniciado:** 2026-03-20
**Deploy:** Easypanel / Hostinger VPS
**Arsenal:** `/Users/CaioGaia/Documents/PROJETOS /arsenal/`
