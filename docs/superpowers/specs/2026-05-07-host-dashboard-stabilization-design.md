# Dashboard do Anfitriao: estabilizacao, linguagem e filtros

## Objetivo

Corrigir os problemas funcionais da dashboard do anfitriao antes de reorganizar sua apresentacao visual. O foco desta rodada e eliminar erros de carregamento, remover linguagem tecnica exposta ao usuario final, traduzir estados operacionais para portugues claro e melhorar a experiencia de filtros e leitura de desempenho por acomodacao.

## Escopo

Esta entrega cobre:

- correcao do Historico operacional que hoje falha com a mensagem "Nao foi possivel carregar o historico agora."
- eliminacao do erro "Cannot read properties of undefined (reading 'findMany')" no fluxo da dashboard
- remocao de termos tecnicos de backend, PostgreSQL, views e mensagens internas da interface do anfitriao
- traducao e normalizacao de status e rotulos operacionais expostos na dashboard
- reorganizacao do bloco "Desempenho por acomodacao" para uma leitura escalavel com muitas acomodacoes
- substituicao de campos quebrados de filtros e lancamentos por componentes `shadcn`

Esta entrega nao cobre:

- remodelagem total da dashboard
- novas capacidades operacionais ainda nao suportadas pelos dados existentes
- reestruturacao completa do contrato da API fora do dominio da dashboard do anfitriao

## Problemas atuais

### 1. Historico operacional quebrado

O componente de logbook falha no carregamento e cai num erro generico. A causa mais provavel e uma combinacao de contrato inconsistente entre frontend e backend, dependencia em dados opcionais sem blindagem suficiente e possivel falha em dominios Prisma nao disponiveis em algumas instalacoes.

### 2. Linguagem tecnica vazando para o usuario

O payload da dashboard contem textos como referencias a PostgreSQL, views, backend e estados de migracao. Esses textos aparecem em helpers e mensagens de indisponibilidade, o que e inadequado para anfitrioes.

### 3. Visualizacao de desempenho pouco escalavel

O bloco de desempenho por acomodacao repete colunas e perde legibilidade conforme o numero de imoveis cresce. A leitura desejada e comparar rapidamente receita, ocupacao, nota e alertas entre acomodacoes.

### 4. Status internos expostos

Valores como `CONFIRMED`, `IN_PROGRESS` e similares aparecem ao usuario em diferentes partes da dashboard.

### 5. Erro de runtime no meio da dashboard

O erro `Cannot read properties of undefined (reading 'findMany')` indica acesso a modelo Prisma inexistente ou cliente parcialmente carregado. A dashboard precisa degradar com seguranca quando um dominio ainda nao estiver disponivel.

### 6. Filtros inconsistentes

O painel de lancamentos financeiros usa controles nativos e entradas de mes/data com experiencia inconsistente. O pedido e usar `shadcn Select` e calendario `shadcn`, incluindo intervalo de datas onde fizer sentido.

## Abordagem escolhida

Foi escolhida a abordagem `backend-first com blindagem no frontend`.

### Motivo

Corrigir apenas o frontend esconderia os sintomas, mas deixaria a API produzindo payloads inadequados. Corrigir apenas o backend nao resolveria UX quebrada nem filtros inconsistentes. A combinacao resolve a origem e protege a interface.

## Arquitetura da solucao

### Backend

O adapter PostgreSQL da dashboard passara a produzir um payload orientado ao anfitriao:

- helpers tecnicos serao removidos ou substituidos por descricoes operacionais
- mensagens de indisponibilidade deixarao de mencionar PostgreSQL, views ou migracao
- status de reservas e operacao serao normalizados em labels amigaveis
- blocos opcionais passarao a retornar arrays vazios ou estruturas seguras em vez de depender de acesso direto a modelos nao garantidos

O logbook e os dominios auxiliares usados pela dashboard serao protegidos com fallback seguro quando tabelas ou modelos nao estiverem disponiveis, evitando quebrar toda a tela.

### Frontend

O frontend deixara de renderizar qualquer texto tecnico vindo cru da API. Ele aplicara uma camada final de saneamento visual:

- ocultar helpers internos quando nao agregarem valor operacional
- traduzir status e formatos residuais
- mostrar mensagens amigaveis de indisponibilidade
- tratar valores ausentes sem quebrar componentes

## Design de interface

### Historico operacional

O Historico operacional continuara como tabela/lista, mas com:

- carregamento resiliente
- mensagem amigavel em caso de falha
- filtros consistentes por periodo, pessoa, acontecimento e acomodacao
- datas com selecao por intervalo em calendario

### Desempenho por acomodacao

O bloco sera reorganizado como ranking/lista comparativa:

- cada acomodacao aparece em uma linha ou cartao compacto
- ordenacao principal por receita do periodo
- cada item mostra nome, cidade, receita, ocupacao, nota media e estado operacional
- barras ou indicadores visuais ajudam a comparar rapidamente
- a composicao deve escalar para muitas acomodacoes sem repetir colunas tecnicas

### Lancamentos financeiros

Os filtros e formulario vao migrar para componentes consistentes com a dashboard:

- `shadcn Select` para acomodacao, categoria e status
- calendario `shadcn` para datas
- selecao mensal amigavel para competencia
- remocao da exposicao direta de campos tecnicos ao anfitriao quando nao forem essenciais

## Contrato de dados

### Principios

- a API deve devolver labels operacionais em portugues sempre que o dado for voltado ao anfitriao
- valores tecnicos podem existir internamente, mas nao devem ser usados como texto de interface
- estruturas opcionais devem ser sempre seguras para iteracao no frontend

### Ajustes previstos

- substituir helpers tecnicos por textos operacionais
- garantir listas vazias em vez de `undefined`
- mapear status internos para labels amigaveis
- normalizar estruturas de resumo, filtros e colecoes da dashboard

## Tratamento de erros

- qualquer dominio opcional ausente deve falhar localmente, nao derrubar a dashboard inteira
- o logbook deve mostrar erro amigavel e manter estrutura vazia
- componentes do frontend nao devem assumir `findMany`, arrays ou campos aninhados sem checagem
- mensagens ao anfitriao devem descrever o efeito do problema, nunca a tecnologia interna

## Testes

### Backend

- validar geracao do payload da dashboard sem textos tecnicos expostos
- validar cenarios com dominios ausentes ou vazios
- validar traducao de status e montagem de blocos operacionais

### Frontend

- validar renderizacao da dashboard com payload parcial
- validar logbook com erro e com sucesso
- validar filtros `shadcn` de acomodacao, competencia e intervalo de datas
- validar lista de desempenho com varias acomodacoes

### Verificacao manual

- abrir a dashboard do anfitriao
- confirmar que o Historico operacional carrega ou falha de forma amigavel
- confirmar ausencia de termos como PostgreSQL, backend, view, migracao
- confirmar traducao de status em toda a interface
- confirmar leitura clara do desempenho por acomodacao com muitas entradas

## Sequencia de implementacao

1. Corrigir backend da dashboard e logbook para retornar payload seguro e linguagem de anfitriao.
2. Corrigir o erro de runtime relacionado a acesso Prisma indefinido.
3. Blindar o frontend contra campos ausentes e textos tecnicos residuais.
4. Reorganizar "Desempenho por acomodacao" como ranking comparativo escalavel.
5. Migrar filtros e seletores para componentes `shadcn`.
6. Validar os fluxos principais e ajustar mensagens finais.

## Riscos e mitigacoes

### Risco: dominio Prisma opcional ainda nao existir em alguns ambientes

Mitigacao: encapsular acessos e retornar fallback seguro por secao.

### Risco: o frontend depender de chaves antigas do payload

Mitigacao: manter compatibilidade estrutural onde possivel e adicionar adaptadores locais.

### Risco: alteracoes visuais quebrarem leitura em mobile

Mitigacao: preferir lista/cartoes responsivos em vez de tabela larga no bloco de desempenho.

## Resultado esperado

Ao final desta rodada, a dashboard do anfitriao deve:

- carregar sem o erro de `findMany`
- exibir o Historico operacional com resiliencia
- parar de mostrar linguagem tecnica ao usuario final
- traduzir estados internos para portugues claro
- oferecer leitura melhor de desempenho por acomodacao
- usar filtros consistentes com `shadcn` para selecao e periodo
