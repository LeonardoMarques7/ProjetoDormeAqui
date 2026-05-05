# Guia de Testes do DormeAqui

Esta pasta centraliza os testes novos e os comandos para repetir a validacao do projeto.

## Preparacao

Na raiz do projeto:

```bash
npm install
npm install --prefix back-end
npm install --prefix front-end --legacy-peer-deps
```

O `--legacy-peer-deps` no front-end e necessario enquanto `@mui/lab@9.0.0-beta.2` declara peer dependency de `@mui/material@^9`, mas o projeto usa MUI 7.

## Comandos principais

Rodar todos os testes adicionados nesta pasta:

```bash
npm test
```

Rodar apenas testes de back-end desta pasta:

```bash
npm run test:backend
```

Rodar apenas testes de front-end desta pasta:

```bash
npm run test:frontend
```

Rodar os testes antigos que ja existiam em `back-end/*.test.js`:

```bash
npm run test:backend:existing
```

Rodar build do front-end:

```bash
npm run build --prefix front-end
```

Auditar dependencias de producao:

```bash
npm audit --omit=dev --prefix back-end
npm audit --omit=dev --prefix front-end
```

## Estrutura

- `tests/backend`: testes unitarios e de integracao leve do back-end.
- `tests/frontend`: testes unitarios e de componentes React.

## Tipos de teste recomendados

- Unitarios: funcoes puras, validadores, transicoes de estado, helpers de seguranca.
- Integracao leve: middleware, webhooks, controllers com dependencias mockadas.
- Componentes: renderizacao, estados visuais e interacoes simples.
- E2E: fluxos completos com navegador. Ainda nao foi adicionado runner E2E para evitar custo e instabilidade sem ambiente de staging.

## Quando rodar

- Antes de alterar autenticacao, pagamentos, reservas ou uploads: `npm test`.
- Antes de publicar front-end: `npm run test:frontend` e `npm run build --prefix front-end`.
- Antes de publicar back-end: `npm run test:backend`, `npm run test:backend:existing` e `npm audit --omit=dev --prefix back-end`.

