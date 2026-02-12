# 🔐 Guia de Configuração OAuth2 - DormeAqui

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
GOOGLE_CLIENT_SECRET="SEU_CLIENT_SECRET_AQUI"
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

## 4️⃣ ADICIONAR ROTAS NO FRONTEND

Se você tiver um arquivo de rotas (ex: `App.jsx` ou `router.tsx`), adicione:

```javascript
import GithubCallback from "./pages/GithubCallback";

// Nas suas rotas:
<Route path="/auth/github/callback" element={<GithubCallback />} />;
```

---

## 5️⃣ USAR O COMPONENTE OAUTH NO LOGIN

Onde você tiver seu formulário de login, importe e use:

```javascript
import AuthOAuth from "./components/AuthOAuth";

// No seu JSX:
<AuthOAuth
	onSuccess={(user) => {
		console.log("Usuário autenticado:", user);
		// Fazer algo após login bem-sucedido
	}}
	variant="login"
/>;
```

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

1. Acesse `http://localhost:5173`
2. Clique no botão "🔵 Google" ou "⚫ GitHub"
3. Complete a autenticação
4. Você deve ser redirecionado automaticamente

---

## 7️⃣ ESTRUTURA DOS ENDPOINTS OAUTH

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
- No frontend, use `VITE_GOOGLE_CLIENT_ID` (não `VITE_GOOGLE_CLIENT_SECRET`)

### ❌ "Redirect URI mismatch"

- Certifique-se que o redirect URI configurado no Google/GitHub bate com a URL do seu app
- Em produção, use `https://`

### ❌ "Token inválido"

- Verifique se as variáveis de ambiente estão definidas
- Restart o servidor backend após alterar `.env`

### ❌ Usuário criado mas sem dados

- Verifique se Google/GitHub está retornando email público
- GitHub pode não retornar email - neste caso, usamos `{login}@github.local`

---

## 🔟 FLUXO COMPLETO

1. **User** clica em "Login com Google/GitHub"
2. **Frontend** redireciona para Google/GitHub
3. **User** autoriza a aplicação
4. **Google/GitHub** redireciona de volta com token/code
5. **Frontend** envia token/code para backend
6. **Backend**:
   - Valida token/code com provider
   - Extrai email e dados do usuário
   - Verifica se usuário existe
   - Se não existe, cria automaticamente
   - Gera JWT próprio
   - Define cookie com JWT
   - Retorna dados do usuário
7. **Frontend** recebe dados e lida com autenticação
8. **User** está logado! ✅

---

## ✅ CHECKLIST FINAL

- [ ] Instalou `google-auth-library` no backend
- [ ] Instalou `@react-oauth/google` no frontend
- [ ] Criou OAuth App no Google Cloud
- [ ] Criou OAuth App no GitHub
- [ ] Preencheu todas as variáveis de ambiente (`.env`)
- [ ] Adicionou rota `/auth/github/callback` no frontend
- [ ] Importou `AuthOAuth` no componente de login
- [ ] Testou login local (Google e GitHub)
- [ ] Testou criação de novo usuário via OAuth
- [ ] Testou vinculação de OAuth a conta existente

---

**Pronto! Agora você tem autenticação OAuth2 funcionando com Google e GitHub! 🚀**
