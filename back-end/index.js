import "dotenv/config";
import express from "express";

const app = express();
const { PORT } = process.env; 

app.get("/", (req, res) => [
    res.json("Hello World")
])

app.listen(PORT, () => {
    console.log(`Sevidor está ON em: ${PORT}`)
})