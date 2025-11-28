import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import fs from "fs";

// Carregar os dados do arquivo
const places = JSON.parse(
  fs.readFileSync("./places_double_quotes.json", "utf8")
);

// Converter os campos que precisam virar ObjectId()
const convertedPlaces = places.map((p) => ({
  ...p,
  _id: new ObjectId(p._id),
  owner: new ObjectId(p.owner),
}));

async function seed() {
  try {
    await mongoose.connect(
      "mongodb+srv://3c2pzAzbDwlsXgo6:TYBLYQ9E6QykoEFr@cluster0.1vl2i94.mongodb.net/DormeAqui?retryWrites=true&w=majority&appName=Cluster0"
    );

    console.log("Conectado ao MongoDB");

    await mongoose.connection.collection("places").insertMany(convertedPlaces);

    console.log("Seed feito com sucesso!");
    process.exit();
  } catch (err) {
    console.error("Erro ao fazer seed:", err);
    process.exit(1);
  }
}

seed();
