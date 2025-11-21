import "dotenv/config";
import { app } from "./server.js";
import { connectDb } from "./config/db.js";

const { PORT } = process.env;

const startServer = async () => {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`Servidor está rodando na porta ${PORT}`);
  });
};

startServer();
