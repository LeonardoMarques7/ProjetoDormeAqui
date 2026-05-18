# Design: Contexto Local, Tags de Finalidade e Bloco "Ideal para"

Data: 2026-05-17
Projeto: DormeAqui
Status: Aguardando revisao final do usuario antes da implementacao

## Objetivo

Implementar integralmente as Stories `PDM-111`, `PDM-119` e `PDM-125`, incluindo suas subtasks, para enriquecer a estrutura das acomodacoes com contexto local, permitir classificacao por finalidade de hospedagem e usar essas informacoes tanto na pagina publica quanto na busca.

O resultado esperado e:

- anfitriao consegue cadastrar bairro, regiao, pontos de referencia e destaques locais
- anfitriao consegue marcar multiplas tags de finalidade da hospedagem
- hospede visualiza essas informacoes na pagina da acomodacao
- busca/listagem passa a filtrar acomodacoes por tags de finalidade

## Escopo aprovado

O usuario aprovou implementacao completa, cobrindo:

- persistencia no model de acomodacao
- validacao no backend
- atualizacao do wizard de criacao e edicao
- exibicao em cards e pagina de detalhes da acomodacao
- bloco visual `Ideal para`
- filtro funcional por tags na listagem/busca
- testes do fluxo novo

## Decisao principal

Os novos dados serao armazenados diretamente no registro da acomodacao, sem criar entidades separadas para tags ou regioes.

Essa decisao reduz risco e tempo de integracao porque:

- reaproveita a arquitetura atual de `place`
- evita migracao para relacionamentos adicionais
- facilita create, edit, leitura e filtros na API existente

## Modelo de dados

Adicionar ao `place` dois blocos novos:

### `localContext`

Estrutura:

```js
localContext: {
  city: String,
  neighborhood: String,
  region: String,
  referencePoints: [String],
  localHighlights: [String]
}
```

Regras:

- `city` continua coerente com a cidade principal da acomodacao
- `neighborhood` e `region` sao usados para leitura humana e descoberta local
- `referencePoints` armazena pontos de referencia curtos
- `localHighlights` armazena destaques locais curtos relevantes para a estadia

### `stayPurposeTags`

Estrutura:

```js
stayPurposeTags: [String]
```

Lista inicial canonica:

- `viagem_trabalho`
- `eventos`
- `turismo`
- `visita_familiar`
- `saude_hospital`
- `estudos_provas`
- `fim_de_semana`
- `casal`
- `familia`
- `longa_estadia`

## Fonte canonica de listas

As listas de regioes e tags devem ficar centralizadas em constantes reutilizaveis, para evitar strings duplicadas entre frontend e backend.

Constantes necessarias:

- lista inicial de regioes de Sorocaba
- lista de tags de finalidade
- mapeamento de tag para label publica
- mapeamento opcional de tag para texto curto do bloco `Ideal para`

## Backend

## Validacao

O payload de create/edit deve validar:

- `localContext.city` como string
- `localContext.neighborhood` como string obrigatoria quando `localContext` for informado
- `localContext.region` dentro da lista oficial de regioes
- `referencePoints` como lista de strings curtas
- `localHighlights` como lista de strings curtas
- `stayPurposeTags` como lista sem duplicatas contendo apenas tags oficiais

Normalizacao necessaria:

- trim em todas as strings
- remocao de itens vazios
- remocao de duplicatas
- limite de quantidade para arrays
- limite de tamanho por item para evitar payloads ruins

## Persistencia

Create e edit devem salvar os campos novos junto com o registro da acomodacao, preservando compatibilidade com dados antigos.

Regras de compatibilidade:

- acomodacoes sem `localContext` continuam validas
- acomodacoes sem `stayPurposeTags` continuam validas
- tela publica nao quebra na ausencia desses campos

## API de listagem e filtros

O endpoint de listagem/busca de acomodacoes deve aceitar filtro funcional por tags de finalidade.

Comportamento esperado:

- aceitar query param de tags
- suportar uma ou mais tags
- combinar com filtros ja existentes
- retornar apenas acomodacoes com intersecao relevante com as tags selecionadas

Decisao de matching:

- no escopo atual, a busca considera `OR` entre as tags selecionadas
- se o usuario escolher varias tags, a acomodacao entra quando possuir pelo menos uma delas

Essa escolha reduz atrito no uso inicial e evita zerar resultados com facilidade.

## Frontend

## Wizard de acomodacao

O fluxo de create/edit deve ser atualizado sem romper o wizard em andamento no projeto.

Entradas novas:

- `bairro`
- `regiao`
- `pontos de referencia`
- `destaques locais`
- selecao multipla de tags de finalidade

Distribuicao recomendada:

- contexto local entra na etapa de localizacao
- tags de finalidade entram em bloco proprio dentro da mesma experiencia de cadastro, usando chips, cards ou checkboxes visuais
- revisao final mostra um resumo desses dados antes de publicar

## Experiencia de preenchimento

Regras de UX:

- `regiao` deve usar lista controlada
- `referencePoints` e `localHighlights` devem permitir multiplos itens com interacao simples
- `stayPurposeTags` deve permitir selecao multipla com labels legiveis
- mensagens de erro precisam aparecer no proprio passo do wizard

## Pagina publica da acomodacao

Adicionar tres grupos de apresentacao:

### Contexto local resumido

Exibir bairro e regiao em ponto visivel da experiencia, sem competir com o titulo principal.

### Informacoes locais

Renderizar bloco com:

- pontos de referencia
- destaques locais

Esse bloco deve aparecer apenas quando houver dados.

### Bloco `Ideal para`

Renderizar secao dedicada com:

- titulo `Ideal para`
- badges visuais das tags
- texto curto derivado das tags, quando houver mapeamento definido

Exemplo:

- `Viagem de trabalho`
- `Eventos`
- `Fim de semana`

## Cards e listagem

Cobrir subtasks de exibicao resumida:

- card de acomodacao deve exibir bairro/regiao quando houver
- listagem deve refletir selecao de tags para o usuario entender o filtro aplicado

## Logica do bloco `Ideal para`

Cada tag pode ter:

- label publica
- frase curta de apoio opcional

Exemplos de frases:

- `viagem_trabalho`: `boa opcao para estadias produtivas e praticas`
- `eventos`: `acomodacao conveniente para compromissos e eventos na cidade`
- `familia`: `espaco pensado para estadias mais confortaveis em grupo`

Se nao houver frase customizada suficiente para todas as tags, o bloco continua valido apenas com badges.

## Responsividade

O bloco `Ideal para` e os blocos de contexto local precisam funcionar bem em mobile.

Regras:

- badges podem quebrar linha
- textos curtos nao devem gerar colunas apertadas
- espacamento deve permanecer legivel na pagina da acomodacao

## Fluxo de dados

1. Usuario preenche contexto local e tags no wizard.
2. O estado do wizard normaliza esses valores.
3. O payload e enviado ao backend junto com os campos atuais do `place`.
4. Backend valida e persiste os dados.
5. API de detalhes devolve `localContext` e `stayPurposeTags`.
6. Pagina publica usa esses campos para renderizar contexto local e `Ideal para`.
7. API de listagem usa `stayPurposeTags` para filtrar resultados quando houver query correspondente.

## Tratamento de erros

- backend deve rejeitar tags desconhecidas
- backend deve rejeitar regiao fora da lista oficial
- frontend deve impedir submit final com erros nesses campos
- itens vazios ou repetidos em listas devem ser limpos antes da persistencia
- ausencia dos campos novos em registros antigos nao deve gerar erro

## Testes

Cobertura minima esperada:

- validacao backend de `localContext` e `stayPurposeTags`
- create de acomodacao com campos novos
- edit de acomodacao com campos novos
- leitura de acomodacao com exibicao dos campos novos
- filtro de listagem por uma tag
- filtro de listagem por varias tags em modo `OR`
- renderizacao do bloco `Ideal para`
- verificacao responsiva basica da nova secao em mobile

## Criterios de aceite

- `PDM-111` implementada com persistencia, validacao e exibicao
- `PDM-119` implementada com lista oficial, selecao multipla e salvamento
- `PDM-125` implementada com componente `Ideal para`, badges e responsividade
- cards e pagina de detalhes exibem informacoes locais relevantes
- listagem/busca filtra acomodacoes por tags de finalidade
- registros legados continuam funcionando

## Riscos

- parte do fluxo de acomodacao ja esta em refatoracao local, entao sera preciso integrar sem sobrescrever mudancas existentes
- filtro por tags pode exigir ajuste no repositorio/consulta dependendo da estrutura atual da busca
- campos novos no wizard podem pressionar a distribuicao atual das etapas e exigir refinamento de UX

## Fora de escopo

Nao entra neste pacote:

- cadastro administrativo dinamico de tags
- gerenciamento dinamico de regioes por painel
- ranking semantico ou recomendacao inteligente baseada em tags
- filtro avancado com regra `AND` entre tags
