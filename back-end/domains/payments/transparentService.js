import * as stripeConfig from "../../config/stripe.js";
import { getPrismaClient } from "../../config/prisma.js";

const prisma = getPrismaClient();
const paymentClient = stripeConfig.paymentClient;
const stripeClient = stripeConfig.stripeClient;

async function getPlace(accommodationId) {
  return prisma.place.findFirst({
    where: {
      OR: [{ id: accommodationId }, { legacyMongoId: String(accommodationId) }],
      status: "ACTIVE",
    },
  });
}

async function hasBookingConflict(placeId, checkIn, checkOut) {
  const conflicts = await prisma.booking.count({
    where: {
      placeId,
      status: { notIn: ["CANCELLED", "REJECTED", "ARCHIVED"] },
      checkIn: { lt: new Date(checkOut) },
      checkOut: { gt: new Date(checkIn) },
    },
  });
  return conflicts > 0;
}

export const processTransparentPayment = async (data, user) => {
  try {
    const payer = data.payer || {};
    const accommodationId = data.accommodationId || data.accommodation_id;
    const checkIn = data.checkIn || data.check_in;
    const checkOut = data.checkOut || data.check_out;
    const guests = Number(data.guests || 1);
    const email = data.email || data.payerEmail || payer.email || user?.email;

    if (!accommodationId || !checkIn || !checkOut || !email) {
      return { success: false, message: "Dados incompletos para pagamento.", data };
    }

    const place = await getPlace(accommodationId);
    if (!place) {
      return { success: false, message: "Acomodacao nao encontrada." };
    }

    const checkinDate = new Date(checkIn);
    const checkoutDate = new Date(checkOut);
    if (Number.isNaN(checkinDate.getTime()) || Number.isNaN(checkoutDate.getTime())) {
      return { success: false, message: "Formato de data invalido para checkin/checkout." };
    }

    if (guests < 1 || guests > Number(place.maxGuests || 1)) {
      return { success: false, message: "Numero de hospedes invalido para esta acomodacao." };
    }

    if (await hasBookingConflict(place.id, checkinDate, checkoutDate)) {
      return { success: false, message: "Datas conflitantes com reservas existentes.", status: "conflict" };
    }

    const nights = Math.max(1, Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24)));
    const pricePerNight = Number(place.pricePerNight || 0);
    const totalPrice = pricePerNight * nights;
    const externalReference = `booking_${Date.now()}_${place.id}`;

    const response = await paymentClient.createPaymentIntent(
      {
        amount: Math.round(totalPrice * 100),
        currency: process.env.STRIPE_CURRENCY || "brl",
        payment_method_types: ["card"],
        capture_method: "automatic",
        description: `Reserva em ${place.title}`,
        metadata: {
          external_reference: externalReference,
          userId: user?._id?.toString() || "",
          userEmail: user?.email || email || "",
          accommodationId: String(place.id),
          guests: String(guests),
          nights: String(nights),
          totalPrice: String(totalPrice),
          pricePerNight: String(pricePerNight),
          checkIn: String(checkIn),
          checkOut: String(checkOut),
        },
      },
      { idempotencyKey: externalReference },
    );

    return {
      success: true,
      message: "PaymentIntent criado. Confirme o pagamento no frontend.",
      clientSecret: response.client_secret,
      paymentIntentId: response.id,
      status: response.status,
      payment: response,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Erro ao processar pagamento.",
      error: error.response?.data || error,
      status: error.response?.status || 500,
    };
  }
};

export const createCheckoutSession = async (data, user) => {
  try {
    const accommodationId = data.accommodationId || data.accommodation_id;
    const checkIn = data.checkIn || data.check_in;
    const checkOut = data.checkOut || data.check_out;
    const guests = Number(data.guests || 1);
    const email = data.email || data.payerEmail || user?.email;

    if (!accommodationId || !checkIn || !checkOut || !email) {
      return { success: false, message: "Dados incompletos para pagamento.", data };
    }

    const place = await getPlace(accommodationId);
    if (!place) {
      return { success: false, message: "Acomodacao nao encontrada." };
    }

    const checkinDate = new Date(checkIn);
    const checkoutDate = new Date(checkOut);
    if (Number.isNaN(checkinDate.getTime()) || Number.isNaN(checkoutDate.getTime())) {
      return { success: false, message: "Formato de data invalido para checkin/checkout." };
    }

    if (guests < 1 || guests > Number(place.maxGuests || 1)) {
      return { success: false, message: "Numero de hospedes invalido para esta acomodacao." };
    }

    if (await hasBookingConflict(place.id, checkinDate, checkoutDate)) {
      return { success: false, message: "Datas conflitantes com reservas existentes.", status: "conflict" };
    }

    if (!stripeClient) {
      return { success: false, message: "Stripe nao esta configurado no servidor." };
    }

    const nights = Math.max(1, Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24)));
    const pricePerNight = Number(place.pricePerNight || 0);
    const totalPrice = pricePerNight * nights;
    const frontendUrl = (process.env.FRONTEND_URL || "").replace(/\/$/, "");

    if (!frontendUrl) {
      return { success: false, message: "URL do frontend nao configurada. Defina FRONTEND_URL no backend." };
    }

    const supportsPix = process.env.STRIPE_SUPPORTS_PIX === "true";
    const paymentMethodTypes = ["card"];
    if (supportsPix) paymentMethodTypes.push("pix");

    const metadata = {
      userId: user?._id?.toString() || "",
      userEmail: user?.email || email || "",
      accommodationId: String(place.id),
      guests: String(guests),
      nights: String(nights),
      totalPrice: String(totalPrice),
      pricePerNight: String(pricePerNight),
      checkIn: String(checkIn),
      checkOut: String(checkOut),
    };

    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: paymentMethodTypes,
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: process.env.STRIPE_CURRENCY || "brl",
            product_data: {
              name: `Reserva: ${place.title}`,
              description: `${nights} noite(s) · Check-in: ${checkinDate.toLocaleDateString("pt-BR")} · Check-out: ${checkoutDate.toLocaleDateString("pt-BR")}`,
            },
            unit_amount: Math.round(totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      metadata,
      payment_intent_data: { metadata },
      payment_method_options: {
        card: { installments: { enabled: true } },
        ...(supportsPix ? { pix: { expires_after_seconds: 3600 } } : {}),
      },
      success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&status=succeeded`,
      cancel_url: `${frontendUrl}/places/${place.id}?cancelled=true`,
    });

    return { success: true, sessionId: session.id, sessionUrl: session.url };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Erro ao criar sessao de checkout.",
      error,
    };
  }
};
