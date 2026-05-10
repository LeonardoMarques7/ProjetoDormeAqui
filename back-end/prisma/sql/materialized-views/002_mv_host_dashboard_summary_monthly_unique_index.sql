-- Indice para consultas por anfitriao/mes e refresh concorrente futuro.

CREATE UNIQUE INDEX IF NOT EXISTS mv_host_dashboard_summary_monthly_host_month_idx
  ON mv_host_dashboard_summary_monthly (host_id, summary_month);
