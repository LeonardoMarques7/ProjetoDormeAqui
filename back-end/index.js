import "dotenv/config";
import { app } from "./server.js";
import { connectPrisma } from "./config/prisma.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectPrisma();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
};

startServer();
