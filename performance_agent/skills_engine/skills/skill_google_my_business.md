# Skill: Auditoria Google Meu Negócio / Local SEO (`skill_google_my_business.py`)

## Objetivo
Analisar a **Empresa Alvo** focando puramente no posicionamento local (Google Maps e Ficha do Google Meu Negócio). O objetivo é avaliar a FICHA REAL DA EMPRESA e não alucinar.

## Dependências
- `google-genai` (Modelo Gemini-2.5-flash) - Temperatura travada em 0.1 para forçar análise matemática sem criatividade.
- `apify-client` (Ator `compass/google-maps` para extrair os dados reais do estabelecimento).

## Lógica e Mapeamento
1. A skill recebe o Nome e a Cidade extraídos do Frontend.
2. Faz uma busca real na Apify.
3. Se achar a ficha, passa os dados literais (Nota, Quantidade de Reviews, Reivindicação, Categorias e Comentários Recentes) para a IA.
4. A IA lê e apenas julga O QUE LHE FOI DADO (sem inventar dores).

## Lógica de Score
- Começa em 100.
- Perde 30 pontos direto no código se a nota for ruim e haver reviews.
- Perde 20 pontos direto se tiver reviews quase nulas (<5)
- Perde 40 pontos violentos direto se a API acusar que a ficha não foi reivindicada (`isClaimed: false`), pois isso é falha crítica.
- Perde pontos finos dependendo da análise complementar do modelo.

## O que ele resolve na Venda
Mostra dados reais pro cliente. "Olha, a API bateu no google agora e você tem 4 avaliações e a ficha nem é sua oficialmente. Isso é perda de dinheiro."
