# Checks de conferencia

Queries de auditoria tecnica para validar a saude dos dados migrados para PostgreSQL.

Esses arquivos devem ser executados manualmente apos migracoes, cargas de dados ou ajustes de limpeza. Todas as consultas sao somente leitura.

## Arquivos

- `001_counts.sql`: contagens gerais e rastreabilidade de IDs legados.
- `002_foreign_keys_health.sql`: procura orfaos logicos em relacionamentos principais.
- `003_financial_integrity.sql`: confere pagamentos, valores reembolsados e lancamentos financeiros.
- `004_booking_integrity.sql`: valida datas, valores, capacidade e sobreposicoes de reservas.
- `005_synthetic_and_placeholder_audit.sql`: audita dados sinteticos, placeholders e lacunas de migracao.

## Interpretacao

As queries de saude retornam linhas que exigem investigacao. Em geral, resultado vazio ou contagem zero indica que nao ha problema naquele criterio.
