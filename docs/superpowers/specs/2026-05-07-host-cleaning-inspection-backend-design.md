# Back-end: Limpeza e Vistoria

## Objetivo

Implementar a camada de back-end da seção `Limpeza e vistoria` da Central do Anfitrião sobre a base PostgreSQL já criada na etapa anterior, entregando payload pronto para a UI e mutações operacionais com validação de acesso por `hostId`.

O objetivo do MVP é permitir que o anfitrião:

- veja rapidamente o estado operacional entre reservas;
- entenda quem é o responsável;
- saiba o prazo e o risco do próximo check-in;
- atualize status, checklist, evidências, responsáveis e observações;
- aprove ou reprove a vistoria sem lógica pesada no front-end.

## Escopo

Incluído nesta etapa:

- domínio `cleaningInspection` no back-end;
- controller, routes, service e helpers de validação;
- integração com as functions e views PostgreSQL da etapa anterior;
- mutações de status, checklist, evidência, responsável e notas;
- integração com o endpoint público `/dashboard/host/cleaning-inspection`;
- validações básicas de API e checagens mínimas de contrato.

Fora de escopo:

- alterações de UI;
- upload binário complexo;
- fila, webhooks ou notificações automáticas;
- timeline persistida como entidade própria;
- remoção de legado Mongo/Mongoose sem validação específica.

## Abordagem

Será adotado um domínio próprio `cleaningInspection`, mas mantendo o contrato público no prefixo atual do dashboard.

### Estrutura

- `back-end/domains/cleaningInspection/routes.js`
- `back-end/domains/cleaningInspection/controller.js`
- `back-end/domains/cleaningInspection/service.js`
- `back-end/domains/cleaningInspection/validators.js`
- `back-end/domains/cleaningInspection/errors.js`

### Montagem

`dashboard/routes.js` deixa de implementar diretamente a área de limpeza e vistoria e passa a montar o router do domínio operacional em `/host/cleaning-inspection`.

Isso preserva o contrato esperado pelo front-end e separa leitura agregada de dashboard da operação transacional.

## Responsabilidades

### PostgreSQL

Permanece responsável por:

- métricas;
- contagens;
- cálculo de atraso;
- cálculo de risco de próximo check-in;
- prontidão para aprovação;
- agregações por imóvel e responsável;
- leitura consolidada da tarefa.

### Back-end

Fica responsável por:

- autenticação via cookie JWT;
- validação de ownership por `hostId`;
- validação de payload;
- controle de transição de status;
- mutações pequenas com Prisma;
- formatação do payload final;
- tradução de erros para respostas HTTP claras.

### Front-end

Apenas consome:

- summary;
- filters;
- items;
- detail payload;
- mensagens de erro prontas para exibição.

## Endpoints

### GET `/dashboard/host/cleaning-inspection`

Retorna a visão geral da seção.

#### Payload

```json
{
  "cleaningInspection": {
    "summary": {
      "totalPending": 8,
      "inCleaning": 2,
      "awaitingInspection": 3,
      "approved": 12,
      "blocked": 1,
      "overdue": 2,
      "nextCheckInRisk": 3,
      "averageCleaningTime": 94.5,
      "approvalRate": 88.2,
      "missingEvidenceCount": 2
    },
    "filters": {
      "statuses": [],
      "places": [],
      "responsibles": [],
      "riskLevels": []
    },
    "items": []
  }
}
```

### GET `/dashboard/host/cleaning-inspection/:id`

Retorna o detalhe operacional completo da tarefa.

#### Payload

```json
{
  "item": {
    "id": "uuid",
    "place": {},
    "previousBooking": {},
    "nextBooking": {},
    "currentStatus": "awaiting_inspection",
    "cleaningStatus": "done",
    "inspectionStatus": "awaiting_inspection",
    "responsible": {},
    "checklistByArea": [],
    "evidence": {},
    "timeline": [],
    "approvalBlockers": [],
    "notes": "Texto"
  }
}
```

### PATCH `/dashboard/host/cleaning-inspection/:id/status`

Atualiza o status operacional.

#### Payload de entrada

```json
{
  "status": "approved",
  "reason": "Vistoria concluída sem pendências."
}
```

### PATCH `/dashboard/host/cleaning-inspection/:id/checklist`

Atualiza um item de checklist de limpeza ou vistoria.

#### Payload de entrada

```json
{
  "scope": "inspection",
  "itemId": "uuid",
  "status": "done",
  "notes": "Banheiro conferido."
}
```

### POST `/dashboard/host/cleaning-inspection/:id/evidence`

Registra evidência por URL/path.

#### Payload de entrada

```json
{
  "type": "after",
  "url": "https://cdn.exemplo.com/foto.jpg",
  "description": "Sala finalizada",
  "area": "common_area",
  "checklistItemId": "uuid",
  "scope": "cleaning"
}
```

### PATCH `/dashboard/host/cleaning-inspection/:id/assignee`

Define ou remove responsável.

#### Payload de entrada

```json
{
  "role": "inspection",
  "userId": "uuid"
}
```

### PATCH `/dashboard/host/cleaning-inspection/:id/notes`

Atualiza observações operacionais.

#### Payload de entrada

```json
{
  "notes": "Falta confirmar reposição de enxoval."
}
```

## Modelo de resposta

### Summary

Os campos públicos do `summary` serão:

- `totalPending`
- `inCleaning`
- `awaitingInspection`
- `approved`
- `blocked`
- `overdue`
- `nextCheckInRisk`
- `averageCleaningTime`
- `approvalRate`
- `missingEvidenceCount`

O back-end pode manter campos auxiliares adicionais para compatibilidade interna, mas a resposta pública deve incluir esses nomes.

### Filters

`filters` passa a ser um objeto com:

- `statuses`
- `places`
- `responsibles`
- `riskLevels`

`statuses` virá de configuração fixa alinhada aos status operacionais.
`places` e `responsibles` serão derivados do payload já retornado pelas functions SQL, sem nova agregação pesada fora do banco.

### Items

Cada item público deve incluir:

- `id`
- `place`
- `previousBooking`
- `nextBooking`
- `currentStatus`
- `currentStatusLabel`
- `cleaningStatus`
- `inspectionStatus`
- `responsible`
- `dueDate`
- `lastCheckoutAt`
- `nextCheckInAt`
- `isOverdue`
- `isNextCheckInRisk`
- `checklistProgress`
- `evidenceProgress`
- `notes`
- `createdAt`
- `updatedAt`

## Regra de acesso

Todo endpoint exige autenticação.

Toda leitura ou mutação deve validar que:

- a tarefa existe;
- a tarefa pertence ao `hostId` autenticado;
- qualquer item de checklist ou evidência referenciado também pertence à mesma tarefa.

Se a tarefa não existir, retorna `404`.
Se existir mas pertencer a outro host, retorna `403`.

## Regras de transição

Transições permitidas:

- `awaiting_cleaning` -> `cleaning_in_progress`
- `cleaning_in_progress` -> `awaiting_inspection`
- `awaiting_inspection` -> `approved`
- `awaiting_inspection` -> `rejected`
- `rejected` -> `cleaning_in_progress`
- qualquer status operacional -> `blocked`

### Efeitos esperados

- `cleaning_in_progress` define `cleaningStartedAt` quando ausente.
- `awaiting_inspection` define `cleaningCompletedAt`, `cleaningStatus = DONE`, `inspectionStatus = AWAITING_INSPECTION`.
- `approved` define `inspectionCompletedAt`, `inspectionStatus = APPROVED`, `overallStatus = APPROVED`.
- `rejected` exige `reason`, define `inspectionCompletedAt`, `inspectionStatus = REJECTED`, `overallStatus = REJECTED` e registra motivo em `notes`.
- retorno de `rejected` para `cleaning_in_progress` reabre o fluxo operacional.
- `blocked` exige `reason` e define `overallStatus = BLOCKED`.

### Bloqueios de aprovação

`approved` só é permitido quando:

- limpeza está concluída;
- vistoria está na etapa correta;
- checklist obrigatório está completo;
- evidência mínima foi atendida quando exigida;
- não existem pendências críticas apontadas pela visão consolidada SQL.

O back-end não recalcula essas regras manualmente. Ele consulta a leitura consolidada da tarefa e só valida os flags já produzidos pelo banco.

## Checklist

Atualizações de checklist suportam:

- `pending`
- `done`
- `failed`
- `not_applicable`

Regras:

- `failed` e `not_applicable` podem exigir observação conforme política simples do endpoint;
- a autoria operacional registrada é sempre o usuário autenticado;
- `completedAt` e `completedByUserId` são preenchidos ao marcar `done` ou `failed`;
- ao voltar para `pending`, os campos de conclusão podem ser limpos.

## Evidências

O endpoint de evidência recebe URL/path já resolvido.

Regras:

- não implementa upload binário nesta etapa;
- aceita `type`, `url`, `description`, `area`, `scope` e `checklistItemId`;
- valida se `checklistItemId` pertence à tarefa e ao escopo informado;
- registra `uploadedByUserId` como o usuário autenticado.

## Responsáveis

O endpoint de assignee permite:

- definir responsável de limpeza;
- definir responsável de vistoria;
- remover responsável;
- trocar responsável.

Regras:

- `role` aceito: `cleaning` ou `inspection`;
- `userId = null` remove o responsável;
- o back-end valida se o usuário informado existe antes de vincular.

## Observações e timeline

### Observações

`notes` representa o resumo operacional editável da tarefa.

### Timeline

Não será criada tabela própria nesta etapa.

A timeline básica será derivada de timestamps já existentes:

- criação da tarefa;
- início da limpeza;
- conclusão da limpeza;
- conclusão da vistoria;
- última atualização;
- última evidência, quando houver.

## Validação e erros

Erros esperados:

- `400` payload inválido
- `403` tarefa de outro host
- `404` tarefa não encontrada
- `409` transição inválida
- `409` aprovação bloqueada por checklist incompleto
- `409` aprovação bloqueada por ausência de evidência
- `409` aprovação bloqueada por pendência crítica

Formato mínimo:

```json
{
  "error": "Aprovacao bloqueada por checklist obrigatorio incompleto.",
  "code": "CHECKLIST_INCOMPLETE"
}
```

## Integração com a base SQL

### Regras que permanecem no banco

- status efetivo;
- overdue;
- próximo check-in em risco;
- contagens de checklist;
- contagens de evidência;
- prontidão para aprovação;
- métricas de summary;
- agregação por responsável;
- recorrência por imóvel.

### Regras que ficam no back-end

- autenticação;
- ownership por host;
- transição de status permitida;
- exigência de motivo em `rejected` e `blocked`;
- validação de payload;
- mapeamento do payload final para a UI;
- persistência de updates pontuais.

## Testes e validações

Validações mínimas previstas:

- checagem de sintaxe dos arquivos Node alterados;
- teste básico das queries/funções já expostas via Prisma;
- teste de serviço cobrindo:
  - leitura geral;
  - leitura de detalhe;
  - bloqueio de acesso por host;
  - transição inválida;
  - aprovação bloqueada;
  - atualização de checklist;
  - inclusão de evidência;
  - atualização de responsável;
  - atualização de notas.

Se o projeto não tiver harness de API já consolidado para essa área, a validação mínima pode ficar em testes de serviço e smoke checks de queries.

## Riscos conhecidos

- o endpoint atual de dashboard já expõe limpeza e vistoria; será preciso evitar rota duplicada durante a migração para o router dedicado;
- existem campos legados textuais de responsável na tabela e eles precisam conviver com os novos FKs sem gerar inconsistência;
- não há upload binário nesta etapa, então a UI deve enviar URL/path já resolvido;
- como a timeline será derivada e não persistida, ela é suficiente para MVP mas não para auditoria completa.

## Critério de conclusão desta etapa

Esta etapa estará pronta quando:

- os endpoints públicos estiverem ativos sob `/dashboard/host/cleaning-inspection`;
- a visão geral alimentar a UI sem mocks;
- o detalhe da tarefa trouxer checklist agrupado, evidências, timeline e bloqueios;
- as mutações de status, checklist, evidência, responsável e notas funcionarem com validação de ownership;
- a aprovação de vistoria respeitar os flags calculados no PostgreSQL;
- não houver cálculo pesado operacional em loops extensos de JavaScript.
