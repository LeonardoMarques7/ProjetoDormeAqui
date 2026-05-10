# Reports SQL

Queries analiticas para dashboards, Central do Anfitriao, relatorios financeiros e operacionais.

Esses arquivos sao consultas de referencia para uso manual e futura integracao no back-end. Nenhum arquivo altera dados.

## Parametros sugeridos

Quando forem integradas ao back-end, as queries podem receber filtros como:

- `host_id`
- `place_id`
- `date_from`
- `date_to`
- `booking_status`
- `payment_status`

Nesta etapa, os SQLs ficam genericos para facilitar conferencia manual.

## Arquivos

- `001_host_monthly_revenue.sql`: receita mensal por anfitriao.
- `002_place_monthly_revenue.sql`: receita mensal por acomodacao.
- `003_booking_status_summary.sql`: resumo de reservas por status.
- `004_payment_status_summary.sql`: resumo de pagamentos por status.
- `005_review_summary.sql`: avaliacoes por acomodacao e anfitriao.
- `006_financial_entries_summary.sql`: lancamentos financeiros por tipo e status.
- `007_host_operational_summary.sql`: resumo operacional por anfitriao.
