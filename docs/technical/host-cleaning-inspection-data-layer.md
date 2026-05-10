# Limpeza e Vistoria: camada de dados

## Objetivo

Dar suporte ao MVP operacional da Central do Anfitrião para responder, com dados reais:

- quais imóveis precisam ser limpos;
- quais estão em limpeza;
- quais aguardam vistoria;
- quais foram aprovados;
- quais estão bloqueados, reprovados ou atrasados;
- quais colocam o próximo check-in em risco.

## Estrutura principal

### Tarefa operacional

Tabela base: `cleaning_inspections`

Responsabilidades:

- vincular anfitrião, imóvel e reservas anterior/próxima;
- registrar responsáveis de limpeza e vistoria;
- armazenar prazo, status, timestamps operacionais e observações;
- indicar exigência mínima de evidência.

### Checklist

Tabelas:

- `cleaning_checklist_items`
- `inspection_checklist_items`

Cada item pode registrar:

- ambiente;
- item e descrição;
- obrigatoriedade;
- status;
- observação;
- usuário que concluiu;
- data de conclusão.

### Evidências

Tabela: `cleaning_inspection_photos`

Pode registrar:

- tipo da evidência;
- url;
- descrição;
- ambiente;
- autor do upload;
- vínculo opcional com item de checklist de limpeza ou vistoria.

## Camada SQL

### Views

- `v_cleaning_inspection_task_health`
  Consolida status efetivo, checklist, evidências, prontidão para aprovação e risco do próximo check-in.

- `v_host_cleaning_inspection_metrics`
  Agrega métricas operacionais por anfitrião.

### Functions

- `fn_host_cleaning_inspection_tasks`
  Lista tarefas prontas para consumo pelo backend/dashboard, com JSON de checklist, reservas e evidências.

- `fn_host_cleaning_inspection_metrics`
  Retorna as métricas principais da área por anfitrião.

- `fn_host_cleaning_inspection_problem_places`
  Resume problemas recorrentes por imóvel.

- `fn_host_cleaning_inspection_responsibles`
  Resume distribuição de tarefas e risco por responsável.

## Métricas disponíveis

- total de tarefas pendentes;
- tarefas em limpeza;
- tarefas aguardando vistoria;
- tarefas aprovadas;
- tarefas bloqueadas;
- tarefas reprovadas;
- tarefas atrasadas;
- tarefas com próximo check-in em risco;
- média de tempo de limpeza;
- taxa de aprovação na vistoria;
- tarefas com checklist obrigatório incompleto;
- quantidade total de itens obrigatórios incompletos;
- tarefas sem evidência;
- recorrência de problemas por imóvel;
- distribuição de tarefas por responsável.

## Regra de risco

Uma tarefa entra em risco quando existe próximo check-in próximo e ao menos uma destas condições é verdadeira:

- tarefa não está aprovada;
- vistoria não está aprovada;
- checklist obrigatório está incompleto;
- evidência mínima exigida não foi atendida;
- prazo está vencido ou muito próximo.

## Observações

- A camada foi desenhada para centralizar o peso analítico no PostgreSQL.
- O backend deve apenas chamar as functions e organizar o payload final.
- A UI não deve recalcular essas métricas no cliente.
