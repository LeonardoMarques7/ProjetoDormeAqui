# Docker

Este setup sobe o backend e o PostgreSQL. Por padrao, as portas sao publicadas em `0.0.0.0` para permitir acesso local e remoto; em producao, restrinja o acesso ao Postgres no firewall/Coolify.

## Subir localmente

```bash
docker compose up -d postgres api
```

Defaults usados pelo Compose:

```env
API_PORT=4000
API_BIND_ADDRESS=0.0.0.0
POSTGRES_DB=dormeaqui
POSTGRES_USER=dormeaqui
POSTGRES_PASSWORD=dormeaqui_dev
POSTGRES_PORT=5433
POSTGRES_BIND_ADDRESS=0.0.0.0
```

Se quiser mudar algum valor, copie `.env.example` para `.env` na raiz do projeto e ajuste antes de subir o container.

## URLs de banco

Para acessar o banco da sua maquina local:

```env
DATABASE_URL=postgresql://dormeaqui:dormeaqui_dev@localhost:5433/dormeaqui?schema=public
```

Para o backend rodando dentro do Docker Compose ou Coolify:

```env
DATABASE_URL=postgresql://dormeaqui:dormeaqui_dev@postgres:5432/dormeaqui?schema=public
```

## Coolify

No Coolify, use este Compose com `api` e `postgres` na mesma stack. Configure o dominio no servico `api`, apontando para a porta interna `3000`.

O servico `api` carrega `./back-end/.env` quando usado localmente. No Coolify, configure as mesmas variaveis no painel de Environment Variables do servico/stack, principalmente:

- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_BUCKET`
- variaveis de OAuth, pagamentos e SMTP que voce usa em producao

Para o banco:

- mantenha `DATABASE_URL` usando o host `postgres`, que e o nome do servico na rede Docker;
- nao exponha a porta `5432` publicamente se o backend for o unico consumidor;
- para acesso remoto administrativo, prefira SSH tunnel/VPN do servidor;
- se expor o Postgres publicamente, use senha forte e restrinja a porta publicada, por padrao `5433`, no firewall por IP.

## Prisma

Com o container rodando, os comandos Prisma podem ser executados dentro da pasta `back-end` quando estiver usando o banco local:

```bash
npx prisma generate
npx prisma migrate dev
```

Em producao, use migrations sem modo interativo:

```bash
npx prisma migrate deploy
```

## Parar os containers

```bash
docker compose down
```

Para apagar tambem o volume local do PostgreSQL:

```bash
docker compose down -v
```
