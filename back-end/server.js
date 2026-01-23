import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

export const app = express();

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://projetodormeaqui.onrender.com"
    ],
    credentials: true,
  })
);

// Serve arquivos estáticos
app.use("/tmp", express.static(__dirname + "/tmp"));
app.use(express.static(path.join(__dirname, "../front-end/dist")));

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
