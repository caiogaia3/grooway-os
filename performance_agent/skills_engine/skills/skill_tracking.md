# Skill: Engenheiro de Dados & Tracking (`skill_tracking.py`)

## Objetivo
Atuar como um auditor técnico focado na conversão de tráfego. Ele varre silenciosamente a estrutura DOM (Document Object Model) da página web do alvo em busca de scripts de rastreamento nativos e ferramentas fundamentais usadas no Marketing Digital.

## Dependências
- `requests` (Via orquestrador original para baixar o HTML)
- `beautifulsoup4` (Para parseamento rápido da árvore DOM)
- Expressões Regulares (`re`) padrão do Python.

## Mapeamento de Extração
Este Agente identifica:
1. **Google Tag Manager (`GTM-XXXX`)**: A base para gestão de tags avançada.
2. **Meta / Facebook Pixel**: Vital para remarketing inteligente em campanhas no Instagram e FB.
3. **Google Analytics (`UA-XXXX` ou `G-XXXX`)**: A base analítica do tráfego.

## Lógica de Score (0 a 100)
- Começa com **100**.
- Perde **50 pontos** imediatamente se o Google Tag Manager não existir. Isso indica amadorismo na infraestrutura digital.
- Perde **30 pontos** se não tiver Meta Pixel instalado.
- Perde **20 pontos** se não possuir nem o Google Analytics.

## O que ele resolve na Venda (Dores Críticas)
As "Critical Pains" geradas por essa Skill alimentam a proposta comercial (via Gemini) instruindo que o "cliente está cego". Exemplo: *"Vocês investem esforço e dinheiro em marketing, mas como não há rastreamento (Pixel), vocês não conseguem perseguir os visitantes que saíram do site."*
