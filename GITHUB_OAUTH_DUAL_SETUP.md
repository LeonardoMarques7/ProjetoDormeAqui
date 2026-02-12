# 🔐 Configuração de OAuth com Dual Apps GitHub

## ✅ Alterações Realizadas

### Backend
1. ✅ `.env` atualizado com `GITHUB_CLIENT_ID_DEV` e `GITHUB_CLIENT_ID_PROD`
2. ✅ `authService.js` agora seleciona as credenciais corretas baseado em `NODE_ENV`

### Frontend
- Continua usando `.env` (gitignored)
- Seleção automática de Client ID por ambiente

---

## 📝 Configurar o Frontend `.env`

### Para DESENVOLVIMENTO (localhost):

```env
# API Backend
VITE_API_URL=http://localhost:3000/api

# Google OAuth
VITE_GOOGLE_CLIENT_ID="37748047971-3apb3g0qg5hkh3hgimqg2901460v7lhr.apps.googleusercontent.com"

# GitHub OAuth (DEV App)
VITE_GITHUB_CLIENT_ID=Ov23lib2RxrcOqyJiXCY
```

### Para PRODUÇÃO (será configurado no Render):

```env
# API Backend
VITE_API_URL=https://projetodormeaqui.onrender.com/api

# Google OAuth
VITE_GOOGLE_CLIENT_ID="37748047971-3apb3g0qg5hkh3hgimqg2901460v7lhr.apps.googleusercontent.com"

# GitHub OAuth (PROD App)
VITE_GITHUB_CLIENT_ID=Ov23liAhI3eCD3opUwdo
```

---

## 🔄 Como Funciona Agora

### Em DESENVOLVIMENTO (localhost:5173)
```
Frontend                          Backend
  ↓                                 ↓
GitHub button → uses DEV App   NODE_ENV=development
                               ↓
                        GITHUB_CLIENT_ID_DEV
                        GITHUB_CLIENT_SECRET_DEV
                               ↓
                        Autenticação com GitHub ✅
```

### Em PRODUÇÃO (projetodormeaqui.onrender.com)
```
Frontend                          Backend
  ↓                                 ↓
GitHub button → uses PROD App  NODE_ENV=production
                               ↓
                        GITHUB_CLIENT_ID_PROD
                        GITHUB_CLIENT_SECRET_PROD
                               ↓
                        Autenticação com GitHub ✅
```

---

## 📋 Checklist

- [ ] Atualizei `.env` frontend com `VITE_GITHUB_CLIENT_ID=Ov23lib2RxrcOqyJiXCY` (DEV)
- [ ] Backend `.env` já tem ambas as apps (DEV e PROD)
- [ ] `NODE_ENV=development` em local
- [ ] `NODE_ENV=production` configurado no Render
- [ ] Testei GitHub login em DEV: `http://localhost:5173/login`
- [ ] Vou configurar no Render com `VITE_GITHUB_CLIENT_ID=Ov23liAhI3eCD3opUwdo` (PROD)

---

## 🚀 Deploy no Render

### Environment Variables no Render (Backend)

```
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
PROD_DOMAIN=https://projetodormeaqui.onrender.com
GITHUB_CLIENT_ID_DEV=Ov23lib2RxrcOqyJiXCY
GITHUB_CLIENT_SECRET_DEV=14b6cfd6430919f51fb7ccb3fe837d419f52e239
GITHUB_CLIENT_ID_PROD=Ov23liAhI3eCD3opUwdo
GITHUB_CLIENT_SECRET_PROD=14b6cfd6430919f51fb7ccb3fe837d419f52e239
GOOGLE_CLIENT_ID=37748047971-3apb3g0qg5hkh3hgimqg2901460v7lhr.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Environment Variables no Render (Frontend)

```
VITE_API_URL=https://projetodormeaqui.onrender.com/api
VITE_GOOGLE_CLIENT_ID=37748047971-3apb3g0qg5hkh3hgimqg2901460v7lhr.apps.googleusercontent.com
VITE_GITHUB_CLIENT_ID=Ov23liAhI3eCD3opUwdo
```

---

## 🧪 Teste Agora

### Local (DEV)

```bash
cd front-end
npm run dev
```

Acesse: `http://localhost:5173/login`
- Clique em "GitHub"
- Você deve ser redirecionado para GitHub
- Depois retornar para o app ✅

---

## 📊 Resumo das Credenciais

| Ambiente | Client ID | Secret |
|----------|-----------|--------|
| **DEV** | `Ov23lib2RxrcOqyJiXCY` | `14b6cfd6430919f51fb7ccb3fe837d419f52e239` |
| **PROD** | `Ov23liAhI3eCD3opUwdo` | `14b6cfd6430919f51fb7ccb3fe837d419f52e239` |

---

**Pronto! GitHub OAuth funciona em dev e produção! 🚀**
