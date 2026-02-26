# Skill: Auditoria de Perfil & Engajamento (`skill_social_media.py`)

## Objetivo
Avaliar o Funil Social através das contas públicas oficiais da empresa-alvo, quantificando o estado do Instagram (e no futuro, LinkedIn e Tiktok) sem necessidade de logins abusivos ou proxies estourando anti-bots. Foca na validação da "Estante" da Empresa no mundo.

## Dependências
- `instaloader` (Lib focada em download de Media GraphQL pública do IG - usada aqui apenas como Metadata Parser).
- API Nativa Oculta (Não usa scraping bruto com Beautiful Soup para não queimar IP rápido, mas explora o endpoint aberto Meta ID).

## Mapeamento de Extração
Este Agente consulta a tag via API GraphQL para obter instantaneamente:
1. **Contagem de Seguidores (`followers`)**: Dá um peso ao Brand Awareness local.
2. **Volumetria de Publicações (`posts_count`)**: Mostra constância ou abandono da máquina de orgânico.
3. **Conversão de Bio (`bio_has_link`)**: Avalia se o Link Externo está preenchido para capturar quem desce do feed (Funil Básico).

## Lógica de Score (0 a 100)
- Conta Oficial que tem presença sólida tira **100**.
- Abaixo de Média Base (<500 Followers), presume novato de infra - Diminui **30 pontos**.
- Contagem Pífia de Posts (Abaixo de 20 no grid Histórico) - Reduz **20 pontos** apontando "Grid Desértico".
- Falta de Link Externo de Conversão na Bio - Decrementa rigoroso de **40 pontos**.

## O que ele resolve na Venda (Dores Críticas)
Destrói a objeção "já fazemos Instagram interno com o sobrinho". Exemplo: *"Vocês possuem publicações, mas seu grid desértico de CTAs e a ausência absoluta de links diretos na Bio apontam que seu Instagram é apenas um catálogo morto - Ele não dá dinheiro a vocês"*.
