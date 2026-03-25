import { Router } from "express";
import { __dirname } from "../../ultis/dirname.js";
import Booking from "./model.js";
import { JWTVerify } from "../../ultis/jwt.js";
import mongoose from "mongoose";
import * as transitionService from "./transitionService.js";

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

        if (!placeDoc.isActive) {
            await session.abortTransaction();
            session.endSession();
            return res.status(410).json({ message: "Lugar não está disponível." });
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
            console.error('❌ /from-payment: Não foi possível obter informações do pagamento', { paymentId });
            return res.status(400).json({ message: "Não foi possível obter informações do pagamento." });
        }

        const metadata = paymentInfo.metadata;

        // Normaliza campos da metadata (suporte a diferentes formatos)
        const userId = metadata.userId || metadata.user_id;
        const accommodationId = metadata.accommodationId || metadata.accommodation_id;
        let checkIn = metadata.checkIn || metadata.check_in || metadata.checkin;
        let checkOut = metadata.checkOut || metadata.check_out || metadata.checkout;
        const guests = parseInt(metadata.guests || metadata.guest_count || "1", 10) || 1;
        
        // 🔧 Parse de datas como strings
        if (typeof checkIn === 'string') {
            checkIn = new Date(checkIn);
        }
        if (typeof checkOut === 'string') {
            checkOut = new Date(checkOut);
        }

        const nights = parseInt(metadata.nights || Math.max(1, Math.ceil((checkOut - checkIn) / (1000*60*60*24))), 10);
        const priceTotal = parseFloat(metadata.priceTotal || metadata.totalPrice || 0) || 0;
        const pricePerNight = parseFloat(metadata.pricePerNight || metadata.price_per_night || 0) || 0;

        // Validação básica
        if (!userId || !accommodationId) {
            console.error('❌ /from-payment: Metadata incompleta', { userId, accommodationId, paymentId });
            return res.status(400).json({ message: "Metadata incompleta no pagamento." });
        }

        // IDEMPOTÊNCIA: verifica se existe reserva com esse paymentId
        const existingBooking = await Booking.findOne({ mercadopagoPaymentId: String(paymentId) });
        if (existingBooking) {
            const populatedBooking = await existingBooking.populate([
                {
                    path: "place",
                    populate: {
                        path: "owner",
                        select: "name email avatar"
                    }
                },
                {
                    path: "user",
                    select: "name email avatar"
                }
            ]);

            return res.status(200).json(populatedBooking);
        }

        // Verifica status do pagamento
        const mpRawStatus = (paymentInfo.status || "").toLowerCase();
        const mappedStatus = {
            "approved": "approved",
            "paid": "approved",
            "pending": "pending",
            "in_process": "pending",
            "in_mediation": "pending",
            "rejected": "rejected",
            "cancelled": "rejected",
            "canceled": "rejected",
            "refunded": "rejected",
            "charged_back": "rejected"
        }[mpRawStatus] || "pending";



        if (mappedStatus !== "approved") {
            // console.warn('/from-payment: Pagamento não aprovado', { paymentId, status: mpRawStatus, mapped: mappedStatus });
            return res.status(400).json({ 
                message: "Pagamento não aprovado.",
                paymentStatus: mappedStatus 
            });
        }

        // Criar a reserva
        const createdBooking = await Booking.createFromPayment({
            place: accommodationId,
            user: userId,
            pricePerNight,
            priceTotal,
            checkin: checkIn,
            checkout: checkOut,
            guests,
            nights,
            mercadopagoPaymentId: paymentId.toString(),
            paymentStatus: "approved",
        });

        console.log(`✅ /from-payment: Reserva criada com sucesso`, { bookingId: createdBooking._id, paymentId });
        return res.status(200).json(createdBooking);
    } catch (error) {
        // Propaga statusCode se definido na lógica do modelo
        if (error && error.statusCode) {
            console.error(`❌ /from-payment: Erro com status ${error.statusCode}`, { message: error.message });
            return res.status(error.statusCode).json({ message: error.message });
        }

        // Conflito de datas detectado no modelo
        if (error && error.message && error.message.toLowerCase().includes("datas conflitantes")) {
            console.warn('⚠️ /from-payment: Conflito de datas', { message: error.message });
            return res.status(409).json({ message: error.message });
        }

        console.error("❌ /from-payment: Erro ao criar reserva", error);
        return res.status(500).json({ message: "Erro interno ao criar reserva a partir do pagamento." });
    }
});

// ✅ Endpoint de teste para verificar se o webhook está funcionando
router.get("/test/stripe-status", async (req, res) => {
    try {
        const { stripeClient, webhookSecret } = await import("../../config/stripe.js");
        
        const status = {
            stripConfigured: !!stripeClient,
            webhookSecretConfigured: !!webhookSecret,
            useStripe: process.env.USE_STRIPE === 'true',
            environment: process.env.NODE_ENV || 'development',
        };

        console.log('🧪 Test endpoint: Stripe status check', status);
        return res.json(status);
    } catch (error) {
        console.error('❌ Test endpoint: Erro ao verificar Stripe', error.message);
        return res.status(500).json({ error: error.message });
    }
});

// ✅ Endpoint de teste para simular webhook (APENAS EM DESENVOLVIMENTO)
router.post("/test/simulate-webhook", async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: "Endpoint não disponível em produção" });
    }

    try {
        const { paymentIntentId, checkIn, checkOut, accommodationId, userId } = req.body;

        if (!paymentIntentId || !checkIn || !checkOut || !accommodationId || !userId) {
            return res.status(400).json({ 
                error: "Campos obrigatórios: paymentIntentId, checkIn, checkOut, accommodationId, userId" 
            });
        }

        // Simula um evento de webhook
        const fakeEvent = {
            type: 'checkout.session.completed',
            data: {
                object: {
                    object: 'checkout.session',
                    id: `cs_test_${Date.now()}`,
                    payment_intent: paymentIntentId,
                    payment_status: 'paid',
                    metadata: {
                        userId,
                        accommodationId,
                        checkIn,
                        checkOut,
                        guests: '1',
                        nights: '1',
                        totalPrice: '100',
                        pricePerNight: '100',
                    }
                }
            }
        };

        // Processa manualmente (igual ao webhook real)
        const { metadata, paymentId } = {
            metadata: fakeEvent.data.object.metadata,
            paymentId: fakeEvent.data.object.payment_intent
        };

        console.log('🧪 Simulando webhook:', { fakeEvent });

        const createdBooking = await Booking.createFromPayment({
            place: accommodationId,
            user: userId,
            pricePerNight: 100,
            priceTotal: 100,
            checkin: new Date(checkIn),
            checkout: new Date(checkOut),
            guests: 1,
            nights: 1,
            mercadopagoPaymentId: paymentId.toString(),
            paymentStatus: 'approved',
        });

        console.log(`✅ Webhook simulado: Reserva criada ${createdBooking._id}`);
        return res.json({ success: true, booking: createdBooking });
    } catch (error) {
        console.error('❌ Erro ao simular webhook:', error.message);
        return res.status(500).json({ error: error.message });
    }
});

// Endpoint para cancelar uma reserva aprovada e solicitar estorno ao Mercado Pago ou Stripe
router.post("/:id/cancel", async (req, res) => {
    try {
        const { _id: userId } = await JWTVerify(req, COOKIE_NAME);
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Reserva não encontrada." });
        }

        if (booking.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Você não tem permissão para cancelar esta reserva." });
        }

        // Validar que a reserva está confirmada
        if (booking.status !== "confirmed") {
            return res.status(400).json({ 
                message: `Só é possível cancelar reservas confirmadas. Status atual: ${booking.status}` 
            });
        }

        if (booking.mercadopagoPaymentId) {
            const paymentId = booking.mercadopagoPaymentId;

            // Detecta se é pagamento Stripe (PaymentIntent pi_... ou Checkout Session cs_...)
            const isStripe = paymentId.startsWith('pi_') || paymentId.startsWith('cs_');

            if (isStripe) {
                try {
                    const { paymentClient, stripeClient } = await import("../../config/stripe.js");

                    let paymentIntentId = paymentId;

                    // Se for uma Checkout Session, busca o PaymentIntent vinculado
                    if (paymentId.startsWith('cs_')) {
                        const session = await stripeClient.checkout.sessions.retrieve(paymentId);
                        paymentIntentId = session.payment_intent;
                        if (!paymentIntentId) {
                            throw new Error('Checkout Session não possui PaymentIntent associado para estorno.');
                        }
                    }

                    await paymentClient.refund({ payment_intent: paymentIntentId });
                    console.log(`Estorno Stripe solicitado para PaymentIntent: ${paymentIntentId} (reserva: ${booking._id})`);
                } catch (refundErr) {
                    console.error("Erro ao estornar no Stripe:", refundErr?.message);
                    return res.status(502).json({
                        message: "Erro ao solicitar estorno no Stripe. Tente novamente.",
                        error: refundErr?.message,
                    });
                }
            } else {
                // Pagamento via Mercado Pago
                try {
                    const { paymentClient: mpClient } = await import("../../config/mercadopago.js");

                    // Consulta estado atual no MP para decidir a ação correta:
                    // - authorized (capture=false): deve ser cancelado via PUT status=cancelled
                    // - approved (capture=true): deve ser estornado via POST /refunds
                    const mpPayment = await mpClient.get({ id: paymentId });
                    const mpStatus = mpPayment?.status;

                    if (mpStatus === "authorized" || mpStatus === "pending_capture") {
                        await mpClient.cancel({ id: paymentId });
                        console.log(`Pagamento ${paymentId} cancelado no MP (era ${mpStatus})`);
                    } else {
                        await mpClient.refund({ id: paymentId });
                        console.log(`Estorno solicitado para pagamento ${paymentId} (era ${mpStatus})`);
                    }
                } catch (refundErr) {
                    console.error("Erro ao cancelar/estornar no MP:", refundErr?.response?.data || refundErr?.message);
                    return res.status(502).json({
                        message: "Erro ao solicitar cancelamento/estorno no Mercado Pago. Tente novamente.",
                        error: refundErr?.response?.data?.message || refundErr?.message
                    });
                }
            }
        }

        // Usar o serviço de transição para atualizar o status
        try {
            const updatedBooking = await transitionService.cancelBooking(
                req.params.id,
                userId,
                "Cancelado pelo hóspede"
            );

            console.log(`Reserva ${booking._id} cancelada pelo usuário ${userId}`);
            return res.status(200).json({ 
                message: "Reserva cancelada e estorno solicitado com sucesso.", 
                booking: updatedBooking 
            });
        } catch (transitionError) {
            return res.status(transitionError.statusCode || 400).json({
                message: transitionError.message,
            });
        }
    } catch (error) {
        console.error("Erro ao cancelar reserva:", error);
        return res.status(500).json({ message: "Erro interno ao cancelar reserva." });
    }
});

// Endpoint para transicionar o status de uma reserva (moderador/admin)
router.post("/:id/transition", async (req, res) => {
    try {
        const { _id: userId } = await JWTVerify(req, COOKIE_NAME);
        const { toStatus, reason } = req.body;

        if (!toStatus) {
            return res.status(400).json({ message: "Campo 'toStatus' é obrigatório." });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Reserva não encontrada." });
        }

        try {
            const updatedBooking = await transitionService.transitionBookingStatus(
                req.params.id,
                toStatus,
                { reason: reason || "", changedBy: userId }
            );

            console.log(`Reserva ${req.params.id} transitou de ${booking.status} para ${toStatus} por ${userId}`);
            return res.status(200).json({
                message: `Status da reserva atualizado para '${toStatus}' com sucesso.`,
                booking: updatedBooking,
            });
        } catch (transitionError) {
            return res.status(transitionError.statusCode || 400).json({
                message: transitionError.message,
            });
        }
    } catch (error) {
        console.error("Erro ao transicionar status da reserva:", error);
        return res.status(500).json({ message: "Erro interno ao transicionar status." });
    }
});

// Endpoint para solicitar revisão de uma reserva (moderador)
router.post("/:id/request-review", async (req, res) => {
    try {
        const { _id: userId } = await JWTVerify(req, COOKIE_NAME);
        const { reason } = req.body;

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Reserva não encontrada." });
        }

        try {
            const updatedBooking = await transitionService.requestBookingReview(
                req.params.id,
                userId,
                reason || ""
            );

            console.log(`Revisão solicitada para reserva ${req.params.id} por ${userId}`);
            return res.status(200).json({
                message: "Revisão solicitada com sucesso.",
                booking: updatedBooking,
            });
        } catch (reviewError) {
            return res.status(reviewError.statusCode || 400).json({
                message: reviewError.message,
            });
        }
    } catch (error) {
        console.error("Erro ao solicitar revisão:", error);
        return res.status(500).json({ message: "Erro interno ao solicitar revisão." });
    }
});

// Endpoint para finalizar uma reserva (moderador)
router.post("/:id/complete", async (req, res) => {
    try {
        const { _id: userId } = await JWTVerify(req, COOKIE_NAME);

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Reserva não encontrada." });
        }

        try {
            const updatedBooking = await transitionService.completeBooking(
                req.params.id,
                userId
            );

            console.log(`Reserva ${req.params.id} finalizada por ${userId}`);
            return res.status(200).json({
                message: "Reserva finalizada com sucesso.",
                booking: updatedBooking,
            });
        } catch (completeError) {
            return res.status(completeError.statusCode || 400).json({
                message: completeError.message,
            });
        }
    } catch (error) {
        console.error("Erro ao finalizar reserva:", error);
        return res.status(500).json({ message: "Erro interno ao finalizar reserva." });
    }
});

export default router;
