import "dotenv/config";
import mongoose from "mongoose";

const { MONGO_URL } = process.env

export const connectDb = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Tudo certo com a conexão ao banco!");
    } catch (error) {
        console.log("Erro encotrnado: ", error);
    }
}
