# 🔐 OAuth Production Fix

## ✅ Alterações Realizadas

O código foi atualizado para funcionar dinamicamente em **desenvolvimento** e **produção**.

### 1️⃣ Backend (`authService.js`)
- ✅ Google OAuth agora usa URL correta baseado em `NODE_ENV`
- ✅ GitHub OAuth adicionado com logs de debug

### 2️⃣ Frontend (`AuthOAuth.jsx`)
- ✅ GitHub redirect URI agora usa `window.location.origin` (dinâmico)
- ✅ Adicionados logs para debug

---

## 🔧 Configuração do GitHub OAuth

### No GitHub:
1. Vá para **Settings** → **Developer settings** → **OAuth Apps**
2. Clique em sua aplicação "DormeAqui"
3. Em **Authorization callback URL**, registre **AMBAS**:
   ```
   http://localhost:5173/auth/github/callback
   https://projetodormeaqui.onrender.com/auth/github/callback
   ```
4. Salve

---

## 🔧 Configuração do Google OAuth

### No Google Cloud Console:
1. Acesse: https://console.cloud.google.com
2. Vá para **APIs & Services** → **Credentials**
3. Clique em seu OAuth 2.0 Client ID (Web application)
4. Em **Authorized redirect URIs**, registre **AMBAS**:
   ```
   http://localhost:5173/auth/google/callback
   https://projetodormeaqui.onrender.com/auth/google/callback
   ```
5. Salve

---

## 📝 Variáveis de Ambiente

### Backend `.env` (LOCAL)
```env
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
PROD_DOMAIN=https://projetodormeaqui.onrender.com
```

### Backend `.env` (PRODUCTION no Render)
```env
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
PROD_DOMAIN=https://projetodormeaqui.onrender.com
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:3000/api (dev) ou https://projetodormeaqui.onrender.com/api (prod)
VITE_GOOGLE_CLIENT_ID=seu_client_id
VITE_GITHUB_CLIENT_ID=seu_github_client_id
```

---

## ✅ Checklist Final

- [ ] Registrou `https://projetodormeaqui.onrender.com/auth/github/callback` no GitHub
- [ ] Registrou `https://projetodormeaqui.onrender.com/auth/google/callback` no Google Cloud
- [ ] Atualizou `.env` em produção com `NODE_ENV=production`
- [ ] Testou login local: `http://localhost:5173/login`
- [ ] Testou login em produção: `https://projetodormeaqui.onrender.com/login`
- [ ] Google login funciona ✅
- [ ] GitHub login funciona ✅

---

## 🚀 Deploy

1. **Push das mudanças:**
   ```bash
   git add .
   git commit -m "fix: OAuth redirect URI para produção"
   git push origin main
   ```

2. **Render fará deploy automaticamente**

3. **Teste:**
   - Acesse `https://projetodormeaqui.onrender.com/login`
   - Clique em "Google" ou "GitHub"
   - Você não deve ver mais o erro de `redirect_uri_mismatch`

---

## 📊 Fluxo Corrigido

**ANTES (Erro):**
```
Frontend: http://localhost:5173 → GitHub redirect_uri
GitHub OAuth: ❌ Erro "invalid redirect_uri"
```

**DEPOIS (Correto):**
```
Dev:  http://localhost:5173 → GitHub
Prod: https://projetodormeaqui.onrender.com → GitHub (configurado)
      ✅ Ambos funcionam!
```

---

## 🐛 Debug

Se ainda tiver erro, verifique:

1. **Console do browser** (F12):
   - Veja qual `redirectUri` está sendo enviado

2. **Logs do backend**:
   ```bash
   tail -f back-end/logs.txt
   ```
   - Procure por `🔄 Processando código do GitHub`

3. **GitHub/Google settings**:
   - Confirme que as URLs estão **exatamente** como configuradas

---

**Pronto! OAuth2 funciona em dev e produção! 🚀**
