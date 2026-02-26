# Fluxo de Status de Pagamento — DormeAqui

## Estados possíveis (`paymentStatus`)

| Status     | Cor (badge) | Descrição                                        |
|------------|-------------|--------------------------------------------------|
| `pending`  | Amarelo     | Pagamento criado, aguardando confirmação         |
| `approved` | Verde       | Pagamento aprovado, reserva confirmada           |
| `rejected` | Vermelho    | Pagamento recusado pelo Mercado Pago             |
| `canceled` | Cinza       | Reserva cancelada pelo usuário, estorno iniciado |

## Transições permitidas

```
pending  ──► approved   (webhook MP: payment.updated / status=approved)
pending  ──► rejected   (webhook MP: status=rejected/cancelled)
approved ──► canceled   (usuário solicita via POST /bookings/:id/cancel)
canceled ──► (terminal) webhook MP: status=refunded/charged_back confirma
```

## Como o webhook do Mercado Pago sincroniza o status

O endpoint `POST /api/webhook/mercadopago` recebe notificações do MP e aplica o mapeamento:

| Status MP          | Status interno |
|--------------------|----------------|
| `approved`         | `approved`     |
| `pending`          | `pending`      |
| `in_process`       | `pending`      |
| `in_mediation`     | `pending`      |
| `rejected`         | `rejected`     |
| `cancelled`        | `rejected`     |
| `refunded`         | `canceled`     |
| `charged_back`     | `canceled`     |

Se uma reserva já existir para o `paymentId`, apenas o `paymentStatus` é atualizado.

## Endpoint de cancelamento

```
POST /api/bookings/:id/cancel
Authorization: Cookie (JWT)
```

**Regras:**
- Somente o dono da reserva pode cancelar.
- Só reservas com `paymentStatus === "approved"` podem ser canceladas.
- O backend chama `POST /v1/payments/:paymentId/refunds` no Mercado Pago antes de atualizar o status.
- Se o estorno falhar, retorna `502` e o status **não** é alterado.

**Resposta de sucesso:**
```json
{
  "message": "Reserva cancelada e estorno solicitado com sucesso.",
  "booking": { ... }
}
```

## Fluxo de captura (pagamentos `authorized`)

Quando um pagamento chega no webhook com status `authorized`:
1. O webhook tenta capturar via `PUT /v1/payments/:id` com `{ capture: true }`.
2. Se a captura for bem-sucedida, o status final é `approved` e a reserva é criada.
3. Se falhar, retorna `200` ao MP (sem criar reserva) para evitar reenvio.

## Componentes frontend

| Componente           | Localização                                      | Descrição                          |
|----------------------|--------------------------------------------------|------------------------------------|
| `BookingStatusBadge` | `components/bookings/BookingStatusBadge.jsx`     | Badge colorido por status          |
| `CancelButton`       | `components/bookings/CancelButton.jsx`           | Botão com confirmação de 2 passos  |
| `bookingService.js`  | `services/bookingService.js`                     | `cancelBooking(bookingId)`         |
