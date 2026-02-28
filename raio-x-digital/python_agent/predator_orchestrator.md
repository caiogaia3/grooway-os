# Sistema: Predator Orchestrator (O "Maestro" do Motor)

## Objetivo
Gerenciar o ciclo de vida da inteligência, desde a captura do alvo até a consolidação final. É o componente que garante a ordem e a segurança dos dados.

## Fluxo de Trabalho (Workflow)
1. **Engajamento do Alvo:** Faz a requisição HTTP única para evitar bloqueios e extrai o HTML base.
2. **Setup de Skills:** Inicializa cada agente injetando as credenciais (API Keys) e o HTML.
3. **Execução Sequencial:** Roda os agentes de diagnóstico (Tracking, GMB, Keywords, etc.) respeitando um delay de segurança para evitar limites de taxa (Rate Limit) das APIs de IA.
4. **Contextualização:** Garante que agentes de alto nível (Boss e Fechador) recebam o dicionário completo de resultados dos antecessores.
5. **Output de Guerra:** Consolida tudo no arquivo `predator_report.json` que alimenta a interface.

## Regras de Orquestração
- **Sequência Obrigatória:** Diagnósticos Técnicos -> Senior Analyst (Boss) -> Value Proposition (Fechador).
- **Tratamento de Erros:** Se um agente falha (ex: Apify fora do ar), o maestro deve marcar a falha e seguir para o próximo sem derrubar todo o motor.
- **Isolamento:** Cada skill tem seu próprio contexto, evitando que uma suje os dados da outra.

## O que ele resolve no Projeto
Permite escalar a aplicação. Se amanhã você quiser adicionar um agente de "Auditoria de Segurança" ou "Análise de Preços", basta criá-lo e registrar uma linha no `main.py`.
