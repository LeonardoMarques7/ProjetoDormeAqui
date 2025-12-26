import { Router } from "express";
import { __dirname } from "../../ultis/dirname.js";
import Booking from "./model.js";
import { connectDb } from "../../config/db.js";
import { JWTVerify } from "../../ultis/jwt.js";

connectDb();

const router = Router();


router.get("/owner", async (req, res) => {
  
  try {
    const { _id: id } = await JWTVerify(req);

    try {
      const bookingDocs = await Booking.find({ user: id })
    .sort({ createdAt: -1 }) // Ordena por check-in mais recente primeiro
    .populate({
        path: "place",
        populate: {
            path: "owner",     
            select: "name email avatar"
        }
    })
    .populate("user", "name email avatar");

res.json(bookingDocs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Deu erro ao encontrar as reservas.." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Deu erro ao validar token do usuário.." });
  }
});



router.post("/", async (req, res) => {

    const {place, user, price, priceTotal, checkin, checkout, guests, nights} = req.body;

    try {
        const newBookingDoc = await Booking.create({
            place, user, price, priceTotal, checkin, checkout, guests, nights
        })

        res.json(newBookingDoc);
    }
    catch (error) {
        res.status(500).json("Deu erro ao criar a reserva..",error);
        throw error;
    }
});


export default router;