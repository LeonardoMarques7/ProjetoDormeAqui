# Configuração do Mercado Pago - DormeAqui

Este guia explica como configurar e testar o sistema de pagamentos Mercado Pago Checkout Pro.

## 📋 Pré-requisitos

- Conta no [Mercado Pago](https://www.mercadopago.com.br)
- Acesso ao [Dashboard de Desenvolvedor](https://www.mercadopago.com.br/developers)
- Backend deployado (Render) com HTTPS
- Frontend deployado ou rodando localmente

## 🔧 Configuração do Ambiente

### 1. Credenciais de Teste

No seu `.env` do backend:

```env
# Mercado Pago - Ambiente de TESTE
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADO_PAGO_WEBHOOK_URL=https://projetodormeaqui.onrender.com/api/webhook/mercadopago

# Frontend URL
FRONTEND_URL=https://projetodormeaqui.onrender.com
```

### 2. Como Obter o Access Token

1. Acesse: https://www.mercadopago.com.br/developers
2. Faça login com sua conta Mercado Pago
3. Vá em **"Suas integrações"** → **"Criar aplicação"**
4. Dê um nome (ex: "DormeAqui Test")
5. Selecione **"Checkout Pro"**
6. Copie o **Access Token de TESTE** (começa com `TEST-`)

### 3. Configurar Webhook no Mercado Pago

1. No Dashboard, vá em **"Webhooks"**
2. Adicione uma nova URL de notificação:
   - **URL**: `https://projetodormeaqui.onrender.com/api/webhook/mercadopago`
   - **Eventos**: Selecione `payment` (pagamentos)
3. Salve e ative

### 4. Testar Webhook

Faça uma requisição GET para verificar se o webhook está ativo:

```bash
curl https://projetodormeaqui.onrender.com/api/webhook/mercadopago
```

Resposta esperada:

```json
{
	"status": "Webhook ativo",
	"timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🧪 Testando Pagamentos

### Cartões de Teste

Use estes cartões para simular diferentes cenários:

#### ✅ Pagamento Aprovado

- **Número**: `5031 4332 1540 6351`
- **CVV**: `123`
- **Data**: Qualquer data futura
- **Nome**: `APRO` (para aprovar automaticamente)

#### ❌ Pagamento Recusado

- **Número**: `5031 4332 1540 6351`
- **CVV**: `123`
- **Data**: Qualquer data futura
- **Nome**: `OTHE` (para recusar)

#### ⏳ Pagamento Pendente

- **Número**: `5031 4332 1540 6351`
- **CVV**: `123`
- **Data**: Qualquer data futura
- **Nome**: `CONT` (para pendente)

### Outros Métodos de Teste

#### Pix

- Selecione Pix no checkout
- O QR Code será gerado automaticamente
- No ambiente de teste, o pagamento é simulado

#### Boleto

- Selecione Boleto
- O boleto será gerado
- No teste, você pode simular o pagamento via API

## 🔄 Fluxo de Teste Completo

### 1. Criar Preferência

```bash
curl -X POST https://projetodormeaqui.onrender.com/api/payments/create \
  -H "Content-Type: application/json" \
  -H "Cookie: dev_auth_token=SEU_TOKEN_JWT" \
  -d '{
    "accommodationId": "ID_DA_ACOMODACAO",
    "checkIn": "2024-02-01T00:00:00.000Z",
    "checkOut": "2024-02-05T00:00:00.000Z",
    "guests": 2
  }'
```

### 2. Verificar Redirecionamento

A resposta deve conter:

```json
{
	"success": true,
	"data": {
		"initPoint": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
		"sandboxInitPoint": "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
		"bookingDetails": {
			"totalPrice": 1200,
			"nights": 4,
			"pricePerNight": 300
		}
	}
}
```

### 3. Simular Pagamento

1. Acesse o `initPoint` retornado
2. Complete o checkout com cartão de teste
3. Você será redirecionado para:
   - `/payment/success` - Pagamento aprovado
   - `/payment/pending` - Pagamento pendente
   - `/payment/failure` - Pagamento recusado

### 4. Verificar Webhook

Após o pagamento, verifique os logs do backend:

```bash
# No Render Dashboard, vá em "Logs"
# Procure por:
# - "Webhook recebido"
# - "Processando pagamento"
# - "Reserva criada com sucesso"
```

## 🔍 Verificação de Idempotência

O sistema evita duplicidade de reservas. Para testar:

1. Faça um pagamento
2. Verifique se a reserva foi criada no banco
3. Tente processar o mesmo pagamento novamente (simulando webhook duplicado)
4. O sistema deve retornar: "Reserva já existe para o pagamento X"

## 📊 Monitoramento

### Logs Importantes

Procure por estas mensagens nos logs:

```
✅ Sucesso:
- "Preferência de pagamento criada com sucesso"
- "Webhook recebido: {payment_data}"
- "Reserva criada com sucesso: {booking_id}"

⚠️ Atenção:
- "Reserva já existe para o pagamento {id}"
- "Pagamento rejeitado. Reserva não será criada."

❌ Erro:
- "Erro ao criar preferência Mercado Pago"
- "Erro ao processar webhook"
```

## 🚀 Deploy para Produção

### 1. Mudar para Credenciais de Produção

```env
# .env de produção
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADO_PAGO_WEBHOOK_URL=https://projetodormeaqui.onrender.com/api/webhook/mercadopago
FRONTEND_URL=https://projetodormeaqui.onrender.com
NODE_ENV=production
```

### 2. Atualizar Webhook

1. No Dashboard Mercado Pago, desative o webhook de teste
2. Crie um novo webhook com a mesma URL (agora usará credenciais de prod)
3. Verifique se está recebendo notificações

### 3. Teste em Produção

- Faça um pagamento real com valor mínimo (R$ 1,00)
- Verifique se a reserva é criada
- Confirme o reembolso no painel do Mercado Pago

## 🐛 Troubleshooting

### Webhook não recebendo notificações

1. Verifique se a URL está acessível publicamente
2. Confirme se o endpoint retorna 200
3. Verifique os logs do Render
4. Teste manualmente:
   ```bash
   curl -X POST https://projetodormeaqui.onrender.com/api/webhook/mercadopago \
     -H "Content-Type: application/json" \
     -d '{"type":"payment","data":{"id":"123"}}'
   ```

### Pagamento não redireciona

1. Verifique se o `initPoint` está sendo retornado
2. Confirme se não há bloqueios de popup
3. Teste em modo anônimo

### Erro 401 - Não autenticado

1. Verifique se o cookie `dev_auth_token` ou `prod_auth_token` está presente
2. Faça login novamente
3. Verifique se o JWT está válido

## 📚 Recursos Úteis

- [Documentação Mercado Pago](https://www.mercadopago.com.br/developers)
- [Cartões de Teste](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/test-cards)
- [Webhooks](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/webhooks)
- [SDK Node.js](https://github.com/mercadopago/sdk-nodejs)

## ✅ Checklist Final

Antes de lançar:

- [ ] Access Token de teste configurado
- [ ] Webhook configurado no Dashboard
- [ ] Teste de pagamento aprovado realizado
- [ ] Teste de pagamento recusado realizado
- [ ] Teste de pagamento pendente realizado
- [ ] Idempotência testada
- [ ] Logs verificados
- [ ] Credenciais de produção configuradas
- [ ] Webhook de produção ativo
- [ ] Teste em produção realizado
