# Design: Nova Acomodação e Edição de Acomodação

Data: 2026-05-09
Projeto: DormeAqui
Status: Aprovado em brainstorming, aguardando revisão final do usuário antes da implementação

## Objetivo

Reformular o fluxo de criação e edição de acomodação para:

- separar corretamente as rotas de `new` e `edit`
- elevar a qualidade visual e de UX do wizard
- expandir a modelagem de localização para endereço completo
- integrar mapa real do Google Maps na etapa de localização
- manter compatibilidade com acomodações antigas

## Resultado esperado

O fluxo de anfitrião para cadastrar e editar acomodações deve parecer um produto maduro, limpo e confiável, com um shell visual único e consistente em todas as etapas.

## Decisão principal

Será usado um `wizard único reutilizável` para criação e edição, com o mesmo layout-base em todas as etapas.

O shell visual terá:

- coluna esquerda com timeline vertical numerada
- resumo de contexto da etapa atual
- bloco visual contextual por etapa
- coluna direita com formulário principal dentro de card branco

Esse padrão será aplicado tanto em `new` quanto em `edit`, alterando apenas:

- modo da tela
- título e CTA principal
- carregamento de dados
- ação final de persistência

## Rotas

### Front-end

Separar conceitualmente criação e edição:

- criação: `/places/new`
- edição: `/places/edit/:id`

Se o projeto mantiver o agrupamento atual dentro de `/account`, a estrutura equivalente deve ser:

- criação: `/account/places/new`
- edição: `/account/places/edit/:id`

Regra obrigatória:

- `new` nunca carrega acomodação existente
- `edit/:id` sempre carrega a acomodação pelo ID
- qualquer link legado apontando para `/new/:id` deve ser migrado para `/edit/:id`

### Comportamento por modo

#### Create

- formulário inicia vazio
- CTA principal usa texto de criação
- não dispara busca por ID
- usa rascunho local apenas em criação

#### Edit

- exibe loading inicial
- busca a acomodação pelo ID
- popula o wizard com os dados existentes
- CTA principal usa texto de atualização
- exibe erro amigável se a acomodação não existir

## Arquitetura proposta

### Shell visual

Criar um shell reutilizável para todas as etapas:

- `AccommodationWizardLayout`

Responsabilidades:

- renderizar grade de 2 colunas no desktop
- empilhar conteúdo no mobile
- desenhar timeline vertical numerada na coluna esquerda
- receber dados de contexto da etapa atual
- renderizar o card principal do formulário na direita

### Timeline

Criar uma timeline numerada persistente:

- `AccommodationWizardTimeline`

Comportamento:

- mostra etapas 1 a 6
- destaca a etapa atual
- mostra etapas concluídas, atual e futuras
- usa número dentro do marcador
- exibe nome da etapa por tooltip ou rótulo adjacente

### Bloco contextual esquerdo

Criar um bloco visual contextual:

- `AccommodationStepContextPanel`

Esse bloco muda de conteúdo por etapa, mas mantém a mesma moldura visual.

### Etapa 1: Informações básicas

- título da etapa
- descrição curta
- resumo do tipo de acomodação
- mini resumo de capacidade

### Etapa 2: Localização

- título da etapa
- texto auxiliar sobre endereço completo
- mapa real do Google Maps
- fallback visual quando não houver coordenadas

### Etapa 3: Fotos

- preview das fotos enviadas
- estado vazio visual elegante quando não houver fotos

### Etapa 4: Comodidades

- resumo visual em chips ou lista curta

### Etapa 5: Preço e regras

- resumo de diária, check-in e check-out

### Etapa 6: Revisão

- checklist final
- preview resumido da acomodação

### Formulário principal

Criar ou refatorar para um formulário central reutilizável:

- `AccommodationFormWizard`

Deve manter a lógica do wizard atual, mas com reorganização visual e estrutural.

## Etapas do wizard

O fluxo final terá 6 etapas:

1. Informações básicas
2. Localização
3. Fotos
4. Comodidades
5. Preço e regras
6. Revisão final

## Direção visual

Inspirado estritamente na composição aprovada pelo usuário:

- coluna esquerda leve e espaçada
- headline grande
- bloco visual abaixo do texto
- painel direito com fundo claro texturizado
- card branco central
- inputs limpos, altos e discretos
- bordas arredondadas suaves
- cards menores sob o formulário

Regras:

- manter minimalismo
- reduzir ruído visual
- evitar excesso de cards e indicadores simultâneos
- preservar o mesmo shell entre etapas, trocando só o contexto

## Localização

### Campos suportados

Adicionar suporte a:

- `address_street`
- `address_number`
- `address_complement`
- `address_neighborhood`
- `address_city`
- `address_state`
- `address_zip_code`
- `address_country`
- `latitude`
- `longitude`
- `location_reference`
- `location_description`

Também deve haver compatibilidade com:

- `city`
- `state` legado, se existir ou vier a existir na camada de compatibilidade
- `address` legado já usado hoje

### Regra de compatibilidade

Na leitura:

- se `address_city` não existir, usar `city`
- se `address_state` não existir, usar valor legado equivalente
- se não houver coordenadas, o mapa entra em fallback

Na escrita:

- persistir os novos campos
- manter preenchimento de `city` com base em `address_city` para compatibilidade operacional e buscas existentes, enquanto o sistema ainda depender dele

### Etapa de localização

Campos mínimos visíveis:

- CEP
- Rua
- Número
- Complemento
- Bairro
- Cidade
- Estado
- País
- Ponto de referência
- Descrição da localização
- Latitude
- Longitude

Observação aprovada:

- `complemento` pode ser reforçado também no texto/resumo da localização quando fizer sentido

### Mapa

Criar um componente isolado:

- `AccommodationLocationMap`

Requisitos:

- usar Google Maps real
- permitir navegação e inspeção visual
- usar `latitude` e `longitude` quando disponíveis
- aceitar marcador do ponto da acomodação
- exibir estado vazio elegante quando faltarem coordenadas
- não quebrar criação nem edição se o mapa não tiver dados suficientes
- ficar restrito ao fluxo do anfitrião

## Privacidade e LGPD

O texto auxiliar da etapa de localização deve ser revisado com base em boas práticas de LGPD no Brasil.

Diretrizes:

- o formulário do anfitrião pode coletar o endereço completo
- a camada de UI não define sozinha a visibilidade pública do endereço
- a exibição pública depende das regras de negócio e permissões do back-end
- os textos devem evitar promessa ambígua sobre exposição do endereço
- o sistema deve orientar que dados completos são tratados conforme política de visibilidade e privacidade

Observação:

- durante a implementação, consultar a skill indicada pelo usuário para calibrar a redação e evitar mensagens inadequadas para contexto brasileiro

## Persistência

### Back-end

Validar e, se necessário, expandir:

- rotas de `places`
- schema de entrada
- normalização de payload
- service/repository
- serialização de resposta

O create e update devem aceitar os novos campos de localização.

### Banco

Se o schema Prisma ainda não tiver os campos, adicionar colunas opcionais para migração segura.

Diretriz:

- novos campos entram opcionais
- registros antigos continuam válidos
- migração deve ser gradual

### Front-end

Criar função central para normalizar payload:

- `normalizeAccommodationPayload`

Ela deve:

- traduzir estado do wizard para payload de API
- preencher `city` legado a partir de `address_city`
- normalizar `latitude` e `longitude`
- evitar duplicidade de regras entre create e edit

### Reuso entre new e edit

Criar um hook ou controlador de fluxo:

- `useAccommodationForm`

Responsabilidades:

- detectar modo `create` ou `edit`
- carregar dados quando necessário
- aplicar valores iniciais
- salvar criação ou atualização
- expor loading, erro e sucesso

## Validação

Mensagens em PT-BR.

Obrigatórios:

- CEP
- Rua
- Número
- Bairro
- Cidade
- Estado
- País

Opcionais inicialmente:

- Complemento
- Ponto de referência
- Descrição da localização
- Latitude
- Longitude

Regras:

- não endurecer edição de acomodações antigas a ponto de travar o fluxo
- validação de legado precisa ser compatível com dados parciais existentes

## UX

Requisitos de experiência:

- deixar claro quando é criação e quando é edição
- manter o mesmo padrão visual nas duas telas
- usar loading elegante na edição
- exibir feedback de sucesso ao salvar
- exibir erro amigável de não encontrado
- preservar navegação previsível entre etapas
- usar mobile stack sem perder o contexto da etapa

## Arquivos e áreas a revisar na implementação

Mapeamento inicial identificado:

- rotas principais: [front-end/src/App.jsx](C:/Users/leona/Desktop/ProjetoDormeAqui/front-end/src/App.jsx:111)
- fluxo de conta/lugares: [front-end/src/components/places/AccPlaces.jsx](C:/Users/leona/Desktop/ProjetoDormeAqui/front-end/src/components/places/AccPlaces.jsx:20)
- wizard atual: [front-end/src/components/places/NewPlace.jsx](C:/Users/leona/Desktop/ProjetoDormeAqui/front-end/src/components/places/NewPlace.jsx:35)
- etapa inicial atual: [front-end/src/components/places/steps/Step1Space.jsx](C:/Users/leona/Desktop/ProjetoDormeAqui/front-end/src/components/places/steps/Step1Space.jsx:24)
- reducer do wizard: [front-end/src/components/places/wizard/placeReducer.js](C:/Users/leona/Desktop/ProjetoDormeAqui/front-end/src/components/places/wizard/placeReducer.js:5)
- config das etapas: [front-end/src/components/places/wizard/stepConfig.js](C:/Users/leona/Desktop/ProjetoDormeAqui/front-end/src/components/places/wizard/stepConfig.js:10)
- rotas da API: [back-end/domains/places/routes.js](C:/Users/leona/Desktop/ProjetoDormeAqui/back-end/domains/places/routes.js:18)
- persistência Prisma: [back-end/prisma/repositories/places.repository.js](C:/Users/leona/Desktop/ProjetoDormeAqui/back-end/prisma/repositories/places.repository.js:108)
- shape de resposta: [back-end/prisma/repositories/helpers.js](C:/Users/leona/Desktop/ProjetoDormeAqui/back-end/prisma/repositories/helpers.js:62)
- modelo do banco: [back-end/prisma/schema.prisma](C:/Users/leona/Desktop/ProjetoDormeAqui/back-end/prisma/schema.prisma:225)

## Estratégia de implementação

Implementar em ordem:

1. separar rotas `new` e `edit`
2. isolar modo create/edit no front
3. expandir schema de localização e compatibilidade
4. criar shell visual único do wizard
5. refatorar etapas para usar o novo shell
6. integrar mapa real na etapa de localização
7. ajustar links, redirects e mensagens
8. validar criação, edição e legado

## Riscos

- worktree já contém mudanças em `places` e `schema`, então a implementação deve evitar sobrescrever trabalho existente
- integração com Google Maps pode depender de chave/configuração já existente ou precisar de fallback controlado
- alterações de schema exigem atenção para não quebrar buscas atuais baseadas em `city`

## Critérios de aceite

- criação usa apenas rota `new`
- edição usa apenas rota `edit/:id`
- links antigos para `/new/:id` deixam de existir
- create abre vazio
- edit carrega dados existentes
- shell visual único é aplicado em todas as etapas de `new` e `edit`
- timeline vertical numerada aparece no lado esquerdo
- bloco contextual esquerdo muda por etapa
- localização suporta endereço completo
- mapa real do Google Maps aparece na etapa de localização
- registros antigos continuam funcionais
- labels, mensagens e CTAs ficam em PT-BR
