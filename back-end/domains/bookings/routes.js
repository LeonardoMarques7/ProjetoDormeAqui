import { Router } from "express";
import { JWTVerify } from "../../ultis/jwt.js";
import { AUTH_COOKIE_NAME as COOKIE_NAME } from "../../security.js";
import {
  createBooking,
  getBookingById,
  getBookingByPaymentId,
  getHostBookings,
  getPlaceBookedDates,
  getPlaceBookings,
  getUserBookings,
  updateBookingStatus,
} from "../../prisma/repositories/bookings.repository.js";

const router = Router();

const mapProviderStatus = (status) => {
  const normalized = String(status || "").toLowerCase();
  return {
    approved: "approved",
    paid: "approved",
    pending: "pending",
    in_process: "pending",
    in_mediation: "pending",
    rejected: "rejected",
    cancelled: "rejected",
    refunded: "rejected",
    charged_back: "rejected",
  }[normalized] || "pending";
};

const requesterCanSeeBooking = (booking, requester) => {
  const requesterId = String(requester?._id || requester?.id || "");
  const guestId = String(booking?.user?._id || booking?.user?.id || booking?.guest?._id || "");
  const ownerId = String(booking?.place?.owner?._id || booking?.place?.owner?.id || booking?.place?.owner || "");
  return requesterId && (requesterId === guestId || requesterId === ownerId || ["admin", "moderator"].includes(requester?.role));
};

router.get("/owner", async (req, res) => {
  try {
    const { _id: id } = await JWTVerify(req, COOKIE_NAME);
    res.json(await getUserBookings(id));
  } catch (error) {
    console.error("Erro ao encontrar reservas do usuario:", error);
    res.status(500).json({ message: "Deu erro ao encontrar as reservas." });
  }
});

router.get("/host", async (req, res) => {
  try {
    const { _id: hostId } = await JWTVerify(req, COOKIE_NAME);
    res.json(await getHostBookings(hostId));
  } catch (error) {
    console.error("Erro ao encontrar reservas do anfitriao:", error);
    res.status(500).json({ message: "Deu erro ao encontrar as reservas do anfitriao." });
  }
});

router.get("/by-payment/:paymentId", async (req, res) => {
  try {
    const requester = await JWTVerify(req, COOKIE_NAME);
    const booking = await getBookingByPaymentId(req.params.paymentId);
    if (!booking) {
      return res.status(404).json({ message: "Reserva ainda nao encontrada para este pagamento." });
    }
    if (!requesterCanSeeBooking(booking, requester)) {
      return res.status(403).json({ message: "Voce nao tem permissao para consultar esta reserva." });
    }
    res.json(booking);
  } catch (error) {
    console.error("Erro ao buscar reserva pelo pagamento:", error);
    res.status(500).json({ message: "Deu erro ao buscar a reserva pelo pagamento." });
  }
});

router.get("/place/:id", async (req, res) => {
  try {
    const bookingDocs = await getPlaceBookings(req.params.id);
    res.json(bookingDocs.map((booking) => ({ checkin: booking.checkin, checkout: booking.checkout, status: booking.status })));
  } catch (error) {
    console.error("Erro ao encontrar reservas por acomodacao:", error);
    res.status(500).json({ message: "Deu erro ao encontrar as reservas." });
  }
});

router.get("/place/:id/booked-dates", async (req, res) => {
  try {
    res.json(await getPlaceBookedDates(req.params.id));
  } catch (error) {
    console.error("Erro ao buscar datas ocupadas:", error);
    res.status(500).json({ message: "Deu erro ao buscar datas ocupadas." });
  }
});

router.post("/", async (req, res) => {
  try {
    const authenticatedUser = await JWTVerify(req, COOKIE_NAME);
    const booking = await createBooking({ ...req.body, user: authenticatedUser._id });
    res.json(booking);
  } catch (error) {
    console.error("Erro ao criar reserva:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Erro interno do servidor ao criar reserva." });
  }
});

router.post("/from-payment", async (req, res) => {
  const { paymentId } = req.body;
  if (!paymentId) return res.status(400).json({ message: "paymentId e obrigatorio." });

  try {
    const requester = await JWTVerify(req, COOKIE_NAME);
    const existingBooking = await getBookingByPaymentId(paymentId);
    if (existingBooking) {
      if (!requesterCanSeeBooking(existingBooking, requester)) {
        return res.status(403).json({ message: "Voce nao tem permissao para consultar esta reserva." });
      }
      return res.status(200).json(existingBooking);
    }

    const { getPaymentInfo } = await import("../payments/service.js");
    const paymentInfo = await getPaymentInfo(paymentId);
    if (!paymentInfo?.metadata) {
      return res.status(400).json({ message: "Nao foi possivel obter informacoes do pagamento." });
    }

    const mappedStatus = mapProviderStatus(paymentInfo.status);
    if (mappedStatus !== "approved") {
      return res.status(400).json({ message: "Pagamento nao aprovado.", paymentStatus: mappedStatus });
    }

    const metadata = paymentInfo.metadata;
    const booking = await createBooking({
      place: metadata.accommodationId || metadata.accommodation_id,
      user: metadata.userId || metadata.user_id || requester._id,
      checkin: metadata.checkIn || metadata.check_in || metadata.checkin,
      checkout: metadata.checkOut || metadata.check_out || metadata.checkout,
      guests: metadata.guests || metadata.guest_count || 1,
    });

    res.status(200).json(booking);
  } catch (error) {
    console.error("Erro ao criar reserva a partir do pagamento:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Erro interno ao criar reserva a partir do pagamento." });
  }
});

router.get("/test/stripe-status", async (req, res) => {
  try {
    const { stripeClient, webhookSecret } = await import("../../config/stripe.js");
    res.json({
      stripConfigured: Boolean(stripeClient),
      webhookSecretConfigured: Boolean(webhookSecret),
      useStripe: process.env.USE_STRIPE === "true",
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    console.error("Erro ao verificar Stripe:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post("/test/simulate-webhook", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Endpoint nao disponivel em producao" });
  }

  try {
    const { checkIn, checkOut, accommodationId, userId, guests = 1 } = req.body;
    if (!checkIn || !checkOut || !accommodationId || !userId) {
      return res.status(400).json({ error: "Campos obrigatorios: checkIn, checkOut, accommodationId, userId" });
    }
    const booking = await createBooking({ place: accommodationId, user: userId, checkin: checkIn, checkout: checkOut, guests });
    res.json({ success: true, booking });
  } catch (error) {
    console.error("Erro ao simular webhook:", error.message);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post("/:id/cancel", async (req, res) => {
  try {
    const { _id: userId } = await JWTVerify(req, COOKIE_NAME);
    const booking = await getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Reserva nao encontrada." });
    if (String(booking.user?._id) !== String(userId)) {
      return res.status(403).json({ message: "Voce nao tem permissao para cancelar esta reserva." });
    }
    if (booking.status !== "confirmed") {
      return res.status(400).json({ message: `So e possivel cancelar reservas confirmadas. Status atual: ${booking.status}` });
    }

    const updatedBooking = await updateBookingStatus(req.params.id, "CANCELLED", {
      reason: "Cancelado pelo hospede",
      changedBy: userId,
    });
    res.status(200).json({ message: "Reserva cancelada com sucesso.", booking: updatedBooking });
  } catch (error) {
    console.error("Erro ao cancelar reserva:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Erro interno ao cancelar reserva." });
  }
});

router.post("/:id/transition", async (req, res) => {
  try {
    const { _id: userId, role } = await JWTVerify(req, COOKIE_NAME);
    if (!["admin", "moderator"].includes(role)) {
      return res.status(403).json({ message: "Permissao insuficiente." });
    }
    const updatedBooking = await updateBookingStatus(req.params.id, req.body.toStatus, {
      reason: req.body.reason || "",
      changedBy: userId,
    });
    if (!updatedBooking) return res.status(404).json({ message: "Reserva nao encontrada." });
    res.status(200).json({ message: `Status da reserva atualizado para '${req.body.toStatus}' com sucesso.`, booking: updatedBooking });
  } catch (error) {
    console.error("Erro ao transicionar status:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Erro interno ao transicionar status." });
  }
});

router.post("/:id/request-review", async (req, res) => {
  try {
    const { _id: userId, role } = await JWTVerify(req, COOKIE_NAME);
    if (!["admin", "moderator"].includes(role)) {
      return res.status(403).json({ message: "Permissao insuficiente." });
    }
    const updatedBooking = await updateBookingStatus(req.params.id, "REVIEW", {
      reason: req.body.reason || "Revisao solicitada",
      changedBy: userId,
    });
    if (!updatedBooking) return res.status(404).json({ message: "Reserva nao encontrada." });
    res.status(200).json({ message: "Revisao solicitada com sucesso.", booking: updatedBooking });
  } catch (error) {
    console.error("Erro ao solicitar revisao:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Erro interno ao solicitar revisao." });
  }
});

router.post("/:id/complete", async (req, res) => {
  try {
    const { _id: userId, role } = await JWTVerify(req, COOKIE_NAME);
    if (!["admin", "moderator"].includes(role)) {
      return res.status(403).json({ message: "Permissao insuficiente." });
    }
    const updatedBooking = await updateBookingStatus(req.params.id, "COMPLETED", { changedBy: userId });
    if (!updatedBooking) return res.status(404).json({ message: "Reserva nao encontrada." });
    res.status(200).json({ message: "Reserva finalizada com sucesso.", booking: updatedBooking });
  } catch (error) {
    console.error("Erro ao finalizar reserva:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Erro interno ao finalizar reserva." });
  }
});

export default router;
