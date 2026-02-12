# 🚀 Guia de Deploy para Produção

## ✅ Configuração Concluída

### Variáveis de Ambiente

**Backend (.env.production):**
```
FRONTEND_URL=https://projetodormeaqui.onrender.com
```

**Frontend (.env.production):**
```
VITE_API_URL=https://projetodormeaqui.onrender.com/api
```

### Redirect URIs para OAuth

#### Google OAuth
Você PRECISA adicionar estes Redirect URIs no Google Cloud Console:

1. Abra: https://console.cloud.google.com
2. Vá para **APIs & Services** → **Credentials**
3. Clique no seu **OAuth 2.0 Client ID** (Web application)
4. Em **Authorized redirect URIs**, adicione:

```
http://localhost:5173/auth/google/callback
https://projetodormeaqui.onrender.com/auth/google/callback
```

5. Clique **SAVE**

#### GitHub OAuth
GitHub provavelmente já tem registrado:
- `http://localhost:5173/auth/github/callback`
- Adicione também: `https://projetodormeaqui.onrender.com/auth/github/callback`

### Deploy no Render

#### Frontend
1. Push para GitHub
2. Render detecta automaticamente e faz build com `npm run build`
3. Usa `.env.production` automaticamente em produção

#### Backend
1. Push para GitHub
2. Render executa `npm install` e `npm start`
3. Usa `.env.production` automaticamente em produção

### Testando em Produção

```bash
# Teste o backend
curl https://projetodormeaqui.onrender.com/api/users

# Teste o frontend
https://projetodormeaqui.onrender.com/
```

## CORS e Cookies

### CORS já está configurado para:
- `http://localhost:5173` (desenvolvimento)
- `https://projetodormeaqui.onrender.com` (produção)

### Cookies
- **Desenvolvimento**: `sameSite: 'lax'`, `secure: false`
- **Produção**: `sameSite: 'none'`, `secure: true`, `httpOnly: true`

Tudo configurado automaticamente baseado em `NODE_ENV`.

## Próximos Passos

1. ✅ Adicione os Redirect URIs no Google Console
2. ✅ Faça push para GitHub
3. ✅ Render fará deploy automaticamente
4. ✅ Teste em: https://projetodormeaqui.onrender.com

## ⚠️ Importante

- **Não commite .env com credenciais reais** (use .env.local ou .env.production.local)
- **Use environment variables no Render Dashboard** se preferir não usar .env.production
- **Cookies HTTPS** já estão configurados para produção
