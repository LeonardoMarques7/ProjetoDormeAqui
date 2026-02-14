# Checkout Transparente Mercado Pago

## Instalação

### Backend

1. Instale a dependência Mercado Pago (caso não exista):
   ```bash
   npm install mercadopago
   ```
2. Adicione as variáveis de ambiente no `.env`:
   ```
   MERCADO_PAGO_ACCESS_TOKEN=SEU_TOKEN
   MERCADO_PAGO_WEBHOOK_URL=https://suaapi.com/api/webhook/mercadopago
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```

3. Importe e use as rotas do checkout transparente:
   ```js
   import transparentRoutes from './domains/payments/transparentRoutes.js';
   app.use('/api/payments', transparentRoutes);
   ```

### Frontend

1. Instale a dependência axios (caso não exista):
   ```bash
   npm install axios
   ```
2. Adicione o componente `TransparentCheckoutForm.jsx` onde desejar exibir o checkout.

## Guia de Uso

- O componente `TransparentCheckoutForm` recebe os dados da reserva (`bookingData`) e callbacks para sucesso/erro.
- O backend expõe o endpoint `POST /api/payments/transparent` para processar pagamentos com cartão.
- Para produção, utilize o MercadoPago.js no frontend para gerar o token do cartão e envie para o backend.

## Configuração de Sandbox e Produção

- Use tokens de teste do Mercado Pago para ambiente sandbox.
- Para produção, gere o token do cartão no frontend usando MercadoPago.js e envie para o backend.
- Nunca envie dados sensíveis de cartão diretamente ao backend em produção.

## Novas Dependências

- **Backend:** `mercadopago`
- **Frontend:** `axios` (já utilizado)
- **Frontend:** `qrcode` (para gerar QR Codes no cliente)

---

## PIX (Checkout Transparente)

Foi adicionada a opção de pagamento via PIX usando a API do Mercado Pago.

- Endpoint backend: `POST /api/payments/pix` (autenticado) — cria pagamento PIX e retorna qr_code e qr_code_base64 quando disponível.
- Verificação de status: `GET /api/payments/status/:paymentId` (autenticado) — retorna status (approved, pending, rejected, etc.).

Como ativar e testar:

1. Ative o PIX na sua conta Mercado Pago e gere as credenciais necessárias.
2. Use o token de teste `TEST-...` para sandbox ou `APP_USR-...` em produção no `.env` (MERCADO_PAGO_ACCESS_TOKEN).
3. Configure `MERCADO_PAGO_WEBHOOK_URL` para receber notificações e atualizar status automaticamente.
4. Para testes manuais, chame `POST /api/payments/pix` enviando:
   ```json
   {
     "accommodationId": "<id>",
     "checkIn": "YYYY-MM-DD",
     "checkOut": "YYYY-MM-DD",
     "guests": 2,
     "email": "cliente@example.com"
   }
   ```

Resposta esperada (success):

```json
{
  "success": true,
  "message": "Pagamento PIX criado com sucesso.",
  "paymentId": "123456789",
  "status": "pending",
  "qr_code": "000201...",
  "qr_code_base64": "<base64_png>"
}
```

Notas de segurança:
- Não armazene dados sensíveis de cartões no servidor sem tokenização pelo MercadoPago.js.
- Utilize webhooks para atualizar o status real do pagamento e confirmar reservas.

---

