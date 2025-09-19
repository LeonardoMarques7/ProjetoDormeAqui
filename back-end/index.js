import "dotenv/config";
import express from "express";
import UserRoutes from "./domains/users/routes.js";
import PlacesRoutes from "./domains/places/routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const { PORT } = process.env; 

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

app.use("/users", UserRoutes);
app.use("/places", PlacesRoutes);

app.listen(PORT, () => {
    console.log(`Sevidor está ON em: ${PORT}`)
})