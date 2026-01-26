import mongoose from "mongoose";
import { reviews } from "./reviews.seed.js";
import "dotenv/config";

const { MONGO_URL } = process.env;

async function seed() {
  try {
    await mongoose.connect(MONGO_URL);

    console.log("Conectado ao MongoDB");

    await mongoose.connection.collection("reviews").insertMany(reviews);

    console.log("Seed de reviews feito com sucesso!");
    process.exit();
  } catch (err) {
    console.error("Erro ao fazer seed:", err);
    process.exit(1);
  }
}

seed();
