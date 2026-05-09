# Views PostgreSQL

Views simples da Etapa 6 para consultas analiticas do DormeAqui.

Essas views sao uma camada de leitura para dashboards e relatorios futuros. Elas nao substituem services atuais e nao alteram dados.

## Como aplicar

Execute os arquivos individualmente em ordem, ou use uma ferramenta de migracao futura para versionar a aplicacao dessas definicoes.

```bash
psql "$DATABASE_URL" -f back-end/prisma/sql/views/001_v_host_monthly_revenue.sql
```

## Views

- `v_host_monthly_revenue`: receita mensal por anfitriao.
- `v_place_monthly_revenue`: receita mensal por acomodacao.
- `v_place_occupancy_monthly`: ocupacao mensal por acomodacao.
- `v_host_booking_status_monthly`: reservas por status, anfitriao e mes.
- `v_host_payment_status_monthly`: pagamentos por status, anfitriao e mes.
- `v_place_review_summary`: resumo de avaliacoes por acomodacao.
- `v_cleaning_inspection_task_health`: saude operacional de cada tarefa de limpeza/vistoria.
- `v_host_cleaning_inspection_metrics`: metricas agregadas da operacao de limpeza/vistoria por anfitriao.
- `v_host_financial_summary_monthly`: lancamentos financeiros por anfitriao e mes.
- `v_host_dashboard_summary_monthly`: resumo mensal consolidado para dashboard futuro.

## Convencoes

- Meses usam `date_trunc('month', ...)::date`.
- Receita de reservas considera status operacionais: `CONFIRMED`, `IN_PROGRESS`, `EVALUATION`, `REVIEW`, `COMPLETED`.
- Receita liquida de pagamentos considera pagamentos `APPROVED` menos `amount_refunded`.
- Ocupacao considera noites de reservas operacionais dentro do mes.
