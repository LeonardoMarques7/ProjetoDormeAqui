import { Router } from "express";
import { __dirname } from "../../ultis/dirname.js";
import Booking from "./model.js";
import { JWTVerify } from "../../ultis/jwt.js";

const router = Router();

// Configuração do cookie baseada no ambiente (igual ao users/routes.js)
const isProduction = process.env.NODE_ENV === 'production';
const COOKIE_NAME = isProduction ? 'prod_auth_token' : 'dev_auth_token';

router.get("/owner", async (req, res) => {

  try {
    const { _id: id } = await JWTVerify(req, COOKIE_NAME);

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

router.get("/place/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const bookingDocs = await Booking.find({ place: id })
      .populate({
        path: "place",
      });

    res.json(bookingDocs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Deu erro ao encontrar as reservas.." });
  }
});

router.get("/place/:id/booked-dates", async (req, res) => {
  const { id } = req.params;

  try {
    const bookingDocs = await Booking.find({ place: id })
      .select('checkin checkout')
      .sort({ checkin: 1 });

    // Extrair todas as datas ocupadas (de checkin até checkout, incluindo checkout)
    const bookedDates = [];
    bookingDocs.forEach(booking => {
      const checkin = new Date(booking.checkin);
      const checkout = new Date(booking.checkout);

      // Adicionar todas as datas entre checkin e checkout (incluindo checkout)
      for (let date = new Date(checkin); date <= checkout; date.setDate(date.getDate() + 1)) {
        bookedDates.push(date.toISOString().split('T')[0]); // YYYY-MM-DD
      }
    });

    // Remover duplicatas
    const uniqueBookedDates = [...new Set(bookedDates)];

    res.json(uniqueBookedDates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Deu erro ao buscar datas ocupadas.." });
  }
});

router.post("/", async (req, res) => {

    const {place, user, price, priceTotal, checkin, checkout, guests, nights} = req.body;

    try {
        // Buscar o lugar para obter os horários de check-in e check-out
        const Place = (await import("../places/model.js")).default;
        const placeDoc = await Place.findById(place);

        if (!placeDoc) {
            return res.status(404).json({ message: "Lugar não encontrado." });
        }

        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);

        // Verificar se há reservas conflitantes
        const conflictingBookings = await Booking.find({
            place: place,
            $or: [
                {
                    checkin: { $lt: checkoutDate },
                    checkout: { $gt: checkinDate }
                }
            ]
        });

        if (conflictingBookings.length > 0) {
            return res.status(400).json({ message: "Datas conflitantes com reservas existentes." });
        }

        // Validar intervalo mínimo entre check-out e check-in
        // Se o check-out for no mesmo dia ou próximo, verificar os horários
        const lastBooking = await Booking.findOne({ place: place }).sort({ checkout: -1 });
        if (lastBooking) {
            const lastCheckout = new Date(lastBooking.checkout);
            const timeDiff = checkinDate.getTime() - lastCheckout.getTime();
            const hoursDiff = timeDiff / (1000 * 60 * 60);

            // Intervalo mínimo de 3 horas (ajustável)
            const minIntervalHours = 3;

            if (hoursDiff < minIntervalHours) {
                return res.status(400).json({ message: `Intervalo mínimo de ${minIntervalHours} horas entre check-out e check-in não respeitado.` });
            }
        }

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