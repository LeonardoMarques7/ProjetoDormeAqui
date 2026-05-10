# Materialized views futuras

Esta pasta documenta materialized views candidatas para uma etapa futura.

Na Etapa 6, nenhuma materialized view deve ser criada ou aplicada. O uso de materialized views exige decisoes adicionais sobre:

- frequencia de refresh;
- refresh concorrente;
- indices unicos necessarios;
- impacto em escrita e deploy;
- jobs de manutencao;
- estrategia de invalidacao por periodo/anfitriao.

O arquivo `001_mv_host_dashboard_summary_monthly.sql` permanece como proposta comentada.
