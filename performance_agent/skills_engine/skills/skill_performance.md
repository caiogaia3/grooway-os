# Skill: Performance e UX Auditor (`skill_performance.py`)

## Objetivo
Atuar como um robô que enxerga o site pela perspectiva dos motores de busca (Googlebot) e da paciência do usuário. Mede o quão rápido a plataforma reage e se cumpre o "Bê-a-bá" do SEO (Otimização On-Page).

## Dependências
- `requests` (Injetado via Orquestrador para contabilidade do LoadTime)
- `beautifulsoup4` (Busca rápida de Tags sem renderizar JS Complexo)

## Mapeamento de Extração
Este Agente mede e averigua:
1. **Time To First Byte (TTFB)** e tempo real do Load da requisição GET.
2. Presença de **Tag `<h1>`**: Primordial para o Google entender sobre o que é o site.
3. Existência de **Meta Description**: Atrativo de clique no buscador.
4. **Imagens sem atributo `alt`**: Barreiras para deficiências visuais e perda de rankeamento em pesquisa de imagens.

## Lógica de Score (0 a 100)
- O tempo do servidor é punido se ultrapassar a barreira de 2 segundos.
    - `Load > 4s`: Perde **50 pontos**.
    - `Load > 2s`: Perde **20 pontos**.
- Ausência de H1 subtrai **20 pontos**.
- Falta de Meta Description tira **10 pontos**.
- Imagens genéricas/pesadas sem Alt abatem **5 pontos** por imagem até um limite.

## O que ele resolve na Venda (Dores Críticas)
Ele alimenta a Proposta de criação de uma "Landing Page ou Site Novo" acusando que o investimento está vazando. Exemplo: *"Seu site atual carrega em 5 segundos no 4G. Segundo estatísticas da web, 60% dos cliques estão desistindo de falar com você antes do site abrir"*.
