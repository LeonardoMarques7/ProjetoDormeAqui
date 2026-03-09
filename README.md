# Fluxo de form step-by-step

Temos o projeto dormeaqui e na hora de criar um place/acomodação quero fazer estilo step-by-step mas quero ajuda para separar cada passo a passo por categoria tbmm eu tenho o meu componente ainda desmontado so com passos separados mas desorganizado, eu quero fazer de uma forma que torne leve e dinâmico, com categorias e perguntas simples e leves, me ajude a montar esse fluxo e depois eu vou programar em cima dele, olhe meu componente para entender todas as perguntas e categorias, e os novos inputs que ainda serão criados, mas já podem constar no nosso fluxo, quartos, banheiros e camas. Arquivo: NewPlace.jsx

# Checkout Transparente Mercado Pago

> Plataforma de hospedagem que conecta anfitriões e hóspedes para reservas de acomodações.

---

## 📌 Sobre o Projeto

**DormeAqui** é uma aplicação web full-stack de hospedagem que permite que usuários anunciem acomodações e que outros usuários realizem reservas de forma simples e segura. A plataforma oferece gerenciamento completo de listagens, sistema de reservas, avaliações e pagamento integrado com o Mercado Pago.

O projeto é voltado tanto para anfitriões que desejam disponibilizar espaços quanto para hóspedes que buscam acomodações com processo de reserva direto e pagamento transparente.

---

## 🚀 Funcionalidades

1. Instale a dependência Mercado Pago (caso não exista):
   ```bash
   npm install mercadopago
   ```
2. Adicione as variáveis de ambiente no `.env`:

   ```
   MERCADO_PAGO_ACCESS_TOKEN=SEU_TOKEN
   MERCADO_PAGO_WEBHOOK_URL=https://suaapi.com/api/webhooks/mercadopago (rota pública que o Mercado Pago deve chamar)
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```

3. Importe e use as rotas do checkout transparente:
   ```js
   import transparentRoutes from "./domains/payments/transparentRoutes.js";
   app.use("/api/payments", transparentRoutes);
   ```

### Frontend

| Tecnologia | Versão | Descrição |
|---|---|---|
| React | 19.x | Biblioteca principal de UI |
| TypeScript | 5.8 | Tipagem estática |
| Vite | 5.4 | Build tool e servidor de desenvolvimento |
| React Router | 6.x | Roteamento client-side |
| TailwindCSS | 4.x | Estilização utilitária |
| Mantine | — | Componentes de UI |
| Radix UI | — | Componentes acessíveis sem estilo |
| Framer Motion | — | Animações |
| React Hook Form + Zod | — | Formulários com validação |
| Embla Carousel | — | Carrosséis de imagens |
| GSAP | — | Animações avançadas |

### Backend

| Tecnologia | Versão | Descrição |
|---|---|---|
| Node.js | 18.x | Runtime JavaScript |
| Express | 5.1 | Framework web |
| Mongoose | 8.x | ODM para MongoDB |
| JSON Web Token (JWT) | — | Autenticação stateless |
| bcrypt | — | Hash de senhas |
| Multer | 2.x | Upload de arquivos |
| Nodemailer | 6.9 | Envio de e-mails |
| AWS SDK (S3) | — | Armazenamento de imagens |
| QRCode | — | Geração de QR Codes para Pix |

### Banco de Dados

| Tecnologia | Descrição |
|---|---|
| MongoDB | Banco de dados NoSQL principal |

### Integrações Externas

| Serviço | Descrição |
|---|---|
| Mercado Pago | Checkout transparente (cartão e Pix) |
| Google OAuth | Login social via Google |
| GitHub OAuth | Login social via GitHub |
| AWS S3 | Armazenamento de imagens das acomodações |
| SMTP (Gmail/outro) | Envio de e-mails transacionais |

---

## 📂 Estrutura de Pastas

```
ProjetoDormeAqui/
├── back-end/                    # Servidor Node.js/Express
│   ├── config/
│   │   ├── db.js                # Conexão com MongoDB
│   │   └── mercadopago.js       # Configuração do Mercado Pago
│   ├── middleware/
│   │   └── errorHandler.js      # Middleware de tratamento de erros
│   ├── routes/
│   │   └── index.js             # Registro de todas as rotas
│   ├── users/                   # Domínio de usuários (auth, perfil)
│   ├── places/                  # Domínio de acomodações
│   ├── bookings/                # Domínio de reservas
│   ├── reviews/                 # Domínio de avaliações
│   ├── payments/                # Domínio de pagamentos
│   ├── webhooks/
│   │   └── mercadopago.js       # Handler do webhook do Mercado Pago
│   ├── ultis/                   # Utilitários (jwt, imageDownloader, dirname)
│   ├── server.js                # Ponto de entrada do servidor
│   └── package.json
│
├── front-end/                   # Aplicação React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/            # Componentes de autenticação
│   │   │   ├── bookings/        # Componentes de reservas
│   │   │   ├── payments/        # Componentes de pagamento (Pix, cartão)
│   │   │   ├── places/          # Componentes de acomodações
│   │   │   └── ui/              # Componentes reutilizáveis de UI
│   │   ├── contexts/            # Context API (usuário, mensagens, modal de auth)
│   │   ├── pages/               # Páginas da aplicação
│   │   ├── services/            # Camada de chamadas à API
│   │   ├── App.jsx              # Definição de rotas
│   │   └── main.jsx             # Ponto de entrada
│   └── package.json
│
├── package.json                 # Scripts raiz (build/start)
└── README.md
```

---

## ⚙️ Como Rodar Localmente

### Pré-requisitos

- [Node.js 18+](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) (local ou Atlas)
- Conta no [Mercado Pago Developers](https://www.mercadopago.com.br/developers) (para pagamentos)
- Conta na AWS com bucket S3 configurado (para upload de imagens)

### 1. Clonar o repositório

```bash
git clone https://github.com/LeonardoMarques7/ProjetoDormeAqui.git
cd ProjetoDormeAqui
```

### 2. Instalar dependências

```bash
# Instala dependências do backend e do frontend e gera o build de produção do frontend
npm run build

# Ou instalar separadamente (apenas dependências):
cd back-end && npm install
cd ../front-end && npm install
```

### 3. Configurar variáveis de ambiente

Crie o arquivo `.env` dentro da pasta `back-end/`:

```bash
# Crie e preencha o arquivo .env com base na seção de variáveis abaixo
touch back-end/.env
```

### 4. Rodar o backend

```bash
cd back-end
npm start
# Servidor disponível em http://localhost:3000
```

### 5. Rodar o frontend

```bash
cd front-end
npm run dev
# Aplicação disponível em http://localhost:5173
```

> O frontend em modo de desenvolvimento faz proxy das chamadas `/api` para `http://localhost:3000` automaticamente via configuração do Vite.

---

## PIX (Checkout Transparente)

Foi adicionada a opção de pagamento via PIX usando a API do Mercado Pago.

- Endpoint backend: `POST /api/payments/pix` (autenticado) — cria pagamento PIX e retorna qr_code e qr_code_base64 quando disponível.
- Verificação de status: `GET /api/payments/status/:paymentId` (autenticado) — retorna status (approved, pending, rejected, etc.).

Como ativar e testar:

1. Ative o PIX na sua conta Mercado Pago e gere as credenciais necessárias.
2. Use o token de teste `TEST-...` para sandbox ou `APP_USR-...` em produção no `.env` (MERCADO_PAGO_ACCESS_TOKEN).
3. Configure `MERCADO_PAGO_WEBHOOK_URL` para receber notificações e atualizar status automaticamente.
4. Para testes manuais, chame `POST /api/payments/pix` enviando:
   ```json
   {
   	"accommodationId": "<id>",
   	"checkIn": "YYYY-MM-DD",
   	"checkOut": "YYYY-MM-DD",
   	"guests": 2,
   	"email": "cliente@example.com"
   }
   ```

Resposta esperada (success):

```json
{
	"success": true,
	"message": "Pagamento PIX criado com sucesso.",
	"paymentId": "123456789",
	"status": "pending",
	"qr_code": "000201...",
	"qr_code_base64": "<base64_png>"
}
```

Notas de segurança:

- Não armazene dados sensíveis de cartões no servidor sem tokenização pelo MercadoPago.js.
- Utilize webhooks para atualizar o status real do pagamento e confirmar reservas.

---
