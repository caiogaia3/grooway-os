# Claude Code Configuration — groowayOS

## 📖 Ao iniciar sessão

1. `./context.md` — estado atual + zona ativa (source of truth)
2. `./RADAR.md` — **somente a zona indicada no context.md**

> `docs/erros-e-solucoes.md` → ler **somente** se a tarefa envolve debugging ou zona com histórico de erro.
> `docs/architecture.md` → ler **somente** se a tarefa envolve módulo de Tráfego, Deploy, ou Segurança.

---

## 🛰️ Protocolo RADAR (Obrigatório)

**Arquivo:** `./RADAR.md` | **Skill mestre:** `/arsenal/pessoal/skills/SKILL_radar.md`

**Ao ENTRAR numa zona:**
- Ler itens da zona no RADAR
- No caminho? → resolve de carona. Fora? → ignora.

**Durante TRABALHO:**
- Notou algo? → anota no RADAR: `- prefixo descrição (DD/MM)`
- Prefixos: `!` = bloqueia deploy, `?` = investigar, sem prefixo = oportunístico
- NÃO para o trabalho

**Ao SAIR da zona:**
- Resolveu item → deleta a linha
- Padrão recorrente? → gradua pra `erros-e-solucoes.md`
- Atualizar emoji da zona (🔴🟡🟢⚪)

**🚗 Princípio da Carona:** mesmo caminho → resolve. Caminho oposto → anota. NUNCA desvia rota.

**Auto-higiene (a cada sessão):** itens com 14+ dias sem ação → revisar se ainda são relevantes. Se não, deletar.

---

## 🤖 Modo Autônomo

- Executa ações de rotina SEM pedir aprovação (criar/editar arquivos, rodar scripts)
- Pede confirmação APENAS para: `git push`, deletar arquivos, mudanças de schema em produção
- Antes de qualquer commit: `grep -rn 'className=\\"' src/` → deve retornar zero
- Ao completar tarefa: atualizar `context.md`
- Ao resolver erro: perguntar se resolveu → se sim, registrar em `docs/erros-e-solucoes.md`

---

## 🎯 O Projeto

**groowayOS** — OS para agência de marketing digital Grooway.

| Stack | Tech |
|---|---|
| Frontend | Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 |
| Backend | Python 3.9+ (intelligence/), Node.js (server actions) |
| Database | Supabase (PostgreSQL + RLS) |
| AI | Google Gemini (primary) + OpenAI GPT-4o-mini (fallback) |
| Deploy | VPS Hostinger via Easypanel (CI/CD via GitHub push) |

Módulos: CRM, Predator Orchestrator, Proposals, Tráfego V2 (Mission Control), Minerador de Leads B2B

> Detalhes de arquitetura, deploy, segurança e arsenal → `docs/architecture.md`

---

## 📋 Regras Operacionais

| Regra | Aplicação |
|---|---|
| security-isolation | Frontend NUNCA acessa Service Role key |
| multi-tenant-shield | RLS em TODAS as tabelas Supabase |
| clean-architecture | Services finos, lógica nos services/ |
| conventional-commits | `feat:` / `fix:` / `docs:` / `refactor:` |
| framer-motion only | NUNCA usar `motion/react` — sempre `framer-motion` |
| escaped quotes | `grep -rn 'className=\\"' src/` = zero antes de commit |

---

## 🧠 Sistema Adaptativo (Meta-regras)

O combo `CLAUDE.md + context.md + RADAR.md + erros-e-solucoes.md` é um sistema vivo:

1. **RADAR aprende:** itens recorrentes (3+ vezes na mesma zona) graduam para `erros-e-solucoes.md` como padrão de prevenção
2. **Context se poda:** manter apenas a sessão atual + 1 anterior. Histórico velho → git log
3. **Erros amadurecem:** se um fix foi aplicado 3+ vezes, ele vira regra no CLAUDE.md (seção Regras Operacionais)
4. **Zonas convergem:** zona 🟢 por 3+ sessões → colapsar itens e marcar ⚪ (limpa)
5. **Protocolos evoluem:** se uma regra nunca é usada em 5+ sessões → questionar se ainda é relevante

**Sync Arsenal:** mudou o protocolo? Se é estrutural + genérico → atualiza `SKILL_radar.md` no arsenal

---

**Projeto iniciado:** 2026-03-20
**Arsenal:** `/Users/CaioGaia/Documents/PROJETOS /arsenal/`
