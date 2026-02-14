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
      .select('checkin checkout')
      .sort({ checkin: 1 });

    // Extrair todas as datas ocupadas (de checkin até checkout, incluindo checkout)
    const bookedDates = [];
    bookingDocs.forEach(booking => {
      const checkin = booking.checkin;
      const checkout = booking.checkout;

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
    const { place, user, pricePerNight, priceTotal, checkin, checkout, guests, nights } = req.body;


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

        const checkinDate = new Date(checkin);
        const checkoutDate = new Date(checkout);

        // Verificar se há reservas conflitantes dentro da transação
        // Esta verificação é feita atomicamente com a criação da reserva
        const conflictingBookings = await Booking.find({
            place: place,
            $or: [
                {
                    checkin: { $lt: checkoutDate },
                    checkout: { $gt: checkinDate }
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
        const lastBooking = await Booking.findOne({ place: place }).sort({ checkout: -1 }).session(session);
        if (lastBooking) {
            const lastCheckout = lastBooking.checkout;
            const timeDiff = checkinDate.getTime() - lastCheckout.getTime();
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
            place, user, pricePerNight, priceTotal, checkin: checkinDate, checkout: checkoutDate, guests, nights
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


// Endpoint para criar/confirmar booking a partir de um paymentId (idempotente)
router.post("/from-payment", async (req, res) => {
    const { paymentId } = req.body;

    if (!paymentId) {
        return res.status(400).json({ message: "paymentId é obrigatório." });
    }

    try {
        const { getPaymentInfo } = await import("../payments/service.js");
        const paymentInfo = await getPaymentInfo(paymentId);

        if (!paymentInfo || !paymentInfo.metadata) {
            return res.status(400).json({ message: "Não foi possível obter informações do pagamento." });
        }

        const metadata = paymentInfo.metadata;

        // Normaliza campos da metadata (suporte a diferentes formatos)
        const userId = metadata.userId || metadata.user_id || (metadata.payer && metadata.payer.id);
        const accommodationId = metadata.accommodationId || metadata.accommodation_id || metadata.id;
        const checkin = metadata.checkin || metadata.checkin || metadata.check_in;
        const checkout = metadata.checkout || metadata.checkout || metadata.check_out;
        const guests = parseInt(metadata.guests || metadata.guest_count || "1", 10) || 1;
        const nights = parseInt(metadata.nights || Math.max(1, Math.ceil((new Date(checkout) - new Date(checkin)) / (1000*60*60*24))), 10);
        const priceTotal = parseFloat(metadata.priceTotal || metadata.total_price || 0) || 0;
        const pricePerNight = parseFloat(metadata.pricePerNight || metadata.price_per_night || 0) || 0;

        const mapPaymentStatus = (mpStatus) => {
            const statusMap = {
                "approved": "approved",
                "pending": "pending",
                "in_process": "pending",
                "in_mediation": "pending",
                "rejected": "rejected",
                "cancelled": "rejected",
                "refunded": "rejected",
                "charged_back": "rejected"
            };
            return statusMap[(mpStatus || "").toLowerCase()] || "pending";
        };

        const paymentStatus = mapPaymentStatus(paymentInfo.status || paymentInfo.payment?.status || "");

        // IDEMPOTÊNCIA: verifica se existe reserva com esse paymentId
        const existingBooking = await Booking.findOne({ mercadopagoPaymentId: String(paymentId) });
        if (existingBooking) {
            return res.status(200).json(existingBooking);
        }

        if (paymentStatus === "rejected") {
            return res.status(400).json({ message: "Pagamento não aprovado, reserva não criada", paymentStatus });
        }

        // Delega criação ao modelo (que encapsula a transação e validações)
        const newBooking = await Booking.createFromPayment({
            place: accommodationId,
            user: userId,
            pricePerNight: pricePerNight,
            priceTotal: priceTotal,
            checkin,
            checkout,
            guests,
            nights,
            mercadopagoPaymentId: String(paymentId),
            paymentStatus
        });

        return res.status(200).json(newBooking);
    } catch (error) {
        // Propaga statusCode se definido na lógica do modelo
        if (error && error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message });
        }

        // Conflito de datas detectado no modelo
        if (error && error.message && error.message.toLowerCase().includes("datas conflitantes")) {
            return res.status(409).json({ message: error.message });
        }

        console.error("Erro ao criar reserva a partir do pagamento:", error);
        return res.status(500).json({ message: "Erro interno ao criar reserva a partir do pagamento." });
    }
});

export default router;
