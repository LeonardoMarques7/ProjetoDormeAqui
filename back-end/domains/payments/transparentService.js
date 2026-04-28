import * as stripeConfig from "../../config/stripe.js"; // switched to Stripe wrapper (compatible interface)

import Place from "../places/model.js";
import Booking from "../bookings/model.js";

const paymentClient = stripeConfig.paymentClient;
const stripeClient = stripeConfig.stripeClient;

export const processTransparentPayment = async (data, user) => {
  console.log("🔹 Iniciando processamento do pagamento transparente...");

  try {
    // ==============================
    // SUPORTE CAMELCASE OU PAYER
    // ==============================
    const payer = data.payer || {};

    const accommodationId = data.accommodationId || data.accommodation_id;
    const checkIn = data.checkIn || data.check_in;
    const checkOut = data.checkOut || data.check_out;
    const guests = data.guests || 1;
    const token = data.token;

    const email = data.email || data.payerEmail || payer.email || user?.email;
    const paymentMethodId = data.paymentMethodId || data.payment_method_id;
    const issuerId = data.issuerId || data.issuer_id;
    const installments = Number(data.installments) || 1;

    const firstName = data.firstName || payer.first_name;
    const lastName = data.lastName || payer.last_name;

    const identificationType = data.identificationType || payer.identification?.type || "CPF";
    const identificationNumber = data.identificationNumber || payer.identification?.number;

    const phoneAreaCode = data.phoneAreaCode || payer.phone?.area_code || "11";
    const phoneNumber = data.phoneNumber || payer.phone?.number || "999999999";
    const streetNumber = data.streetNumber || payer.address?.street_number || "0";
    const zipCode = data.zipCode || payer.address?.zip_code || "";
    const street = data.street || payer.address?.street_name || "";

    const fullName = data.fullName || `${firstName || ""} ${lastName || ""}`.trim();

    // ==============================
    // VALIDACOES BASICAS
    // ==============================
    if (!accommodationId || !checkIn || !checkOut || !email) {
      console.error("❌ Dados incompletos para pagamento:", { data });
      return { success: false, message: "Dados incompletos para pagamento.", data };
    }

    const place = await Place.findById(accommodationId);
    if (!place) {
      console.error("❌ Acomodação não encontrada:", accommodationId);
      return { success: false, message: "Acomodação não encontrada." };
    }

    const checkinDate = new Date(checkIn);
    const checkoutDate = new Date(checkOut);

    if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime())) {
      console.error("❌ Formato de data inválido:", { checkIn, checkOut });
      return { success: false, message: "Formato de data inválido para checkin/checkout." };
    }

    const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24)) || 1;
    const pricePerNight = Number(place.price) || 0;
    const totalPrice = pricePerNight * nights;

    // MERCADO_PAGO_WEBHOOK_URL is only required for MercadoPago flows
    // (kept for legacy compatibility but not enforced when USE_STRIPE=true)

    // ==============================
    // CONFLITO DE RESERVA
    // ==============================
    // Support both Mongoose Query (with .limit()) and mocked arrays in tests
    let conflictingQuery = Booking.find({
      place: accommodationId,
      $or: [{ checkin: { $lt: checkoutDate }, checkout: { $gt: checkinDate } }],
    });

    let conflicting;
    if (conflictingQuery && typeof conflictingQuery.limit === 'function') {
      conflicting = await conflictingQuery.limit(1);
    } else {
      // In tests Booking.find may be a mocked function returning an array
      conflicting = await conflictingQuery;
      if (!Array.isArray(conflicting)) conflicting = [conflicting].filter(Boolean);
      conflicting = conflicting.slice(0,1);
    }

    if (conflicting?.length > 0) {
      console.warn("⚠️ Datas conflitantes com reservas existentes:", conflicting);
      return { success: false, message: "Datas conflitantes com reservas existentes.", status: "conflict" };
    }

    // ==============================
    // CRIAR PAYMENT INTENT NO STRIPE
    // ==============================
    // Standard Stripe flow: backend creates the PaymentIntent with metadata,
    // returns client_secret, and the frontend confirms the payment with the card data.
    // This keeps sensitive card data on the client (PCI-compliant).
    const externalReference = `booking_${Date.now()}_${accommodationId}`;

    const paymentData = {
      amount: Math.round(totalPrice * 100), // Stripe uses cents
      currency: process.env.STRIPE_CURRENCY || 'brl',
      payment_method_types: ['card'],
      capture_method: 'automatic',
      description: `Reserva em ${place.title}`,
      metadata: {
        external_reference: externalReference,
        userId: user?._id?.toString() || "",
        userEmail: user?.email || email || "",
        accommodationId: accommodationId?.toString() || "",
        guests: String(guests),
        nights: String(nights),
        totalPrice: String(totalPrice),
        pricePerNight: String(pricePerNight),
        checkIn: checkIn,
        checkOut: checkOut
      },
    };

    console.log("🔁 Criando PaymentIntent no Stripe:", JSON.stringify(paymentData, null, 2));

    const response = await paymentClient.createPaymentIntent(paymentData, { idempotencyKey: externalReference });
    console.log("💳 Stripe Response:", { id: response.id, status: response.status });

    console.log("🔁 Retornando client_secret para confirmação no frontend.");
    return {
      success: true,
      message: "PaymentIntent criado. Confirme o pagamento no frontend.",
      clientSecret: response.client_secret,
      paymentIntentId: response.id,
      status: response.status,
      payment: response
    };
  } catch (error) {
    console.error("❌ Erro ao processar pagamento:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || error.message || "Erro ao processar pagamento.", error: error.response?.data || error, status: error.response?.status || 500 };
  }
};

/**
 * Cria uma Stripe Checkout Session (hosted checkout).
 * O usuário é redirecionado para a página do Stripe para concluir o pagamento.
 * O webhook `checkout.session.completed` é responsável por criar a reserva.
 */
export const createCheckoutSession = async (data, user) => {
  console.log("🔹 Criando Stripe Checkout Session...");

  try {
    const accommodationId = data.accommodationId || data.accommodation_id;
    const checkIn = data.checkIn || data.check_in;
    const checkOut = data.checkOut || data.check_out;
    const guests = data.guests || 1;
    const email = data.email || data.payerEmail || user?.email;

    if (!accommodationId || !checkIn || !checkOut || !email) {
      console.error("❌ Dados incompletos para Checkout Session:", { data });
      return { success: false, message: "Dados incompletos para pagamento.", data };
    }

    const place = await Place.findById(accommodationId);
    if (!place) {
      console.error("❌ Acomodação não encontrada:", accommodationId);
      return { success: false, message: "Acomodação não encontrada." };
    }

    const checkinDate = new Date(checkIn);
    const checkoutDate = new Date(checkOut);

    if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime())) {
      console.error("❌ Formato de data inválido:", { checkIn, checkOut });
      return { success: false, message: "Formato de data inválido para checkin/checkout." };
    }

    const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24)) || 1;
    const pricePerNight = Number(place.price) || 0;
    const totalPrice = pricePerNight * nights;

    // Verifica conflito de datas antes de redirecionar o usuário
    let conflictingQuery = Booking.find({
      place: accommodationId,
      $or: [{ checkin: { $lt: checkoutDate }, checkout: { $gt: checkinDate } }],
    });

    let conflicting;
    if (conflictingQuery && typeof conflictingQuery.limit === "function") {
      conflicting = await conflictingQuery.limit(1);
    } else {
      conflicting = await conflictingQuery;
      if (!Array.isArray(conflicting)) conflicting = [conflicting].filter(Boolean);
      conflicting = conflicting.slice(0, 1);
    }

    if (conflicting?.length > 0) {
      console.warn("⚠️ Datas conflitantes ao criar Checkout Session:", conflicting);
      return { success: false, message: "Datas conflitantes com reservas existentes.", status: "conflict" };
    }

    if (!stripeClient) {
      return { success: false, message: "Stripe não está configurado no servidor." };
    }

    const frontendUrl = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
    if (!frontendUrl) {
      console.error("❌ FRONTEND_URL não configurado");
      return { success: false, message: "URL do frontend não configurada. Defina FRONTEND_URL no backend." };
    }

    // Metadata completa para criar a reserva no webhook
    const metadata = {
      userId: user?._id?.toString() || "",
      userEmail: user?.email || email || "",
      accommodationId: accommodationId?.toString() || "",
      guests: String(guests),
      nights: String(nights),
      totalPrice: String(totalPrice),
      pricePerNight: String(pricePerNight),
      checkIn: String(checkIn),
      checkOut: String(checkOut),
    };

    const supportsPix = process.env.STRIPE_SUPPORTS_PIX === "true";
    const paymentMethodTypes = ["card"];
    if (supportsPix) paymentMethodTypes.push("pix");

    const paymentMethodOptions = {
      // Habilita parcelado (installments) para cartão — disponível no Brasil
      card: {
        installments: { enabled: true },
      },
      // PIX expira em 1 hora se habilitado
      ...(supportsPix && { pix: { expires_after_seconds: 3600 } }),
    };

    console.log("🔁 Criando Checkout Session no Stripe:", JSON.stringify({ accommodationId, nights, totalPrice, supportsPix }, null, 2));

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
      // Propaga metadata ao PaymentIntent para compatibilidade com getPaymentInfo()
      payment_intent_data: { metadata },
      payment_method_options: paymentMethodOptions,
      success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}&status=succeeded`,
      cancel_url: `${frontendUrl}/places/${accommodationId}?cancelled=true`,
    });

    console.log("✅ Stripe Checkout Session criada:", session.id);
    return { success: true, sessionId: session.id, sessionUrl: session.url };
  } catch (error) {
    console.error("❌ Erro ao criar Checkout Session:", error.message);
    return {
      success: false,
      message: error.message || "Erro ao criar sessão de checkout.",
      error: error,
    };
  }
};
