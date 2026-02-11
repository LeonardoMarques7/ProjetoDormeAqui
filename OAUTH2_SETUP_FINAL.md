# 🔐 Guia de Configuração OAuth2 - DormeAqui (ATUALIZADO)

## ✨ ALTERAÇÃO IMPORTANTE

O OAuth2 agora está **integrado diretamente no componente `Login.jsx`**. Não há componentes separados.

---

## 1️⃣ INSTALAR DEPENDÊNCIAS

### Backend
```bash
cd back-end
npm install google-auth-library axios
```

### Frontend
```bash
cd front-end
npm install @react-oauth/google
```

---

## 2️⃣ CONFIGURAR GOOGLE OAUTH

### No Google Cloud Console:

1. Acesse: https://console.cloud.google.com
2. Crie um novo projeto (ex: "DormeAqui OAuth")
3. No menu lateral, vá para **APIs & Services** → **Enabled APIs and services**
4. Clique em **+ ENABLE APIS AND SERVICES**
5. Procure por **Google+ API** e ative
6. Clique em **CREATE CREDENTIALS**
7. Selecione **OAuth 2.0 Client ID**
8. Escolha **Web application**
9. Dê um nome (ex: "DormeAqui Web Client")
10. Adicione os **Authorized redirect URIs**:
    - `http://localhost:5173`
    - `http://localhost:5173/` (com barra)
11. Clique em **CREATE**
12. Copie o **Client ID** e **Client Secret**

### No arquivo `.env` do backend:
```env
GOOGLE_CLIENT_ID=SEU_CLIENT_ID_AQUI.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=SEU_CLIENT_SECRET_AQUI
```

### No arquivo `.env` do frontend:
```env
VITE_GOOGLE_CLIENT_ID=SEU_CLIENT_ID_AQUI.apps.googleusercontent.com
```

---

## 3️⃣ CONFIGURAR GITHUB OAUTH

### No GitHub:

1. Vá para **Settings** → **Developer settings** → **OAuth Apps**
2. Clique em **New OAuth App**
3. Preencha os campos:
   - **Application name**: DormeAqui
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:5173/auth/github/callback`
4. Clique em **Register application**
5. Copie o **Client ID**
6. Clique em **Generate a new client secret** e copie

### No arquivo `.env` do backend:
```env
GITHUB_CLIENT_ID=SEU_CLIENT_ID_AQUI
GITHUB_CLIENT_SECRET=SEU_CLIENT_SECRET_AQUI
```

### No arquivo `.env` do frontend:
```env
VITE_GITHUB_CLIENT_ID=SEU_CLIENT_ID_AQUI
```

---

## 4️⃣ ADICIONAR ROTA DE CALLBACK DO GITHUB

Adicione a rota para o callback do GitHub no seu `App.jsx` ou arquivo de rotas:

```javascript
import GithubCallback from './pages/GithubCallback';

// Nas suas rotas:
<Route path="/auth/github/callback" element={<GithubCallback />} />
```

---

## 5️⃣ O LOGIN.JSX JÁ ESTÁ PRONTO

O arquivo `front-end/src/pages/Login.jsx` foi atualizado e inclui:
- ✅ Botão de login com Google
- ✅ Botão de login com GitHub
- ✅ Integração com `UserContext`
- ✅ Tratamento de erros
- ✅ Loading state

**Não é necessário fazer nada! Apenas:**
1. Instale as dependências
2. Configure as variáveis de ambiente
3. Teste!

---

## 6️⃣ TESTAR LOCALMENTE

### Terminal 1 (Backend):
```bash
cd back-end
npm run dev
```

### Terminal 2 (Frontend):
```bash
cd front-end
npm run dev
```

### Teste:
1. Acesse `http://localhost:5173/login`
2. Clique no botão "Google" ou "GitHub"
3. Complete a autenticação
4. Você deve ser redirecionado automaticamente para home

---

## 7️⃣ ENDPOINTS OAUTH NO BACKEND

### Google:
```
POST /api/users/oauth/google
Body: { tokenId: "token_do_google" }
Response: { _id, name, email, photo, authMethod: 'google' }
```

### GitHub:
```
POST /api/users/oauth/github
Body: { code: "codigo_do_github" }
Response: { _id, name, email, photo, authMethod: 'github' }
```

---

## 8️⃣ SEGURANÇA EM PRODUÇÃO

### Antes de fazer deploy:

```env
# Backend .env
NODE_ENV=production
FRONTEND_URL=https://seusite.com
PROD_DOMAIN=.seusite.com

# Google
GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu_client_secret

# GitHub
GITHUB_CLIENT_ID=seu_github_client_id
GITHUB_CLIENT_SECRET=seu_github_client_secret
```

**Atualize os Redirect URIs:**

### Google Cloud Console:
- `https://seusite.com/`
- `https://www.seusite.com/`

### GitHub OAuth App:
- Authorization callback URL: `https://seusite.com/auth/github/callback`

---

## 9️⃣ TROUBLESHOOTING

### ❌ "Invalid Client ID"
- Verifique se o Client ID do `.env` está correto
- Certifique-se que está usando o ID de **Web Application** no Google
- Restart o servidor frontend após alterar `.env`

### ❌ "Redirect URI mismatch"
- Certifique-se que o redirect URI configurado no Google/GitHub bate com a URL do seu app
- Em produção, use `https://`
- Verifique trailing slashes nas URIs

### ❌ "Token inválido"
- Verifique se as variáveis de ambiente estão definidas
- Restart o servidor backend após alterar `.env`

### ❌ "GitHub callback não funciona"
- Certifique-se que a rota `/auth/github/callback` foi adicionada ao router
- Verifique se `VITE_GITHUB_CLIENT_ID` está no `.env` do frontend

### ❌ "Módulo não encontrado @react-oauth/google"
- Execute `npm install @react-oauth/google` no frontend

---

## 🔟 FLUXO COMPLETO

1. **User** acessa `/login`
2. **User** clica em "Google" ou "GitHub"
3. **Frontend** redireciona para Google/GitHub
4. **User** autoriza a aplicação
5. **Google/GitHub** redireciona de volta com token/code
6. **Frontend** envia para backend
7. **Backend** valida e cria JWT
8. **Frontend** recebe dados e atualiza `UserContext`
9. **User** é redirecionado para home ✅

---

## ✅ CHECKLIST FINAL

- [ ] Instalou `google-auth-library` no backend
- [ ] Instalou `@react-oauth/google` no frontend
- [ ] Criou OAuth App no Google Cloud
- [ ] Criou OAuth App no GitHub
- [ ] Preencheu `.env` do backend com variáveis OAuth
- [ ] Preencheu `.env` do frontend com variáveis OAuth
- [ ] Adicionou rota `/auth/github/callback` no router
- [ ] Testou login tradicional (email/senha) - continua funcionando
- [ ] Testou login com Google
- [ ] Testou login com GitHub

---

## 📂 ARQUIVOS MODIFICADOS/CRIADOS

✅ `back-end/domains/users/model.js` - Campos OAuth adicionados
✅ `back-end/domains/users/authService.js` - Lógica OAuth
✅ `back-end/domains/users/routes.js` - Rotas OAuth
✅ `back-end/.env` - Variáveis OAuth
✅ `front-end/src/pages/Login.jsx` - **OAuth integrado**
✅ `front-end/src/pages/GithubCallback.jsx` - Callback GitHub
✅ `front-end/.env` - Variáveis OAuth

---

**Pronto! OAuth2 está implementado e integrado no Login.jsx! 🚀**
