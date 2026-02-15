# Diagnóstico do Erro 500 - Token de Produção vs Teste

## 🚨 Problema Identificado

Você está usando um token de **PRODUÇÃO** em ambiente de **DESENVOLVIMENTO**:

```env
NODE_ENV=development
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-474248369381818-021312-ed0decfd23650f9d0c9b4a0c51b04b58-3202479454
#        ^^^^^^^^ PRODUÇÃO
```

Isso pode causar erro 500 porque:

1. O Mercado Pago pode rejeitar chamadas de `localhost` com token de produção
2. O SDK pode ter comportamento diferente entre ambientes
3. URLs de `back_urls` com `localhost` podem ser rejeitadas

## 🔧 Solução Imediata

### Opção 1: Usar Token de TESTE (Recomendado para desenvolvimento)

1. No dashboard do Mercado Pago, vá em **"Credenciais de prueba"** (TESTE)
2. Copie o **Access Token de TESTE** (começa com `TEST-`)
3. Atualize o `.env`:
   ```env
   MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Opção 2: Configurar para Produção (se quiser testar com token real)

Se precisa usar o token de produção, configure tudo como produção:

1. **Atualize o `.env`:**

   ```env
   NODE_ENV=production
   FRONTEND_URL=https://projetodormeaqui.onrender.com
   MERCADO_PAGO_ACCESS_TOKEN=APP_USR-474248369381818-021312-ed0decfd23650f9d0c9b4a0c51b04b58-3202479454
   ```

2. **Use ngrok para expor localhost:**
   ```bash
   npm install -g ngrok
   ngrok http 5173
   # Use a URL HTTPS do ngrok como FRONTEND_URL
   ```

## 🧪 Como Ver o Erro Exato

Com as atualizações que fiz, agora o erro será mostrado detalhadamente no console do backend.

### Passos:

1. **Reinicie o backend** (para aplicar as mudanças)
2. **Tente criar uma reserva** no frontend
3. **Verifique o terminal do backend** - você verá:

```
❌ Erro capturado no errorHandler:
Mensagem: Erro ao criar preferência: [mensagem original]
Erro original (Mercado Pago): [detalhes completos]
Resposta da API: [erro retornado pelo MP]
📤 Resposta de erro enviada: [objeto completo]
```

4. **No DevTools do navegador** (F12 → Network → Response da requisição `/api/payments/create`), você verá:
   ```json
   {
     "success": false,
     "message": "Erro ao criar preferência: ... | Mercado Pago: ...",
     "originalError": "...",
     "mercadoPagoError": { ... }
   }
   ```

## 🔍 Causas Comuns do Erro 500 com Mercado Pago

### 1. Token Inválido ou Expirado

```
Erro: "invalid_token" ou "unauthorized"
Solução: Gere um novo token no dashboard
```

### 2. URL de Webhook Inválida

```
Erro: "notification_url is not valid"
Solução: A URL deve ser HTTPS e acessível publicamente
```

### 3. Dados da Preferência Inválidos

```
Erro: "items is required" ou "unit_price must be number"
Solução: Verifique os dados enviados na preferência
```

### 4. Conflito de Ambiente (seu caso provável)

```
Erro: "invalid_scope" ou "forbidden"
Solução: Use token de TESTE em desenvolvimento
```

## 🚀 Teste Rápido via cURL

Teste diretamente para ver o erro:

```bash
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -H "Cookie: dev_auth_token=SEU_TOKEN_JWT" \
  -d '{
    "accommodationId": "ID_VALIDO",
    "checkIn": "2024-02-01T00:00:00.000Z",
    "checkOut": "2024-02-05T00:00:00.000Z",
    "guests": 2
  }' \
  -v
```

A flag `-v` mostra todos os detalhes da requisição e resposta.

## ✅ Checklist para Resolver

- [ ] Obter token de **TESTE** (não produção) para desenvolvimento
- [ ] Atualizar `MERCADO_PAGO_ACCESS_TOKEN` no `.env`
- [ ] Reiniciar o servidor backend
- [ ] Verificar logs detalhados no terminal
- [ ] Testar novamente

## 🆘 Se o Erro Persistir

Se após trocar para token de TESTE o erro continuar:

1. **Verifique se o token está completo** (deve ter ~100 caracteres)
2. **Confirme que o backend está lendo o .env** (adicionei logs que mostram isso)
3. **Teste a API do Mercado Pago diretamente:**
   ```bash
   curl -X POST https://api.mercadopago.com/checkout/preferences \
     -H "Authorization: Bearer TEST-SEU_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "items": [{
         "title": "Teste",
         "quantity": 1,
         "currency_id": "BRL",
         "unit_price": 100
       }]
     }'
   ```

Se essa chamada direta funcionar, o problema está no código. Se falhar, o token está inválido.

---

**Recomendação**: Use token de **TESTE** (`TEST-`) para desenvolvimento local. O token de produção (`APP_USR-`) só deve ser usado em produção (Render) com HTTPS.
