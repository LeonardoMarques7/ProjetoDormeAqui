# 🔧 Correção do Erro 403 - Mercado Pago

## 🚨 Problema Identificado

O erro `At least one policy returned UNAUTHORIZED` com status **403** indica que o Mercado Pago está rejeitando a autenticação do token. Isso pode ocorrer por:

1. **Token inválido ou expirado**
2. **Token truncado** durante a cópia (menos de 100 caracteres)
3. **Token de produção** sendo usado em ambiente de desenvolvimento
4. **Conta do Mercado Pago** com restrições ou não verificada

## ✅ Correções Implementadas

### 1. **Validação Aprimorada do Token** (`back-end/config/mercadopago.js`)

- Adicionada função `validateToken()` que verifica:
  - Se o token está presente
  - Se começa com `TEST-` ou `APP_USR-`
  - Se tem pelo menos 80 caracteres
- Logs detalhados durante a inicialização
- Função `testToken()` para testar o token fazendo uma chamada real à API

### 2. **Melhor Logging de Erros** (`back-end/domains/payments/service.js`)

- Captura detalhes completos do erro (status, código, resposta da API)
- Análise específica para erros 403/UNAUTHORIZED
- Sugestões automáticas baseadas no tipo de erro
- Re-validação do token quando ocorre erro de autenticação

### 3. **Endpoint de Teste** (`back-end/domains/payments/controller.js` e `routes.js`)

- Novo endpoint `GET /api/payments/test-config` (público, sem autenticação)
- Permite testar a configuração do Mercado Pago sem criar uma reserva
- Retorna informações detalhadas sobre o status do token

### 4. **Configuração do SDK Otimizada**

- Timeout aumentado para 10 segundos
- Idempotency key configurada para evitar duplicatas
- Melhor tratamento de erros na configuração

## 🧪 Como Testar as Correções

### Passo 1: Reiniciar o Backend

```bash
cd back-end
# Pare o servidor (Ctrl+C) e reinicie
npm run dev
```

### Passo 2: Verificar os Logs de Inicialização

Ao iniciar, você deve ver logs como:

```
🔧 Configurando Mercado Pago...
Token presente: Sim
Comprimento do token: 97 caracteres
Prefixo: TEST-4184...
✅ Token válido detectado
Ambiente: TESTE
```

Se aparecer:

```
❌ ERRO CRÍTICO: Token muito curto
Detalhes: Token tem apenas 41 caracteres. Tokens válidos têm ~100 caracteres.
```

**O token está truncado!** Siga as instruções em `OBTER_TOKEN_MERCADO_PAGO.md` para obter o token completo.

### Passo 3: Testar a Configuração

Acesse no navegador ou use cURL:

```bash
curl http://localhost:3000/api/payments/test-config
```

**Resposta esperada (sucesso):**

```json
{
	"success": true,
	"message": "Configuração do Mercado Pago válida",
	"details": {
		"success": true,
		"message": "Token válido e funcionando",
		"preferenceId": "123456789",
		"initPoint": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=..."
	}
}
```

**Resposta de erro (token inválido):**

```json
{
	"success": false,
	"message": "Problema na configuração do Mercado Pago",
	"details": {
		"success": false,
		"message": "Falha na autenticação com Mercado Pago",
		"error": {
			"message": "At least one policy returned UNAUTHORIZED.",
			"status": 403,
			"code": "PA_UNAUTHORIZED_RESULT_FROM_POLICIES",
			"suggestion": "Token inválido ou expirado. Gere um novo token no dashboard do Mercado Pago."
		}
	}
}
```

### Passo 4: Testar Criação de Pagamento

Se o teste de configuração passar, tente criar uma reserva:

```bash
curl -X POST http://localhost:3000/api/payments/create \
  -H "Content-Type: application/json" \
  -H "Cookie: dev_auth_token=SEU_TOKEN_JWT" \
  -d '{
    "accommodationId": "ID_VALIDO_DO_MONGODB",
    "checkIn": "2026-02-13T16:09:30.351Z",
    "checkOut": "2026-02-18T16:09:30.351Z",
    "guests": 1
  }'
```

## 🔍 Diagnóstico de Erros Comuns

### Erro: "Token muito curto"

**Causa:** Token foi truncado durante a cópia (tem menos de 80 caracteres)

**Solução:**

1. Acesse https://www.mercadopago.com.br/developers
2. Vá em "Credenciais de prueba"
3. Clique no botão **"Copiar"** (não selecione manualmente)
4. Cole diretamente no `.env`
5. Verifique se tem ~100 caracteres

### Erro: "At least one policy returned UNAUTHORIZED"

**Causas possíveis:**

1. Token expirado
2. Token de produção em ambiente de teste
3. Conta não verificada no Mercado Pago

**Soluções:**

1. Gere um novo token de TESTE no dashboard
2. Verifique se sua conta está verificada
3. Tente criar uma nova aplicação no dashboard

### Erro: "notification_url is not valid"

**Causa:** URL do webhook não está acessível publicamente

**Solução:**

- Em desenvolvimento: Use `localhost` (aceito para testes)
- Em produção: Certifique-se que a URL é HTTPS e acessível

## 📝 Checklist de Verificação

- [ ] Token tem ~100 caracteres (não 40)
- [ ] Token começa com `TEST-` (desenvolvimento) ou `APP_USR-` (produção)
- [ ] Backend reiniciado após atualizar `.env`
- [ ] Teste de configuração retorna sucesso
- [ ] Criação de pagamento funciona

## 🆘 Se o Erro Persistir

Se após todas as correções o erro continuar:

1. **Verifique sua conta do Mercado Pago:**
   - Acesse https://www.mercadopago.com.br
   - Confirme que a conta está verificada (e-mail e telefone)

2. **Crie uma nova aplicação:**
   - No dashboard de desenvolvedor, crie uma nova aplicação
   - Use as credenciais de teste da nova aplicação

3. **Teste direto na API do Mercado Pago:**

```bash
curl -X POST https://api.mercadopago.com/checkout/preferences \
  -H "Authorization: Bearer SEU_TOKEN_TESTE" \
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

Se essa chamada direta falhar, o problema é com o token ou conta. Se funcionar, o problema está no código.

## 📞 Próximos Passos

1. Execute o teste de configuração: `GET /api/payments/test-config`
2. Verifique os logs do backend para mensagens detalhadas
3. Se o token estiver inválido, siga as instruções em `OBTER_TOKEN_MERCADO_PAGO.md`
4. Teste novamente a criação de pagamento

---

**Arquivos modificados:**

- `back-end/config/mercadopago.js` - Validação e teste de token
- `back-end/domains/payments/service.js` - Melhor logging e tratamento de erros
- `back-end/domains/payments/controller.js` - Endpoint de teste
- `back-end/domains/payments/routes.js` - Rota pública para teste
