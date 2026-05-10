# Prisma query layer for analytic views

Esta pasta contem uma camada read-only de acesso as views PostgreSQL criadas nas Etapas 6 e 7.

Ela prepara a proxima etapa de refatoracao do dashboard, mas ainda nao substitui `dashboard/service.js`, controllers, rotas ou contratos publicos da API.

## Arquivos

- `dashboard.queries.js`: consultas orientadas ao dashboard e Central do Anfitriao.
- `reports.queries.js`: consultas de relatorios financeiros, reservas, pagamentos e avaliacoes.
- `checks.queries.js`: consultas de saude e conferencia das views analiticas.
- `index.js`: export centralizado.
- `test-queries.js`: smoke test manual das queries contra o banco local/dev.

## Uso

As funcoes recebem uma instancia Prisma ja conectada e filtros opcionais:

```js
import { getHostDashboardSummaryMonthly } from "./prisma/queries/index.js";

const rows = await getHostDashboardSummaryMonthly(prisma, {
  hostId,
  monthFrom: "2026-01-01",
  monthTo: "2026-12-01",
  limit: 12,
});
```

## Seguranca

- As queries sao somente leitura.
- Entradas dinamicas usam placeholders do Prisma.
- Nao ha concatenacao de SQL com entrada do usuario.
- `$queryRawUnsafe` nao e usado nesta camada.
- Limites sao normalizados antes de serem passados ao banco.

## Smoke test

```bash
cd back-end
npm run db:queries:test
```

O teste executa uma amostra de todas as funcoes principais e falha se alguma query nao puder ser consultada.
