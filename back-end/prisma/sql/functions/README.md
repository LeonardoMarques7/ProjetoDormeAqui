# SQL functions analiticas

Functions read-only para o motor analitico do Dashboard.

As functions recebem parametros e retornam linhas ja filtradas/consolidadas, reduzindo SQL bruto e composicao no back-end.

## Arquivos

- `001_fn_host_dashboard_summary_monthly.sql`
- `002_fn_host_dashboard_places.sql`
- `003_fn_host_dashboard_bookings.sql`
- `004_fn_host_dashboard_operational_snapshot.sql`
- `005_core_application_read_functions.sql`
- `006_host_analytics_payload_functions.sql`

## Aplicacao

```bash
cd back-end
npm run db:analytics:apply
```

As functions usam apenas `SELECT` no corpo e devem permanecer read-only.
