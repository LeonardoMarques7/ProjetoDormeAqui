# Indexes

O `schema.prisma` ja contem os indices iniciais necessarios para a Etapa 1.

Indices ja modelados:

- `users.status`
- `places.owner_id`
- `places.city`
- `places.status`
- `places.price_per_night`
- `place_photos.place_id, sort_order`
- `place_perks.perk_id`
- `bookings.guest_id`
- `bookings.place_id`
- `bookings.status`
- `bookings.check_in, check_out`
- `bookings.place_id, check_in, check_out`
- `reviews.place_id, created_at`
- `reviews.user_id`
- `reviews.rating`
- `payments.booking_id`
- `payments.user_id`
- `payments.provider, status`
- `payments.created_at`
- `payment_events.payment_id, received_at`
- `financial_entries.booking_id`
- `financial_entries.payment_id`
- `financial_entries.user_id`
- `financial_entries.place_id`
- `financial_entries.type, status`
- `financial_entries.created_at`

## Candidatos futuros

Adicionar somente quando houver queries reais ou planos de execucao que justifiquem:

- Indice trigram para busca textual em `places.title`, `places.city` e `places.description`.
- Indice parcial para reservas ativas por imovel, alinhado com a constraint de sobreposicao.
- Indice parcial para pagamentos pendentes ou em processamento.
- Indices compostos para dashboards do anfitriao por `owner_id`, periodo e status.

Esses indices devem ser criados em migrations especificas, junto com analise de cardinalidade e `EXPLAIN`.
