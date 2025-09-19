import { Router } from "express";
import { connectDb } from "../../config/db.js";
import Place from "./model.js";
import { JWTVerify } from "../../ultis/jwt.js";

const router = Router();

router.post("/", async (req, res) => {
  connectDb();

  const { title, city, photos, description, extras, perks, price, checkin, checkout, guests } = req.body;

  try {
    const { _id } = await JWTVerify(req);
    const newPlaceDoc = await Place.create({
        owner: _id,
        title,
        city,
        photos,
        description,
        extras,
        perks,
        price,
        checkin,
        checkout,
        guests
    });

    res.json(newPlaceDoc);

    } catch (error) {
        res.status(500).json("Deu erro ao criar novo lugar..",error);
        throw error;
    }
});

export default router;