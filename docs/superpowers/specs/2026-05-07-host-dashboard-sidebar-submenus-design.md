# Dashboard do Anfitriao: sidebar com submenus por categoria

## Objetivo

Adicionar submenus fixos dentro da sidebar da dashboard do anfitriao para reduzir o tempo ate a informacao ou acao desejada. A navegacao deve equilibrar acesso rapido a tarefas e leitura rapida de indicadores, sem transformar a sidebar em uma arvore confusa.

## Escopo

Esta entrega cobre:

- criacao de submenus fixos para todas as categorias atuais da sidebar
- navegacao por categoria principal e por subitem
- comportamento de expansao da categoria ativa
- navegacao por ancora dentro da mesma tela da secao
- adaptacao da experiencia para desktop e mobile
- ocultacao de subitens cujo bloco ainda nao exista na interface

Esta entrega nao cobre:

- mudanca do modelo para subviews internas por submenu
- reestruturacao completa da arquitetura da dashboard
- criacao de novos blocos de conteudo apenas para preencher a navegacao

## Problema atual

A sidebar atual leva o anfitriao apenas ao nivel macro de cada categoria. Em secoes longas, isso exige scroll manual e memorizacao visual para encontrar a informacao ou acao desejada. O custo de navegacao aumenta principalmente em:

- Financeiro
- Acomodacoes
- Relatorios
- Agenda
- Historico

## Abordagem escolhida

Foi escolhida a abordagem `submenu fixo por categoria`, com navegacao por ancora na mesma tela.

### Motivo

Esse modelo preserva a leitura continua da secao, evita trocas excessivas de contexto e torna a navegação previsivel. Tambem permite evolucao futura para submenus dinamicos sem refazer a base.

## Estrutura proposta

### Visao geral

- Resumo do dia
- Atencao
- Proximas movimentacoes
- Atalhos

### Agenda

- Calendario
- Check-ins
- Check-outs
- Permanencias

### Reservas

- Todas
- Pendentes
- Em andamento
- Finalizadas
- Canceladas

### Acomodacoes

- Todas as acomodacoes
- Desempenho
- Ocupacao
- Alertas
- Detalhes do imovel

### Pre-check-in

- Pendencias
- Em analise
- Aprovados
- Regras da casa
- Documentos

### Limpeza e vistoria

- Pendencias
- Em limpeza
- Aguardando vistoria
- Aprovados para entrada
- Bloqueados

### Financeiro

- Resumo
- Lancar despesa
- Lucro e rentabilidade
- Pagamentos e reembolsos
- Resultado por acomodacao

### Manutencao e danos

- Ocorrencias abertas
- Prioridade alta
- Custos estimados
- Historico
- Anexos

### Relatorios

- Financeiro
- Ocupacao
- Reservas por status
- Desempenho por acomodacao
- Exportacoes

### Historico

- Movimentos recentes
- Pagamentos
- Reservas
- Avaliacoes
- Acomodacoes

## Comportamento de navegacao

- clicar na categoria principal leva ao topo da secao correspondente
- clicar em um submenu leva a um bloco interno da mesma secao
- apenas a categoria ativa permanece expandida por padrao
- no mobile, os submenus aparecem dentro do drawer/menu lateral existente
- se o bloco nao existir na interface, o submenu nao deve ser renderizado
- se o bloco existir, mas estiver vazio, o submenu continua visivel

## UX da sidebar

- categoria ativa com destaque visual claro
- subitens com recuo leve, tipografia menor e bom contraste
- subitem ativo com marcador simples e discreto
- expansao previsivel, sem animacoes pesadas
- navegacao curta o suficiente para manter leitura rapida

## Estrategia tecnica

### Frontend

Criar uma configuracao declarativa de navegacao com:

- categoria principal
- id da secao
- lista de subitens
- ancora alvo de cada subitem
- condicao opcional de disponibilidade

Cada bloco navegavel da dashboard deve expor um `id` estavel para scroll e foco.

### Renderizacao

- a sidebar desktop renderiza categorias e submenus
- a navegacao mobile reutiliza a mesma configuracao
- o estado da categoria expandida deve seguir a secao ativa

### Scroll e foco

- usar scroll suave ao navegar para ancora
- manter a secao principal ativa ao navegar por subitem
- opcionalmente atualizar o estado visual do submenu ativo conforme a ancora clicada

## Dependencias com a UI atual

Para que o submenu funcione, alguns paines e blocos precisarao receber identificadores estaveis. Isso inclui, no minimo:

- secoes principais da dashboard
- cards e paineis financeiros
- rankings de acomodacao
- blocos de relatorios
- blocos do historico operacional

## Tratamento de estados ausentes

- submenu nao aparece se o bloco nao existir
- submenu aparece normalmente se o bloco existe mas os dados estao vazios
- estados vazios continuam usando mensagens amigaveis ao anfitriao

## Testes

### Navegacao

- clicar em categoria abre a secao correta
- clicar em submenu faz scroll para o bloco correto
- categoria ativa expande corretamente
- mobile preserva a mesma estrutura de navegacao

### UX

- submenu nao polui a sidebar com linhas demais
- nomes permanecem curtos e operacionais
- anfitriao chega a informacoes frequentes em ate 2 cliques

### Regressao

- navegação atual por categoria continua funcionando
- sidebar nao quebra em telas menores
- blocos sem ancora nao recebem submenu indevido

## Sequencia de implementacao

1. Criar modelo declarativo de categorias e submenus.
2. Mapear blocos existentes para ids/ancoras.
3. Atualizar sidebar desktop para expandir submenus.
4. Atualizar navegacao mobile com a mesma estrutura.
5. Adicionar scroll por ancora.
6. Revisar nomes, estados ativos e comportamento responsivo.

## Resultado esperado

Ao final, o anfitriao conseguira:

- entrar na categoria certa
- pular direto para o bloco desejado
- alternar entre leitura e acao sem se perder na tela
- usar a mesma logica de navegacao em desktop e mobile
