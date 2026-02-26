# Skill: Auditor Sênior (CMO Virtual) (`skill_senior_analyst.py`)

## Objetivo
Analisar a **Empresa Alvo** sob a ótica agressiva de Negócios e Retorno sobre Investimento (ROI). Funciona preenchendo as lacunas deixadas pelas APIs técnicas e de rastreio, indo direto para a jugular do Copywriting e Geração de Demanda.

## Dependências
- `google-genai` (API nativa Google, modelo Gemini-2.5-Flash parametrizado para viés Crítico/Avaliativo).
- Parâmetros do Formulário 360º passados para turbinar as afirmações sobre a Região (Cidade).

## Lógica e Mapeamento
O Orquestrador raspa o miolo de texto do Site principal da empresa (onde a empresa "vende" o seu próprio peixe). O Robô recebe o chapéu e persona de um Diretor de Marketing Implacável e é desafiado a achar "onde o dinheiro está vazando da conta deles".

Ele deve devolver no JSON nativo:
1. **sales_bottlenecks**: O que freia a venda imediata? Ex: Chatbot quebrado, Copy genérico, formulário bizarro longo.
2. **offer_clarity**: Ele tenta resumir a oferta da empresa de forma binária: É atrativo ou genérico ("somos líder de mercado e atuamos com qualidade")?
3. **visibility_gaps**: Pontos onde o tráfego regional foge pelas mãos com base num comércio sólido.
4. **cmo_verdict**: Uma afirmação pontiaguda desenhada EXPLICITAMENTE para ser o Ás na manga do nosso Executivo de Contas na reunião comercial.

## Lógica de Score e Regras Rígidas
- Assim como Tracking, cai numa base de *100*.
- Perde **60 pontos** violentos se ele ler a Oferta deles como Genérica ou Sem Foco.
- **Mecanismos Anti-Alucinação**: O Agente é estritamente proibido de inventar problemas que não estejam evidentes no texto raspado. Todo "bottleneck" (gargalo) detectado deve OBRIGATORIAMENTE vir acompanhado de uma evidência com **ASPAS LITERAIS** (Copy & Paste) do que foi lido no site original, garantindo 100% de factualidade para a equipe de vendas.

## O que ele resolve na Venda (Dores Críticas)
"Ganha" a negociação injetando Autoridade no consultor, que pode usar as frases curtas do Chief Marketing Officer e as provas concretas (copy textuais extraídas do site) na reunião comercial (ex: "Vocês dizem [Aspas Literais aqui], e seus clientes não entendem o que vocês realmente prometem.").
