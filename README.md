<div align="center">

# 🏠 DormeAqui

### Plataforma Full Stack de Hospedagem — inspirada no Airbnb

[![Ver Online](https://img.shields.io/badge/Ver_Online-00C851?style=for-the-badge&logo=render&logoColor=white)](https://projetodormeaqui.onrender.com/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/leonardo-emanuel-3695451a0/)
[![Portfólio](https://img.shields.io/badge/Portfólio-000000?style=for-the-badge&logo=netlify&logoColor=white)](https://leonardomdev.netlify.app/)

</div>

---

## 📖 Sobre o Projeto

O **DormeAqui** é uma aplicação web full stack de hospedagem, construída do zero com foco em experiência do usuário, segurança e boas práticas de desenvolvimento. A plataforma permite que usuários cadastrem acomodações, realizem reservas e efetuem pagamentos de forma segura — cobrindo todo o fluxo de uma plataforma real de hospedagem.

> 🚀 Deploy em produção no **Render** (backend) e **Vercel** (frontend)

---

## ✨ Funcionalidades

| Funcionalidade | Detalhe |
|---|---|
| 🔐 Autenticação | JWT + Login social com Google e GitHub (OAuth2) |
| 🏡 Gestão de Acomodações | Criação, edição e remoção de imóveis |
| 🖼️ Upload de Imagens | Armazenamento via AWS S3 |
| 📅 Reservas | Sistema de reservas com seleção de datas e hóspedes |
| 💳 Pagamentos | Stripe · Mercado Pago (Checkout Transparente + PIX) |
| ⭐ Avaliações | Sistema de reviews por acomodação |
| 🔔 Notificações | Notificações em tempo real via WebSocket |
| 📧 E-mail | Envio de e-mails transacionais com Nodemailer |
| 🔑 Recuperação de Senha | Fluxo de reset de senha por e-mail |

---

## 🛠️ Stack Técnica

**Front-end**

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)

**Back-end**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express_v5-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

**Autenticação & Segurança**

![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![OAuth2](https://img.shields.io/badge/OAuth2-EB5424?style=for-the-badge&logo=auth0&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-003A70?style=for-the-badge&logo=letsencrypt&logoColor=white)

**Pagamentos**

![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![Mercado Pago](https://img.shields.io/badge/Mercado_Pago-009EE3?style=for-the-badge&logo=mercadopago&logoColor=white)

**Cloud & Ferramentas**

![AWS S3](https://img.shields.io/badge/AWS_S3-FF9900?style=for-the-badge&logo=amazons3&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

---

## 🚀 Instalação e Uso

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) (local ou Atlas)
- Contas configuradas: AWS S3, Google OAuth2, GitHub OAuth2, Stripe ou Mercado Pago

---

### 1. Clone o repositório

```bash
git clone https://github.com/LeonardoMarques7/ProjetoDormeAqui.git
cd ProjetoDormeAqui
```

---

### 2. Configure o Back-end

```bash
cd back-end
npm install
```

Crie o arquivo `.env` na pasta `back-end/` com as variáveis abaixo:

```env
# Banco de dados
MONGO_URL=mongodb://localhost:27017/dormeaqui

# JWT
JWT_SECRET=sua_chave_secreta

# OAuth2 - Google
GOOGLE_CLIENT_ID=seu_google_client_id
GOOGLE_CLIENT_SECRET=seu_google_client_secret

# OAuth2 - GitHub
GITHUB_CLIENT_ID=seu_github_client_id
GITHUB_CLIENT_SECRET=seu_github_client_secret

# AWS S3
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=nome_do_bucket

# E-mail (Nodemailer)
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app

# Pagamentos
STRIPE_SECRET_KEY=sk_test_...
MERCADO_PAGO_ACCESS_TOKEN=TEST-...
MERCADO_PAGO_WEBHOOK_URL=https://suaapi.com/api/webhooks/mercadopago

# URLs
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Inicie o servidor em modo desenvolvimento:

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:4000`.

---

### 3. Configure o Front-end

```bash
cd ../front-end
npm install
```

Crie o arquivo `.env` na pasta `front-end/` com as variáveis abaixo:

```env
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=seu_google_client_id
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

Inicie a aplicação:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

---

## 📂 Estrutura do Projeto

```
ProjetoDormeAqui/
├── back-end/
│   ├── config/          # Configurações de banco, Stripe e Mercado Pago
│   ├── domains/         # Módulos por domínio (users, places, bookings, payments, reviews)
│   ├── middleware/       # Middlewares de autenticação e validação
│   ├── routes/          # Rotas principais da API
│   ├── webhooks/        # Handlers de webhooks (Mercado Pago, Stripe)
│   └── index.js         # Ponto de entrada do servidor
└── front-end/
    └── src/
        ├── components/  # Componentes reutilizáveis
        ├── context/     # Contextos React (auth, notificações)
        ├── hooks/       # Hooks customizados
        ├── pages/       # Páginas da aplicação
        └── services/    # Integrações com a API
```

---

## 🌐 Deploy

| Serviço | Plataforma |
|---|---|
| Frontend | [Vercel](https://vercel.com/) |
| Backend | [Render](https://render.com/) |
| Banco de dados | [MongoDB Atlas](https://www.mongodb.com/atlas) |
| Imagens | [AWS S3](https://aws.amazon.com/s3/) |

[![Ver Online](https://img.shields.io/badge/Acessar_Aplicação-00C851?style=for-the-badge&logo=render&logoColor=white)](https://projetodormeaqui.onrender.com/)

---

## 📫 Contato

<div align="center">

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Vamos_conversar!-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/leonardo-emanuel-3695451a0/)
[![Portfólio](https://img.shields.io/badge/Portfólio-leonardomdev.netlify.app-000000?style=for-the-badge&logo=netlify&logoColor=white)](https://leonardomdev.netlify.app/)
[![Gmail](https://img.shields.io/badge/Email-leonardo.emcsantos@gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:leonardo.emcsantos@gmail.com)

</div>
