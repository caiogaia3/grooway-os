# groowayOS — Referência Arquitetural

> **Leitura condicional.** Claude lê este arquivo SOMENTE quando a tarefa envolve Tráfego, Deploy, Segurança ou Arsenal.

---

## 🧠 Arquitetura Traffic Agent V2

O módulo de tráfego opera sob **Controle Determinístico + IA Preditiva**:

1. **Nomenclatura Estrita:** `[Cliente] Objetivo | Rede | Destino | Local | Mês/Ano | Lance`
2. **Circuit Breakers:** Se gastar > 3x CPA sem Venda Real → Pausa Automática. IA não contorna.
3. **Conversão Offline:** Otimização por RD/Kommo (GCLID/WBRAID via `/webhooks/crm-conversion`)
4. **Soft-Scaling:** IA sugere aumento, Python trava max +20%/semana
5. **Mission Control:** UI gera fila de otimização, humano aprova

---

## 🚀 Deploy — Easypanel (Hostinger VPS)

- **CI/CD:** Push para `main` → Easypanel faz build automático
- **Variáveis de ambiente:** Configuradas no painel Easypanel (NÃO no .env commitado)
- **Build:** nixpacks.toml já configurado
- **Sem:** vercel.json, netlify.toml

---

## 🔒 Padrões de Segurança

- NUNCA commit `.env` ou secrets
- Supabase: `createServerClient` em server actions (nunca client-side para dados sensíveis)
- Tokens de API dos clientes: tabela `client_api_tokens` com RLS
- Google Ads / Meta Ads: tokens sempre via server action

---

## 📚 Arsenal

**Catálogo:** `/Users/CaioGaia/Documents/PROJETOS /arsenal/CATALOG.md`

**UI/UX (USAR SEMPRE no frontend):**
- `/Users/CaioGaia/Documents/PROJETOS /arsenal/comunidade/skills/ui-ux-pro-max-skill/`

**Segurança (OBRIGATÓRIO antes de deploy):**
- `/Users/CaioGaia/Documents/PROJETOS /arsenal/templates/securitycoderules.md`

**Workflows:** `/build-saas` (7 etapas) | `/scale-2026` (8 etapas)

---

## 🗂️ Estrutura do Projeto

```
grooway-os/
├── intelligence/                    # Python — orquestrador e agentes
│   ├── api.py                      # FastAPI entry point (porta 8000)
│   ├── main.py                     # PredatorOrchestrator
│   ├── leads_pipeline/             # ABM pipeline (5 etapas)
│   ├── skills_engine/core.py       # PredatorSkill base class
│   ├── skills_engine/skills/       # 10 agentes especializados
│   ├── jobs/                       # Circuit breaker, offline conversions
│   └── mcp_servers/                # Google Ads, Meta Ads, Sheets
├── src/
│   ├── app/(os)/                   # Módulos: crm, hub, trafego, scraper, etc
│   ├── app/actions/                # Server actions (ponte Next.js ↔ Python)
│   └── core/lib/supabase/          # Clientes Supabase (client/server/middleware)
└── genesis/v2/migrations/          # Migrations SQL versionadas
```

---

## 📝 Convenções de Código

- **Python:** Herdar de `PredatorSkill`, retornar schema padrão
- **TypeScript:** Zod para validação, sempre tipar com interfaces
- **Testes:** `npm test` (frontend) e `pytest` (intelligence/) antes de push
