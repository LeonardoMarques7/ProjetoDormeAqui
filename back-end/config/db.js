import "dotenv/config";
import mongoose from "mongoose";

const { MONGO_URL } = process.env

try {
    mongoose.connect(MONGO_URL);
    console.log("Tudo certo com a conexão ao banco!");
} catch (error) {
    console.log("Erro encotrnado: ", error);
}