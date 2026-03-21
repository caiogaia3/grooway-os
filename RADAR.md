# 🛰️ RADAR

> **Prefixos:** `!` = bloqueia deploy | `?` = investigar | sem prefixo = oportunístico
> **Auto-higiene:** item com 14+ dias sem ação → revisar relevância ou deletar
> **Graduação:** item recorrente (3+ vezes) → move para `docs/erros-e-solucoes.md` como prevenção

CRM ⚪
- (ZONA LIMPA)

TRÁFEGO 🟢
- (ZONA LIMPA)

GOOGLE ADS API 🟡
- ? testar OAuth com MCC real (20/03)

INTELLIGENCE 🟡
- ! CORS add domínio prod no env ALLOWED_ORIGINS do Easypanel (20/03)

HIGIENE/ORGANIZAÇÃO 🟡
- ? padronizar naming server actions: snake_case vs kebab-case — escolher UM (20/03)
- consolidar features/xray/ vs features/xray-auditor/ — 2 ValuePropositionModal quase iguais (20/03)
- 16 arquivos com 300+ linhas — avaliar split em sub-componentes (20/03)

CORE/SHELL 🟡
- responsividade global mobile/tablet não testada (20/03)
- design-system.css não alinhado com arsenal UI/UX skill (20/03)

AUTH/SEGURANÇA ⚪
- (ZONA LIMPA)

PROPOSALS 🟡
- ? fluxo criação end-to-end funcional? verificar (20/03)
- ? dados Decoder alimentam Compiler automaticamente? (20/03)

LEADS/SCRAPER 🟢
- (ZONA LIMPA)

AUDITOR/DECODER 🟡
- ? 10 agentes retornam schema padrão? (20/03)
- ? resultados salvos onde — JSON local ou Supabase? (20/03)

ANALYTICS 🟡
- ? dados reais ou mock? verificar (20/03)

ROTAS ÓRFÃS ⚪
- (ZONA LIMPA)

📊 Pulso: 11 abertos (1! / 6? / 4 oportunísticos) | 0 graduados | 0 🔴 | varredura: 20/03
