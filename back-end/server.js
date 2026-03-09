import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import routes from "./routes/index.js";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import fs from "fs";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";


export const app = express();

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

// Ensure tmp directory exists
const tmpDir = path.join(__dirname, "tmp");
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
  console.log("📁 Tmp directory created:", tmpDir);
}

// Compressão gzip/deflate para reduzir tamanho das respostas
app.use(compression());

app.use(cookieParser());
app.use(express.json());

// CSP header to allow MercadoPago/mercadolibre connections required by SDK
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    `
    default-src 'self';

    connect-src
      'self'
      http://localhost:3000
      http://localhost:5173
      https://*.vercel.app
      https://accounts.google.com
      https://oauth2.googleapis.com
      https://api.mercadopago.com
      https://api-static.mercadopago.com
      https://secure-fields.mercadopago.com
      https://api.mercadolibre.com
      https://www.mercadolibre.com;

    script-src
      'self'
      'unsafe-inline'
      'unsafe-eval'
      https://accounts.google.com
      https://sdk.mercadopago.com;

    frame-src
      'self'
      https://www.google.com
      https://sdk.mercadopago.com
      https://api.mercadopago.com
      https://api-static.mercadopago.com
      https://secure-fields.mercadopago.com
      https://www.mercadolibre.com;

    img-src
      'self'
      data:
      https:;

    font-src
      'self'
      https://fonts.gstatic.com
      data:;

    style-src
      'self'
      'unsafe-inline'
      https://fonts.googleapis.com;
    `.replace(/\s{2,}/g, " ").trim()
  );

  next();
});

// Middleware de logging para debugar requisições
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Iniciando...`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});


app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
      ];
      // Permite qualquer subdomínio do Vercel
      if (!origin || allowedOrigins.includes(origin) || /^https:\/\/[^.]+\.vercel\.app$/.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Serve arquivos estáticos com cache de longa duração (1 ano) para assets com hash
app.use("/tmp", express.static(__dirname + "/tmp"));
app.use(
  express.static(path.join(__dirname, "../front-end/dist"), {
    maxAge: "1y",
    immutable: true,
    setHeaders(res, filePath) {
      // Para o index.html, não armazenar em cache (sempre buscar a versão mais recente)
      if (filePath.endsWith("index.html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      }
    },
  })
);

// Rotas da API
app.use("/api", routes);

// Handler para 404 em rotas de API
app.use((req, res, next) => {
  if (!req.path.startsWith("/api") && !req.path.startsWith("/tmp")) {
    res.sendFile(
      path.join(__dirname, "../front-end/dist/index.html")
    );
  } else {
    next();
  }
});


// Fallback para React Router - DEVE estar DEPOIS de todas as rotas
// Só serve o index.html se NÃO for uma rota de API ou arquivo estático
app.use((req, res, next) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/tmp')) {
    res.sendFile(path.join(__dirname, "../front-end/dist/index.html"));
  } else {
    next();
  }
});

// Handler para rotas de API não encontradas (404)
app.use("/api", notFoundHandler);

// Middleware de tratamento de erros (DEVE ser o último)
app.use(errorHandler);

// Configuração para evitar ERR_CONNECTION_RESET
app.use((req, res, next) => {
  res.setHeader('Connection', 'keep-alive');
  next();
});

