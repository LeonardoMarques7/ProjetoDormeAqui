# 🔧 Corrigindo GitHub OAuth - Redirect URI Mismatch

## ❌ Erro Atual
```
The redirect_uri is not associated with this application.
```

Isso significa que o `redirect_uri` que você está enviando **NÃO está registrado no GitHub OAuth App**.

---

## 📝 Quais URIs você está usando?

**Em DEV (localhost):**
- Frontend roda em: `http://localhost:5173`
- Callback será: `http://localhost:5173/auth/github/callback`

**Em PRODUÇÃO:**
- Frontend: `https://projetodormeaqui.onrender.com`
- Callback será: `https://projetodormeaqui.onrender.com/auth/github/callback`

---

## ✅ Como Registrar Corretamente

### Passo 1: Acesse GitHub OAuth App
1. Vá para: https://github.com/settings/developers
2. Clique em **OAuth Apps**
3. Selecione sua aplicação **"DormeAqui"**

### Passo 2: Adicione AMBOS os Redirect URIs

Na seção **Authorization callback URL**, adicione:

```
http://localhost:5173/auth/github/callback
https://projetodormeaqui.onrender.com/auth/github/callback
```

**⚠️ IMPORTANTE:**
- Se o campo só aceita UM redirect URI, você precisa registrar uma nova aplicação ou contatar GitHub
- Ou: Usar dois OAuth Apps diferentes (um para dev, um para prod)

### Passo 3: Salve

---

## 🔄 Fluxo Agora Funciona

**DEV:**
```
1. Clica em "GitHub"
2. Frontend envia: http://localhost:5173/auth/github/callback ✅
3. GitHub valida ✅
4. Redireciona com code
5. Backend processa em /users/oauth/github ✅
```

**PROD:**
```
1. Clica em "GitHub"
2. Frontend envia: https://projetodormeaqui.onrender.com/auth/github/callback ✅
3. GitHub valida ✅
4. Redireciona com code
5. Backend processa em /users/oauth/github ✅
```

---

## 🆘 Se só puder registrar UM redirect URI

### Opção A: Usar App separada para produção
- Crie 2 OAuth Apps no GitHub
- Uma com Client ID para DEV
- Uma com Client ID para PROD
- Configure a variável de ambiente correta

### Opção B: Usar função dinâmica no GitHub
GitHub permite usar `*` para subdomínios em alguns casos, mas é raro.

---

## 🧪 Como Testar

### Terminal 1 (Backend)
```bash
cd back-end
npm run dev
```

### Terminal 2 (Frontend)
```bash
cd front-end
npm run dev
```

### No Browser
1. Acesse `http://localhost:5173/login`
2. Clique no botão "GitHub"
3. Você deve ser redirecionado para `https://github.com/login/oauth/authorize`
4. Se der o erro, é porque o `redirect_uri` não está registrado

---

## 📋 Checklist

- [ ] Verifiquei qual(is) `Authorization callback URL(s)` estão registrados no GitHub
- [ ] Adicionei `http://localhost:5173/auth/github/callback` 
- [ ] Adicionei `https://projetodormeaqui.onrender.com/auth/github/callback`
- [ ] Testei em DEV: `http://localhost:5173/login` → GitHub button
- [ ] Testei em PRODUÇÃO: `https://projetodormeaqui.onrender.com/login` → GitHub button
- [ ] Ambos funcionam ✅

---

## 🔍 Para Debug

Se ainda der erro, abra **DevTools** (F12) e procure no console por:
```
🔗 DEV: GitHub redirect URI: http://localhost:5173/auth/github/callback
```
ou
```
🔗 PROD: GitHub redirect URI: https://projetodormeaqui.onrender.com/auth/github/callback
```

Compare com o que está registrado no GitHub!

---

**Se o GitHub OAuth App SÓ ACEITA 1 REDIRECT URI, você precisa registrar as 2 apps separadamente ou usar um proxy/reescrita.**
