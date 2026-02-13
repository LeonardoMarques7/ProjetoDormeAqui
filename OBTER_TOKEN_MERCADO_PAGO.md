# Como Obter o Access Token Correto do Mercado Pago

## 🚨 Problema Identificado

Seu token atual está **truncado/incompleto**:

```
Atual:    TEST-93a0eb59-9156-4e0b-84a5-42dcb7bbe220 (41 caracteres)
Correto:  TEST-xxxxxxxxxx-xxxxxxxx-xxxx-xxxx-xxxxxxxxxxxx (~100 caracteres)
```

Tokens válidos do Mercado Pago têm aproximadamente **100 caracteres** e seguem o formato:

```
TEST-4184115901593566-021309-b1344370dad11fd3be9b7cedfd229e5a-3202538894
```

## 📋 Passo a Passo para Obter o Token

### 1. Acesse o Dashboard de Desenvolvedor

1. Vá para: https://www.mercadopago.com.br/developers
2. Faça login com sua conta do Mercado Pago
3. Clique em **"Suas integrações"** no menu superior

### 2. Crie ou Selecione uma Aplicação

Se ainda não tiver uma aplicação:

1. Clique em **"Criar aplicação"**
2. Nome: `DormeAqui`
3. Modelo de negócio: `Marketplace`
4. Produto: `Checkout Pro`
5. Clique em **"Criar"**

Se já tiver:

1. Clique na aplicação `DormeAqui`

### 3. Obtenha as Credenciais de Teste

1. No menu lateral, clique em **"Credenciais de prueba"** (Credenciais de teste)
2. Procure por **"Access token"**
3. Clique no botão **"Copiar"** ao lado do token
4. **IMPORTANTE**: Certifique-se de copiar o token **COMPLETO**

### 4. Valide o Token Copiado

O token deve ter:

- ✅ Começar com `TEST-`
- ✅ Aproximadamente **100 caracteres**
- ✅ Formato: `TEST-xxxxxxxxxx-xxxxxxxx-xxxx-xxxx-xxxxxxxxxxxx`

Exemplo de token válido:

```
TEST-4184115901593566-021309-b1344370dad11fd3be9b7cedfd229e5a-3202538894
```

## 🔧 Atualize o .env do Backend

1. Abra o arquivo `back-end/.env`
2. Substitua a linha do token:

   ```env
   # ❌ INCORRETO (truncado)
   MERCADO_PAGO_ACCESS_TOKEN=TEST-93a0eb59-9156-4e0b-84a5-42dcb7bbe220

   # ✅ CORRETO (completo)
   MERCADO_PAGO_ACCESS_TOKEN=TEST-4184115901593566-021309-b1344370dad11fd3be9b7cedfd229e5a-3202538894
   ```

3. **Salve o arquivo**

## 🚀 Reinicie o Servidor

### Localmente:

```bash
cd back-end
# Pare o servidor (Ctrl+C) e reinicie
npm run dev
```

### No Render:

1. Acesse: https://dashboard.render.com
2. Selecione seu serviço `projetodormeaqui`
3. Vá em **"Environment"** no menu lateral
4. Adicione/atualize a variável `MERCADO_PAGO_ACCESS_TOKEN`
5. Clique em **"Save Changes"**
6. O servidor reiniciará automaticamente

## ✅ Verifique nos Logs

Após reiniciar, verifique os logs do backend. Você deve ver:

```
🔧 Configurando Mercado Pago...
Token presente: Sim
Comprimento do token: 97 caracteres  ✅
Prefixo: TEST-4184...
✅ Token válido detectado
Ambiente: TESTE
```

Se aparecer:

```
❌ ERRO: Token muito curto! Tokens válidos têm ~100+ caracteres.
Token atual tem apenas 41 caracteres
```

O token ainda está incorreto. Repita o processo de cópia.

## 🧪 Teste Rápido

Após atualizar o token, teste via cURL:

```bash
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -H "Cookie: dev_auth_token=SEU_TOKEN_JWT" \
  -d '{
    "accommodationId": "ID_VALIDO_DO_MONGODB",
    "checkIn": "2024-02-01T00:00:00.000Z",
    "checkOut": "2024-02-05T00:00:00.000Z",
    "guests": 2
  }'
```

Resposta esperada (sucesso):

```json
{
	"success": true,
	"data": {
		"initPoint": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
		"bookingDetails": {
			"totalPrice": 800,
			"nights": 4
		}
	}
}
```

## 🆘 Ainda com Problemas?

Se o token continuar truncado:

1. **Tente copiar de outro navegador** (Chrome, Firefox, Edge)
2. **Use o botão "Copiar"** em vez de selecionar manualmente
3. **Cole em um editor de texto primeiro** para verificar o tamanho
4. **Verifique se há quebras de linha** no token copiado
5. **Regenere o token** no dashboard do Mercado Pago:
   - Vá em Credenciais → Regenerar credenciais de teste

## 📞 Contato

Se após seguir todos os passos o token ainda não funcionar:

1. Verifique se sua conta do Mercado Pago está verificada
2. Confirme que está usando credenciais de **TESTE** (não produção)
3. Tente criar uma nova aplicação no dashboard

---

**Resumo**: Seu token atual tem apenas 41 caracteres, mas deveria ter ~100. Siga os passos acima para obter o token completo do dashboard do Mercado Pago.
