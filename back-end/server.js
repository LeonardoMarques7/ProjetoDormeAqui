import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

export const app = express();

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

app.use(cookieParser()); // ANTES das rotas!
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
app.use("/tmp", express.static(__dirname + "/tmp"));
app.use(express.static(path.join(__dirname, "../front-end/dist")));
app.use("/api", routes);