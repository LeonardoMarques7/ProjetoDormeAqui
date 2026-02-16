# Migração para Mercado Pago Bricks (Checkout Bricks)

Este repositório contém um guia e implementações auxiliares para migrar do Checkout Transparente antigo do Mercado Pago para o novo fluxo baseado em Bricks (Payment Brick, Pix Brick e Boleto Brick).

Resumo da migração

- Frontend: componentes React que usam Mercado Pago SDK v2 (Bricks).
- Backend: endpoints para criar pagamentos e tratar webhooks usando o SDK oficial `mercadopago`.
- Mantém a lógica de reservas existente: apenas associa payment_id à reserva e atualiza status via webhook.

Novas dependências (adicionar ao package.json)

- Backend:
  - mercadopago
- Frontend:
  - axios (se já não estiver)
  - @mercadopago/sdk-js (opcional — o exemplo usa o script oficial via CDN)

Variáveis de ambiente essenciais

- FRONTEND:
  - REACT_APP_MERCADO_PAGO_PUBLIC_KEY (public key para inicializar Bricks)
- BACKEND:
  - MERCADO_PAGO_ACCESS_TOKEN (ACCESS_TOKEN para chamadas com privilégio)
  - MERCADO_PAGO_WEBHOOK_PATH (rota onde o webhook será exposto, ex: /api/webhook/mercadopago)

Arquivos adicionados

Frontend (em front-end/src/components/):
- MercadoPagoProvider.jsx
- PaymentBrick.jsx
- PixBrick.jsx
- BoletoBrick.jsx

Backend (em back-end/):
- mercadopagoClient.js
- createPayment.js
- webhookMercadoPago.js

Instalação e configuração rápida

1. Instale dependências no backend:

```bash
cd back-end
npm install mercadopago
```

2. Instale dependências no frontend (se necessário):

```bash
cd front-end
npm install axios
# opcional: npm install @mercadopago/sdk-js
```

3. Configure variáveis de ambiente (exemplo `.env` no backend):

```
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
FRONTEND_URL=http://localhost:3000
MERCADO_PAGO_WEBHOOK_PATH=/api/webhook/mercadopago
```

4. No frontend, configure a chave pública (REACT_APP_MERCADO_PAGO_PUBLIC_KEY) no ambiente ou provider.

Passo a passo da migração

1. Manter a lógica de reserva existente: não alterar coleções, modelos ou endpoints de reserva. Apenas associe o payment_id retornado pelo Mercado Pago à reserva.
2. Substituir componentes do Checkout Transparente por componentes Bricks listados acima.
3. No frontend, inicialize o SDK Bricks com a PUBLIC_KEY (via provider) e monte o Brick correspondente à forma de pagamento.
4. No callback onSubmit do Brick, enviar ao backend os dados necessários (token, payment_method_id, issuer_id, installments, payer/email, reservationId, amount).
5. No backend, criar o pagamento via API Mercado Pago usando o ACCESS_TOKEN e persistir payment_id na reserva.
6. Expor um webhook para receber notificações de pagamento e atualizar o status da reserva automaticamente.

Guia rápido dos componentes

- MercadoPagoProvider.jsx
  - Carrega o script oficial `https://sdk.mercadopago.com/js/v2` e inicializa `new MercadoPago(PUBLIC_KEY, { locale: 'pt-BR' })`.
  - Fornece a instância via React Context.

- PaymentBrick.jsx
  - Cria o Payment (Card) Brick, passa amount e callbacks:
    - onReady
    - onSubmit -> envia token/parcelamento/etc para backend (`POST /api/payments/create`)
    - onError

- PixBrick.jsx
  - Cria o Pix Brick para gerar QR Code / copia-e-cola. onSubmit pede o backend para criar o pagamento PIX.

- BoletoBrick.jsx
  - Cria o Boleto (ticket) Brick; onSubmit pede ao backend a criação do pagamento boleto.

Backend: criação de pagamento (createPayment.js)

- Recebe token/infos do frontend, chama `mercadopago.payment.create(...)` e retorna o objeto de pagamento.
- Deve persistir `payment.id` (payment_id) na reserva (ex.: campo paymentId) sem alterar a lógica de negócio da reserva.

Backend: webhook (webhookMercadoPago.js)

- Endpoint configurado em `MERCADO_PAGO_WEBHOOK_PATH` para receber notificações.
- Ao receber evento de pagamento, busca o pagamento via SDK (`mercadopago.payment.get(id)`) e atualiza a reserva relacionada (usa metadata.reservationId ou descrição).

Boas práticas e segurança

- Nunca armazene dados completos de cartão no servidor; use o token gerado pelo Brick.
- Use HTTPS em produção.
- Separe chaves de sandbox (teste) e produção; use variáveis de ambiente.
- Teste em sandbox antes de migrar produção completamente.

Teste em Sandbox

- Use as credenciais de teste do Mercado Pago (APP_USR-... ou TEST-... onde aplicável).
- Ao criar pagamentos de teste, confirme o fluxo de webhook (use ngrok ou similar para desenvolvimento local) e valide que as reservas são atualizadas.

Exemplos e integração

- Os exemplos dos componentes e backend incluídos são pontos de partida e adotam a interface mínima necessária para integrar com a lógica de reservas existente.
- Ajuste as funções de persistência (`savePaymentToReservation`, `updateReservationStatus`) para o serviço de reservas do projeto.

Fluxo final esperado

1. Usuário inicia reserva e seleciona forma de pagamento.
2. Frontend monta o Brick correspondente e o usuário completa os dados.
3. onSubmit envia dados ao backend para criar o pagamento (ACCESS_TOKEN).
4. Backend cria pagamento e retorna payment_id; associa este payment_id à reserva.
5. Mercado Pago notifica via webhook mudanças de status (pagamento aprovado/cancelado).
6. Webhook atualiza reserva conforme status recebido.

Notas finais

- Este README descreve a migração e fornece arquivos de exemplo; adapte rotas e persistência de acordo com o domínio de reservas do projeto.

---

