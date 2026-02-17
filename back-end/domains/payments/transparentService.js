import { paymentClient } from "../../config/mercadopago.js";
import Place from "../places/model.js";
import Booking from "../bookings/model.js";

export const processTransparentPayment = async (data, user) => {
  const {
    accommodationId,
    checkIn,
    checkOut,
    guests,
    token,
    email,
    paymentMethodId,
    issuerId,
    installments,
    identificationType,
    identificationNumber,
  } = data;

  // Valida campos obrigatórios
  if (
    !accommodationId ||
    !checkIn ||
    !checkOut ||
    !guests ||
    !token ||
    !email ||
    !paymentMethodId
  ) {
    return { success: false, message: "Dados incompletos para pagamento." };
  }

  // Busca a acomodação
  const place = await Place.findById(accommodationId);
  if (!place) {
    return { success: false, message: "Acomodação não encontrada." };
  }

  const checkinDate = new Date(checkIn);
  const checkoutDate = new Date(checkOut);

  if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime())) {
    return { success: false, message: "Formato de data inválido para checkin/checkout." };
  }

  const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24)) || 1;
  const totalPrice = place.price * nights;

  const itemCategoryId = process.env.MERCADO_PAGO_ITEM_CATEGORY_ID || "lodging";
  const externalReference = `booking_${Date.now()}_${accommodationId}`;

  if (!process.env.MERCADO_PAGO_WEBHOOK_URL) {
    return {
      success: false,
      message: "MERCADO_PAGO_WEBHOOK_URL nao configurado para webhook.",
    };
  }

  // Verifica conflitos de reservas antes de criar o pagamento
  const conflicting = await Booking.find({
    place: accommodationId,
    $or: [{ checkin: { $lt: checkoutDate }, checkout: { $gt: checkinDate } }],
  }).limit(1);

  if (conflicting && conflicting.length > 0) {
    return {
      success: false,
      message: "Datas conflitantes com reservas existentes. As datas selecionadas não estão disponíveis.",
      status: "conflict",
    };
  }

  try {
    // Prepara dados para pagamento
    const paymentData = {
      transaction_amount: Number(totalPrice),
      token,
      description: `Reserva em ${place.title}`,
      installments: Number(installments) || 1,
      payment_method_id: paymentMethodId,
      issuer_id: issuerId,
      payer: {
        email,
        identification: {
          type: identificationType,
          number: identificationNumber,
        },
      },
      additional_info: {
        items: [
          {
            id: accommodationId,
            title: place.title,
            description: place.description,
            quantity: 1,
            unit_price: Number(totalPrice),
            category_id: itemCategoryId,
          },
        ],
      },
      notification_url: process.env.MERCADO_PAGO_WEBHOOK_URL,
      external_reference: externalReference,
      metadata: {
        userId: user?._id?.toString() || "",
        accommodationId: accommodationId.toString(),
        checkIn,
        checkOut,
        guests: guests.toString(),
        nights: nights.toString(),
        totalPrice: totalPrice.toString(),
        pricePerNight: place.price.toString(),
      },
      capture: false, // captura automática
    };

    console.log(
      "🔁 Enviando paymentData para Mercado Pago (pre-autorização):",
      JSON.stringify(paymentData, null, 2)
    );

    console.log("=== MP CREATE INPUT CHECK ===");
  console.log({
    paymentMethodId,
    issuerId,
    installments,
    capture: false,
    tokenPresent: !!token
  });

    const response = await paymentClient.create({ body: paymentData });

    console.log("=== MP CREATE RESULT ===");
    console.log({
      id: response.id,
      status: response.status,
      status_detail: response.status_detail,
      captured: response.captured,
      capture_requested: paymentData.capture,
      payment_method_id: response.payment_method_id,
      issuer_id: response.issuer_id
    });

    console.log("MP RAW RESPONSE:", JSON.stringify(response, null, 2));

    const paymentStatus = String(response.status).toLowerCase();

    // Não criar reserva de forma síncrona aqui — confirmação e criação ficam a cargo do webhook do Mercado Pago

    if (paymentStatus === "approved") {
      // Retornar sucesso informando que pagamento está aprovado, mas a reserva será criada quando o webhook confirmar e persistir o paymentId
      return {
        success: true,
        message: "Pagamento aprovado. Reserva será criada após confirmação via webhook.",
        status: response?.status || "approved",
        payment: response,
      };
    }

    if (["authorized","pending_capture"].includes(paymentStatus)) {
      return {
        success: false,
        message: "Pagamento autorizado, pendente de captura. Reserva será criada somente após confirmação via webhook.",
        status: paymentStatus,
        payment: response,
      };
    }

    if (paymentStatus === "pending") {
      return {
        success: false,
        message: "Pagamento pendente. Reserva será criada somente após confirmação via webhook.",
        status: paymentStatus,
        payment: response,
      };
    }

    // Pagamento rejeitado ou outro status
    return {
      success: false,
      message: "Pagamento não autorizado. Reserva não criada.",
      status: paymentStatus,
      status_detail: response.status_detail,
      payment: response,
    };
  } catch (error) {
    console.error(
      "❌ Erro ao criar pagamento (pre-autorização):",
      error.response?.data || error.message
    );

    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Erro ao processar pagamento.",
      error: error.response?.data || error,
      status: error.response?.status || 500,
    };
  }
};
