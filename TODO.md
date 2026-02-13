# TODO - Correção Erro de Conexão Mercado Pago

## Problema

Erro `ERR_CONNECTION_RESET` ao tentar criar preferência de pagamento no endpoint `POST http://localhost:3000/api/payments/create`

## Causas Possíveis

- [x] Timeout muito curto (10s) - **CORRIGIDO: Aumentado para 30s**
- [x] CORS bloqueando requisições - **VERIFICADO: Configuração OK**
- [x] Erro no processamento que fecha conexão abruptamente - **CORRIGIDO: Adicionado tratamento de erro**
- [ ] Problema de autenticação (JWT/cookie) - **PENDENTE VERIFICAÇÃO**

## Tarefas Concluídas ✅

### 1. back-end/config/mercadopago.js ✅

- [x] Aumentar timeout de 10s para 30s
- [x] Adicionar logs detalhados de conexão

### 2. back-end/server.js ✅

- [x] Adicionar middleware de logging para debugar requisições
- [x] Verificar configuração CORS
- [x] Adicionar tratamento de erros de conexão

### 3. back-end/domains/payments/controller.js ✅

- [x] Adicionar try-catch global no controller
- [x] Adicionar logs de entrada/saída
- [x] Garantir que resposta sempre seja enviada

### 4. front-end/src/services/paymentService.js ✅

- [x] Adicionar timeout explícito de 30s
- [x] Melhorar tratamento de erros de rede
- [x] Adicionar logs de debug

## Próximos Passos para Testar 🔧

1. **Reinicie o servidor backend:**

   ```bash
   cd back-end
   npm start
   ```

2. **Teste o endpoint de configuração:**

   ```bash
   curl http://localhost:3000/api/payments/test-config
   ```

3. **Verifique os logs do backend** ao tentar criar uma preferência

4. **Teste a criação de preferência** pelo frontend

## Status

- [x] Correções aplicadas
- [ ] Testes pendentes
