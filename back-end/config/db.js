// import "dotenv/config";

// import { setServers } from "node:dns/promises";
// setServers(["1.1.1.1", "8.8.8.8"]);
// import mongoose from "mongoose";

// const { MONGO_URL } = process.env

// export const connectDb = async () => {
//     try {
//         await mongoose.connect(MONGO_URL);
//         console.log("Tudo certo com a conexão ao banco!");
//     } catch (error) {
//         console.log("Erro encotrnado: ", error);
//     }
// }

let connectDb;

if (process.env.NODE_ENV === "production") {
  ({ connectDb } = await import("./db_prod.js"));
} else {
  ({ connectDb } = await import("./db_dev.js"));
}

export { connectDb };