import { Router } from "express";
import { __dirname } from "../../ultis/dirname.js";
import Booking from "./model.js";
import { JWTVerify } from "../../ultis/jwt.js";
import mongoose from "mongoose";

const router = Router();

// Configuração do cookie baseada no ambiente (igual ao users/routes.js)
const isProduction = process.env.NODE_ENV === 'production';
const COOKIE_NAME = isProduction ? 'prod_auth_token' : 'dev_auth_token';

router.get("/owner", async (req, res) => {

  try {
    const { _id: id } = await JWTVerify(req, COOKIE_NAME);

    try {
      // Primeiro, buscar todas as reservas do usuário
      const allBookings = await Booking.find({ user: id })
        .sort({ createdAt: -1 }) // Ordena por check-in mais recente primeiro
        .populate({
            path: "place",
            populate: {
                path: "owner",
                select: "name email avatar"
            }
        })
        .populate("user", "name email avatar");

      // Buscar avaliações do usuário
      const Review = (await import("../reviews/model.js")).default;
      const userReviews = await Review.find({ user: id }).select("booking");

      // Criar um set de IDs de reservas que já foram avaliadas
      const reviewedBookingIds = new Set(userReviews.map(review => review.booking.toString()));

      // Filtrar reservas que não foram avaliadas
      const bookingDocs = allBookings.filter(booking => !reviewedBookingIds.has(booking._id.toString()));

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
      .select('checkIn checkOut')
      .sort({ checkIn: 1 });

    // Extrair todas as datas ocupadas (de checkIn até checkOut, incluindo checkOut)
    const bookedDates = [];
    bookingDocs.forEach(booking => {
      const checkIn = booking.checkIn;
      const checkOut = booking.checkOut;

      // Adicionar todas as datas entre checkIn e checkOut (incluindo checkOut)
      for (let date = new Date(checkIn); date <= checkOut; date.setDate(date.getDate() + 1)) {
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
    const { place, user, pricePerNight, totalPrice, checkIn, checkOut, guests, nights } = req.body;


    // Iniciar sessão de transação para garantir atomicidade e prevenir conflitos de concorrência
    // Isso garante que apenas uma reserva seja criada por vez, mesmo com múltiplas requisições simultâneas
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Verificar se o usuário está desativado
        const User = (await import("../users/model.js")).default;
        const userDoc = await User.findById(user).session(session);

        if (!userDoc) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        if (userDoc.deactivated) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: "Conta desativada. Não é possível fazer novas reservas." });
        }

        // Buscar o lugar para obter os horários de check-in e check-out
        const Place = (await import("../places/model.js")).default;
        const placeDoc = await Place.findById(place).session(session);

        if (!placeDoc) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Lugar não encontrado." });
        }

        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);

        // Verificar se há reservas conflitantes dentro da transação
        // Esta verificação é feita atomicamente com a criação da reserva
        const conflictingBookings = await Booking.find({
            place: place,
            $or: [
                {
                    checkIn: { $lt: checkOutDate },
                    checkOut: { $gt: checkInDate }
                }
            ]
        }).session(session);

        if (conflictingBookings.length > 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({ message: "Datas conflitantes com reservas existentes. As datas selecionadas não estão disponíveis." });
        }

        // Validar intervalo mínimo entre check-out e check-in
        // Se o check-out for no mesmo dia ou próximo, verificar os horários
        const lastBooking = await Booking.findOne({ place: place }).sort({ checkOut: -1 }).session(session);
        if (lastBooking) {
            const lastCheckout = lastBooking.checkOut;
            const timeDiff = checkInDate.getTime() - lastCheckout.getTime();
            const hoursDiff = timeDiff / (1000 * 60 * 60);

            // Intervalo mínimo de 3 horas (ajustável)
            const minIntervalHours = 3;

            if (hoursDiff < minIntervalHours) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ message: `Intervalo mínimo de ${minIntervalHours} horas entre check-out e check-in não respeitado.` });
            }
        }

        // Criar a reserva dentro da transação
        const newBookingDoc = await Booking.create([{
            place, user, pricePerNight, totalPrice, checkIn: checkInDate, checkOut: checkOutDate, guests, nights
        }], { session });



        // Confirmar a transação
        await session.commitTransaction();
        session.endSession();

        res.json(newBookingDoc[0]);
    } catch (error) {
        // Em caso de erro, abortar a transação
        await session.abortTransaction();
        session.endSession();
        console.error("Erro ao criar reserva:", error);
        res.status(500).json({ message: "Erro interno do servidor ao criar reserva." });
    }
});


export default router;
