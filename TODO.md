# TODO: Corrigir exibição de dados no ReservationModal

## Problema

O `ReservationModal` recebe o mesmo objeto de evento do calendário nas props `booking` e `place`, mas os campos usam nomes diferentes (`placeTitle`, `placeCity`, etc.). Além disso, o backend não envia a foto do imóvel nos eventos do calendário.

## Plano de correção

1. [x] **`back-end/domains/dashboard/service.js`**: Incluir `placePhoto` (primeira foto do imóvel) nos eventos `checkin`, `checkout` e `stay`.
2. [x] **`front-end/src/components/dashboard/ReservationModal.jsx`**: Usar os campos do `booking` como fallback para os dados do lugar (`placeTitle`, `placeCity`, `placePhoto`, `placeCheckin`, `placeCheckout`) e remover `console.log`.
3. [x] **`front-end/src/components/dashboard/CalendarGridMonth.jsx`**: Construir um objeto `place` semântico a partir dos campos do evento ao invés de passar o objeto bruto duas vezes.
4. [x] Testar o fluxo de clique no evento do calendário e verificar se o modal exibe corretamente os dados.
