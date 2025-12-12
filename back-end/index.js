import "dotenv/config";
import { app } from "./server.js";
import { connectDb } from "./config/db.js";

const { PORT } = process.env;

const startServer = async () => {
  await connectDb();
  app.listen(3000, "0.0.0.0", () => {
  console.log("Servidor rodando em http://0.0.0.0:3000");
});
};

startServer();
