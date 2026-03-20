# groowayOS — Erros & Soluções

> **Memória viva do projeto.** Atualizar sempre que um erro for resolvido.
>
> **Claude:** Leia este arquivo antes de implementar qualquer feature ou corrigir qualquer bug.
> Ao resolver um novo erro, adicionar no formato: **Sintoma → Causa → Detecção → Fix → Prevenção**

---

## Índice

- [Build / Deploy](#build--deploy)
- [Frontend / Next.js](#frontend--nextjs)
- [Supabase / Banco](#supabase--banco)
- [Python / Agentes](#python--agentes)
- [APIs Externas](#apis-externas)

---

## Build / Deploy

### [2026-03-20] JSX Escaped Quotes → "Unterminated string constant"

**Sintoma:**
```
Parsing ecmascript source code failed
Expected unicode escape / Unterminated string constant
```

**Causa:** Geração automática de código (IA/snippet) produziu atributos JSX com backslash escapado:
```tsx
// ERRADO (quebra o build):
<p className=\"text-sm text-slate-400\">

// CORRETO:
<p className="text-sm text-slate-400">
```

**Arquivos afetados (histórico):**
- `src/features/xray/components/tabs/CMOPanel.tsx`
- `src/features/xray/components/tabs/CommercialPlanPanel.tsx`
- `src/features/xray/components/tabs/GMBPanel.tsx`
- `src/features/xray/components/tabs/MarketPanel.tsx`
- `src/features/xray/components/tabs/PerformancePanel.tsx`

**Detecção:**
```bash
grep -rn 'className=\\"' src/
# Deve retornar zero resultados antes de qualquer commit
```

**Fix (quando encontrado):**
```bash
# Substitui globalmente em arquivo específico:
sed -i '' 's/\\"/"/g' arquivo.tsx

# Ou em todos os arquivos TSX de uma vez:
find src/ -name "*.tsx" -exec sed -i '' 's/\\"/"/g' {} \;
```

**Prevenção:** Após qualquer geração de código IA, rodar o grep de detecção antes de commitar.

---

### [2026-03-20] Module not found: `motion/react`

**Sintoma:**
```
Module not found: Can't resolve 'motion/react'
```

**Causa:** Import de `motion/react` (pacote que não existe no projeto) em vez de `framer-motion`.

**Fix:**
```tsx
// ERRADO:
import { motion } from 'motion/react';

// CORRETO:
import { motion } from 'framer-motion';
```

**Prevenção:** Este projeto usa `framer-motion`. Nunca usar `motion/react`.

---

## Frontend / Next.js

*(Adicionar erros conforme surgirem)*

---

## Supabase / Banco

*(Adicionar erros conforme surgirem)*

---

## Python / Agentes

*(Adicionar erros conforme surgirem)*

---

## APIs Externas

*(Adicionar erros conforme surgirem)*

---

## Como Atualizar Este Arquivo

Ao resolver um erro novo, adicionar na categoria correta com o formato:

```markdown
### [YYYY-MM-DD] Título descritivo do erro

**Sintoma:** O que aparece no terminal/browser/logs

**Causa:** Por que acontece

**Detecção:** Como identificar antes que cause problema

**Fix:** O que fazer para resolver

**Prevenção:** Como evitar na próxima vez
```
