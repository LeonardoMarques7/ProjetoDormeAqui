# DormeAqui

> Plataforma de hospedagem que conecta anfitriões e hóspedes para reservas de acomodações.

---

## 📌 Sobre o Projeto

**DormeAqui** é uma aplicação web full-stack de hospedagem que permite que usuários anunciem acomodações e que outros usuários realizem reservas de forma simples e segura. A plataforma oferece gerenciamento completo de listagens, sistema de reservas, avaliações e pagamento integrado com o Mercado Pago.

O projeto é voltado tanto para anfitriões que desejam disponibilizar espaços quanto para hóspedes que buscam acomodações com processo de reserva direto e pagamento transparente.

---

## 🚀 Funcionalidades

- **Autenticação de usuários** — cadastro, login, recuperação de senha e autenticação via OAuth (Google e GitHub)
- **Gerenciamento de acomodações** — criação, edição, remoção e listagem de lugares com upload de fotos
- **Sistema de reservas** — criação, visualização e cancelamento de reservas
- **Avaliações** — hóspedes e anfitriões podem deixar avaliações após estadias
- **Pagamento integrado** — checkout transparente com cartão de crédito/débito e Pix via Mercado Pago
- **Webhook de pagamento** — processamento assíncrono de notificações do Mercado Pago
- **Envio de e-mails** — notificações transacionais via SMTP (ex: redefinição de senha)
- **Upload de imagens** — armazenamento de fotos de acomodações via AWS S3
- **Interface responsiva** — layout adaptado para mobile e desktop

---

## 🛠 Tecnologias Utilizadas

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

## 🔐 Variáveis de Ambiente

Crie o arquivo `back-end/.env` com as seguintes variáveis:

| Variável | Obrigatória | Descrição |
|---|---|---|
| `PORT` | Não | Porta do servidor (padrão: `3000`) |
| `NODE_ENV` | Não | Ambiente de execução (`development` ou `production`) |
| `MONGO_URL` | ✅ | String de conexão do MongoDB |
| `JWT_SECRET_KEY` | ✅ | Chave secreta para assinar tokens JWT |
| `FRONTEND_URL` | Não | URL do frontend (padrão: `http://localhost:5173`) |
| `PROD_DOMAIN` | Não | Domínio de produção da aplicação |
| `MERCADO_PAGO_ACCESS_TOKEN` | ✅ | Token de acesso do Mercado Pago (`TEST-...` ou `APP_USR-...`) |
| `MERCADO_PAGO_WEBHOOK_URL` | Não | URL pública para recebimento de webhooks do Mercado Pago |
| `MERCADO_PAGO_API_URL` | Não | URL da API do MP (padrão: `https://api.mercadopago.com`) |
| `MERCADO_PAGO_ITEM_CATEGORY_ID` | Não | Categoria do item no MP (padrão: `lodging`) |
| `GOOGLE_CLIENT_ID` | Não | Client ID do OAuth do Google |
| `GOOGLE_CLIENT_SECRET` | Não | Client Secret do OAuth do Google |
| `GITHUB_CLIENT_ID_DEV` | Não | Client ID do OAuth do GitHub (desenvolvimento) |
| `GITHUB_CLIENT_SECRET_DEV` | Não | Client Secret do OAuth do GitHub (desenvolvimento) |
| `GITHUB_CLIENT_ID_PROD` | Não | Client ID do OAuth do GitHub (produção) |
| `GITHUB_CLIENT_SECRET_PROD` | Não | Client Secret do OAuth do GitHub (produção) |
| `BUCKET` | Não | Nome do bucket AWS S3 para armazenamento de imagens |
| `SMTP_HOST` | Não | Host do servidor SMTP (padrão: `smtp.gmail.com`) |
| `SMTP_PORT` | Não | Porta SMTP (padrão: `587`) |
| `SMTP_USER` | Não | Usuário/e-mail SMTP |
| `SMTP_PASS` | Não | Senha ou app password do SMTP |

**Exemplo de arquivo `.env` mínimo para desenvolvimento:**

```env
MONGO_URL=mongodb://localhost:27017/dormeaqui
JWT_SECRET_KEY=sua_chave_secreta_aqui
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxx
```

---

## 💳 Integrações

### Mercado Pago

O projeto utiliza integração direta com a API REST do Mercado Pago (sem SDK oficial), permitindo:

- **Checkout Transparente com Cartão** — fluxo de autorização e captura. Para crédito, o pagamento é autorizado e capturado posteriormente; para débito, a aprovação é imediata.
- **Pix** — geração de QR Code e código copia-e-cola com polling de status para confirmar o pagamento.
- **Parcelamento** — suporte a parcelamento detectado automaticamente pelo Mercado Pago.
- **Webhook** — endpoint público para receber notificações assíncronas de mudança de status dos pagamentos.

As URLs de retorno (`back_urls`) são configuradas automaticamente com base nas variáveis `FRONTEND_URL` / `PROD_DOMAIN`.

**Endpoints de Webhook:**

```
POST /api/webhook/mercadopago
POST /api/webhooks/mercadopago
```

### AWS S3

Imagens das acomodações são enviadas via Multer e armazenadas diretamente em um bucket S3. Configure a variável `BUCKET` com o nome do bucket e garanta que as credenciais AWS estejam disponíveis no ambiente (via variáveis `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` ou IAM role).

### OAuth (Google e GitHub)

Login social disponível via Google e GitHub. Configure as variáveis de OAuth correspondentes no painel de desenvolvedores de cada plataforma e defina as URLs de callback:

- **Google:** `{BACKEND_URL}/api/users/auth/google/callback`
- **GitHub:** `{BACKEND_URL}/api/users/auth/github/callback`

---

## 📈 Melhorias Futuras

- [ ] **Mapa interativo** — exibição de acomodações em mapa com filtro por localização
- [ ] **Sistema de mensagens** — chat em tempo real entre hóspede e anfitrião
- [ ] **Painel do anfitrião** — dashboard com métricas de ocupação, receita e avaliações
- [ ] **Filtros avançados de busca** — filtrar por preço, comodidades, tipo de acomodação e datas
- [ ] **Notificações push** — alertas de novas reservas e mensagens
- [ ] **App mobile** — versão React Native ou PWA
- [ ] **Suporte a múltiplos idiomas** — internacionalização (i18n)
- [ ] **Testes end-to-end** — cobertura com Playwright ou Cypress
- [ ] **CI/CD completo** — deploy automatizado para produção
- [ ] **Cache** — uso de Redis para cache de listagens e sessões

---

## 📄 Licença

Este projeto está sob licença privada. Todos os direitos reservados.

---

<p align="center">Desenvolvido por <a href="https://github.com/LeonardoMarques7">Leonardo Marques</a></p>
