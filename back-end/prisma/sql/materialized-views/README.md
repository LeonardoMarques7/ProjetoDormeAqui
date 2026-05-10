# Materialized views analiticas

Materialized views aplicaveis para o motor analitico do Dashboard.

Esses artefatos consolidam dados derivados em estruturas de leitura. Eles nao alteram dados transacionais das tabelas de dominio.

## Arquivos

- `001_mv_host_dashboard_summary_monthly.sql`: snapshot mensal consolidado por anfitriao.
- `002_mv_host_dashboard_summary_monthly_unique_index.sql`: indice unico necessario para refresh concorrente futuro.

## Aplicacao

```bash
cd back-end
npm run db:analytics:apply
```

## Refresh

Nesta etapa o refresh e manual:

```bash
cd back-end
npm run db:analytics:refresh
```

Em etapa futura, o refresh pode virar job agendado.
