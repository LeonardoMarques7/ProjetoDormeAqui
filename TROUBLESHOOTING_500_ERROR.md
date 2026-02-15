# Troubleshooting - Erro 500 ao Criar Preferência

## 🔍 Possíveis Causas do Erro 500

### 1. MERCADO_PAGO_ACCESS_TOKEN não configuraErro ao criar preferência: At least one policy returned UNAUTHORIZED.

do

**Verificação:**

```bash
# Verifique se a variável está no .env
cat back-end/.env | grep MERCADO_PAGO
```

**Solução:**
Adicione ao `back-end/.env`:

```env
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADO_PAGO_WEBHOOK_URL=https://projetodormeaqui.onrender.com/api/webhook/mercadopago
FRONTEND_URL=https://projetodormeaqui.onrender.com
```

### 2. Token Inválido ou Expirado

**Como obter um novo token:**

1. Acesse: https://www.mercadopago.com.br/developers
2. Login → Suas Integrações → DormeAqui
3. Copie o **Access Token de TESTE** (começa com `TEST-`)

### 3. Erro na Estrutura dos Dados

**Verifique os logs do backend** - agora adicionei logs detalhados em todos os pontos:

- `📥 Requisição recebida` - mostra body e user
- `❌ Dados incompletos` - mostra o que está faltando
- `✅ Acomodação encontrada` - confirma busca no banco
- `💰 Cálculo de preço` - mostra valores calculados
- `📦 Dados da preferência` - JSON completo enviado ao MP
- `🚀 Chamando Mercado Pago API` - antes da chamada
- `❌ Erro detalhado` - se houver erro na API do MP

### 4. Problema com o SDK do Mercado Pago

**Verifique a instalação:**

```bash
cd back-end
npm list mercadopago
```

Deve mostrar: `mercadopago@^2.x.x`

Se não estiver instalado:

```bash
npm install mercadopago
```

### 5. Erro na Configuração do Webhook URL

**Verificação:**

```bash
# Teste se a variável está definida
curl https://projetodormeaqui.onrender.com/api/webhook/mercadopago
```

Deve retornar:

```json
{
	"status": "Webhook ativo",
	"timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🧪 Teste Rápido via cURL

Teste diretamente a API para ver o erro exato:

```bash
curl -X POST https://projetodormeaqui.onrender.com/api/payments/create \
  -H "Content-Type: application/json" \
  -H "Cookie: dev_auth_token=SEU_TOKEN_JWT_AQUI" \
  -d '{
    "accommodationId": "ID_DA_ACOMODACAO_VALIDA",
    "checkIn": "2024-02-01T00:00:00.000Z",
    "checkOut": "2024-02-05T00:00:00.000Z",
    "guests": 2
  }'
```

## 📋 Checklist de Verificação

- [ ] `MERCADO_PAGO_ACCESS_TOKEN` está no `.env` do backend
- [ ] Token começa com `TEST-` (ambiente de teste)
- [ ] `MERCADO_PAGO_WEBHOOK_URL` está configurado
- [ ] `FRONTEND_URL` está configurado
- [ ] Pacote `mercadopago` está instalado (`npm list mercadopago`)
- [ ] Backend foi reiniciado após alterar `.env`
- [ ] Usuário está autenticado (cookie `dev_auth_token` ou `prod_auth_token` presente)

## 🔧 Como Verificar os Logs

### No Render Dashboard:

1. Acesse: https://dashboard.render.com
2. Selecione seu serviço `projetodormeaqui`
3. Clique em "Logs" no menu lateral
4. Procure por:
   - `📥 Requisição recebida` - confirma que a requisição chegou
   - `❌` - indica erros
   - `✅` - indica sucesso

### Logs Importantes para Procurar:

```
✅ Sucesso:
📥 Requisição recebida em /api/payments/create
✅ Acomodação encontrada: [título] Preço: [valor]
💰 Cálculo de preço: {nights: X, pricePerNight: Y, totalPrice: Z}
✅ Preferência criada com sucesso

❌ Erros comuns:
❌ ERRO CRÍTICO: MERCADO_PAGO_ACCESS_TOKEN não está configurado!
❌ Dados incompletos: {accommodationId, checkIn, checkOut, guests}
❌ UserId não encontrado no token
❌ Erro ao buscar acomodação: Acomodação não encontrada
❌ Erro detalhado ao criar preferência Mercado Pago
```

## 🚀 Solução Rápida (Passo a Passo)

1. **Verifique o `.env` do backend:**

   ```bash
   # No servidor Render, vá em Environment Variables
   # Ou localmente:
   cat back-end/.env
   ```

2. **Confirme que o token está correto:**
   - Deve começar com `TEST-` (para testes)
   - Ou `APP_USR-` (para produção)
   - Deve ter ~100 caracteres

3. **Reinicie o servidor:**
   - No Render: Manual Deploy → Deploy Latest Commit
   - Localmente: `npm run dev` (ou reinicie o terminal)

4. **Teste novamente:**
   - Tente fazer uma reserva no frontend
   - Ou use o cURL acima para testar diretamente

5. **Verifique os logs:**
   - Procure pelos emojis (📥, ✅, ❌) nos logs
   - Identifique onde o fluxo quebra

## 🆘 Se Nada Funcionar

Se após todas as verificações o erro 500 persistir:

1. **Verifique se o erro é do Mercado Pago:**
   - Nos logs, procure por `❌ Erro detalhado ao criar preferência`
   - A mensagem de erro original estará logada

2. **Teste com dados mínimos:**

   ```javascript
   // No service.js, teste com dados fixos:
   const preferenceData = {
   	items: [
   		{
   			title: "Teste",
   			quantity: 1,
   			currency_id: "BRL",
   			unit_price: 100,
   		},
   	],
   	// ... resto da configuração
   };
   ```

3. **Verifique a versão do SDK:**

   ```bash
   npm list mercadopago
   # Deve ser 2.x.x
   ```

4. **Contate o suporte:**
   - Capture os logs completos do erro
   - Inclua a mensagem de erro original do Mercado Pago
   - Verifique se é um erro de autenticação, dados ou API

## ✅ Após Corrigir

Depois de resolver o problema:

1. Remova os logs de debug se desejar (opcional)
2. Teste o fluxo completo de pagamento
3. Verifique se o webhook está recebendo notificações
4. Confirme que as reservas estão sendo criadas no banco de dados

---

**Dica:** Os logs detalhados que adicionei vão mostrar exatamente onde o erro ocorre. Procure pelos emojis nos logs do Render para identificar rapidamente o problema!
