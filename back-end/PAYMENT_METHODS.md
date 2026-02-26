# Métodos de Pagamento — DormeAqui

## Métodos suportados

| Método              | Endpoint Backend          | Fluxo                       | Status inicial |
|---------------------|---------------------------|-----------------------------|----------------|
| Crédito à vista     | `POST /payments/transparent` | Auth → Capture via webhook | `authorized`   |
| Crédito parcelado   | `POST /payments/transparent` | Auth → Capture via webhook | `authorized`   |
| Débito              | `POST /payments/transparent` | Captura imediata           | `approved`     |
| Pix                 | `POST /payments/pix`       | Pending → Aprovado via webhook | `pending`  |

---

## Fluxo Cartão (Crédito e Débito)

```
Usuário preenche form → MP SDK gera token → POST /payments/transparent
  ├── Crédito: MP retorna status=authorized (capture:false, dois passos)
  │     └── Webhook payment.updated → PUT /v1/payments/:id {capture:true} → approved → cria booking
  └── Débito:  MP retorna status=approved (capture:true, imediato)
        └── Webhook payment.created → status=approved → cria booking
```

### Detecção automática de débito
O campo `payment_method_id` retornado pelo MP SDK contém `_debit` para cartões de débito (ex: `master_debit`, `visa_debit`). O backend detecta isso e define `capture: true` + `installments: 1`.

---

## Fluxo Pix

```
Usuário seleciona Pix → POST /payments/pix
  └── MP retorna qr_code + qr_code_base64 (status=pending)
        ├── Frontend exibe QR Code + copia-e-cola
        ├── Frontend faz polling GET /payments/pix/status/:paymentId a cada 5s
        └── Quando pago: Webhook payment.updated → status=approved → cria booking
```

### Como habilitar Pix no Mercado Pago
1. Acesse [dashboard.mercadopago.com.br](https://www.mercadopago.com.br/settings/account/credentials)
2. Certifique-se de que a conta está verificada (CPF/CNPJ)
3. Pix é habilitado automaticamente em contas produção verificadas
4. Em sandbox, use a [conta de teste MP](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/additional-content/your-integrations/test) com `payment_method_id: pix`

---

## Parcelamento (Crédito)

- O MP SDK preenche automaticamente as opções de parcelamento no `<select id="form-checkout__installments">` com base no valor da transação e no cartão detectado
- O backend recebe `installments` no payload e encaminha ao MP
- Para débito, `installments` é forçado para `1`

---

## Testes Sandbox

### Cartões de teste (Mercado Pago)
| Método        | Número              | Status esperado |
|---------------|---------------------|-----------------|
| Visa Crédito  | 4235 6477 2802 5682 | `approved`      |
| Master Crédito| 5031 4332 1540 6351 | `approved`      |
| Visa Débito   | 4013 5406 8274 6260 | `approved`      |
| Recusado      | 4000 0000 0000 0002 | `rejected`      |

- CVV: qualquer 3 dígitos
- Validade: qualquer data futura
- CPF: 12345678909

### Pix (sandbox)
- Crie um pagamento Pix e use o painel do comprador de teste para aprovar
- Ou use o endpoint `GET /payments/pix/status/:paymentId` para simular

---

## Dependências novas

| Pacote  | Ambiente | Uso                              |
|---------|----------|----------------------------------|
| `qrcode`| backend  | Geração de QR Code PNG server-side|

Instale no backend:
```bash
npm install qrcode
```

---

## Variáveis de ambiente necessárias

```env
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
MERCADO_PAGO_WEBHOOK_URL=https://seu-backend.com/api/webhook/mercadopago
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-...   # frontend
```
