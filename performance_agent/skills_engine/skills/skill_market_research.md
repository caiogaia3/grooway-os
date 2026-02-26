# Skill: Inteligência de Mercado & Dossiê (`skill_market_research.py`)

## Objetivo
Analisar o contexto semântico do site e cruzar essas informações com a inteligência do Google Gemini. Funciona como a "Memória Estratégica" do software, transformando o "O QUE a empresa faz" em "COMO vamos vender para ela".

## Dependências
- `google-genai` (SDK oficial do Google AI 2.0)
- `python-dotenv` (Para mascaramento de Chaves de API locais)
- `beautifulsoup4` (Limpeza da Tag `<script>` antes de jogar o Lexicon para o LLM não confundir código com copy de vendas)

## Lógica e Mapeamento
1. O robô limpa e comprime todo o texto visível da Home.
2. Aciona o `compass/google-maps` via **Apify** para realizar buscas reais ativas de concorrentes na cidade especificada.
3. Passa a montanha de texto do site + os resultados (snippets) do Google pelo Modelo `Gemini-2.5-Flash`.
4. Força o Gemini a extrair Market Intelligence no formato JSON Estrito, com **Regras Anti-Alucinação Drásticas**:
    - **niche** & **target_icp**: Oficial lido no site.
    - **dores_segmento** & **objecoes**: Derivados lógicamente do que foi lido x o que o mercado (Google) pesquisa.
    - **competitor_benchmarks**: Relata concorrentes reais encontrados na busca.
    - **evidences**: Citação de ASPAS EXATAS ("") do texto do site e citação literal do resultado do Google, garantindo fundamentação incontestável.
    - **deep_research_markdown**: Um super dossiê McKinsey de 7 seções fundindo o macro ao micro-regional.

## Lógica de Score
- Não se aplica a esta Skill (Massa semântica). Em vez disso, gera blocos de instrução que preparam o Analista Humano. Se a chave do Gemini falhar ou se o site barrar os bots Scrapers tradicionais, ele notifica Erro de LLM.

## O que ele resolve na Venda (Dores Críticas)
"Pula" a etapa do SDR humano pesquisar sobre o negócio no Google e tentar inventar orelhada do porquê fechar contrato com eles.
