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
    fullName,
    phoneAreaCode,
    phoneNumber,
    zipCode,
    street,
    streetNumber,
  } = data;

  // ==============================
  // VALIDACOES BASICAS
  // ==============================
  if (
    !accommodationId ||
    !checkIn ||
    !checkOut ||
    !guests ||
    !token ||
    !email ||
    !paymentMethodId ||
    !fullName ||
    !identificationNumber
  ) {
    return { success: false, message: "Dados incompletos para pagamento." };
  }

  // ==============================
  // SPLIT NOME COMPLETO
  // ==============================
  const nameParts = String(fullName).trim().split(" ");
  const firstName = nameParts.shift() || fullName;
  const lastName = nameParts.join(" ") || ".";

  // ==============================
  // BUSCA ACOMODACAO
  // ==============================
  const place = await Place.findById(accommodationId);
  if (!place) {
    return { success: false, message: "Acomodação não encontrada." };
  }

  const checkinDate = new Date(checkIn);
  const checkoutDate = new Date(checkOut);

  if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime())) {
    return {
      success: false,
      message: "Formato de data inválido para checkin/checkout.",
    };
  }

  const nights =
    Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24)) || 1;
  const totalPrice = Number(place.price) * nights;

  const itemCategoryId =
    process.env.MERCADO_PAGO_ITEM_CATEGORY_ID || "lodging";
  const externalReference = `booking_${Date.now()}_${accommodationId}`;

  if (!process.env.MERCADO_PAGO_WEBHOOK_URL) {
    return {
      success: false,
      message: "MERCADO_PAGO_WEBHOOK_URL nao configurado para webhook.",
    };
  }

  // ==============================
  // CONFLITO RESERVA
  // ==============================
  const conflicting = await Booking.find({
    place: accommodationId,
    $or: [{ checkin: { $lt: checkoutDate }, checkout: { $gt: checkinDate } }],
  }).limit(1);

  if (conflicting?.length > 0) {
    return {
      success: false,
      message:
        "Datas conflitantes com reservas existentes. As datas selecionadas não estão disponíveis.",
      status: "conflict",
    };
  }

  try {
    // ==============================
    // PAYMENT DATA CORRIGIDO
    // ==============================
    const paymentData = {
      transaction_amount: Number(totalPrice),
      token,
      description: `Reserva em ${place.title}`,
      installments: Number(installments) || 1,
      payment_method_id: paymentMethodId,
      issuer_id: issuerId,

      payer: {
        email,
        first_name: firstName,
        last_name: lastName,
        identification: {
          type: identificationType || "CPF",
          number: identificationNumber,
        },
      },

      additional_info: {
        payer: {
          first_name: firstName,
          last_name: lastName,
          phone: {
            area_code: phoneAreaCode || "11",
            number: phoneNumber || "999999999",
          },
          address: {
            zip_code: zipCode || "00000000",
            street_name: street || "Rua",
            street_number: streetNumber || 0,
          },
        },
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

      capture: false,
    };

    console.log(
      "🔁 Enviando paymentData MP:",
      JSON.stringify(paymentData, null, 2)
    );

    const response = await paymentClient.create({ body: paymentData });

    console.log("MP STATUS:", response.status, response.status_detail);

    const paymentStatus = String(response.status).toLowerCase();

    // ==============================
    // STATUS HANDLING CORRETO
    // ==============================

    if (paymentStatus === "approved") {
      return {
        success: true,
        message:
          "Pagamento aprovado. Reserva será criada após confirmação via webhook.",
        status: response.status,
        payment: response,
      };
    }

    if (["authorized", "pending_capture"].includes(paymentStatus)) {
      return {
        success: false,
        message:
          "Pagamento autorizado e aguardando captura. Reserva será criada após webhook.",
        status: paymentStatus,
        payment: response,
      };
    }

    if (paymentStatus === "pending") {
      return {
        success: false,
        message:
          "Pagamento pendente. Reserva será criada após confirmação do pagamento.",
        status: paymentStatus,
        payment: response,
      };
    }

    if (paymentStatus === "in_process") {
      return {
        success: false,
        message: "Pagamento em análise pelo Mercado Pago.",
        status: paymentStatus,
        status_detail: response.status_detail,
        payment: response,
      };
    }

    return {
      success: false,
      message: "Pagamento não autorizado.",
      status: paymentStatus,
      status_detail: response.status_detail,
      payment: response,
    };
  } catch (error) {
    console.error(
      "❌ Erro MP:",
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