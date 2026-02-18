import { paymentClient } from "../../config/mercadopago.js";
import Place from "../places/model.js";
import Booking from "../bookings/model.js";

export const processTransparentPayment = async (data, user) => {
  // ==============================
  // SUPORTE CAMELCASE OU PAYER
  // ==============================
  const payer = data.payer || {};

  const accommodationId = data.accommodationId;
  const checkIn = data.checkIn;
  const checkOut = data.checkOut;
  const guests = data.guests;
  const token = data.token;

  const email = data.email || payer.email;

  const paymentMethodId = data.paymentMethodId || data.payment_method_id;
  const issuerId = data.issuerId || data.issuer_id;
  const installments = data.installments;

  const firstName = data.firstName || payer.first_name;
  const lastName = data.lastName || payer.last_name;

  const identificationType =
    data.identificationType || payer.identification?.type;

  const identificationNumber =
    data.identificationNumber || payer.identification?.number;

  const phoneAreaCode =
    data.phoneAreaCode || payer.phone?.area_code;

  const phoneNumber =
    data.phoneNumber || payer.phone?.number;

  const streetNumber =
    data.streetNumber || payer.address?.street_number;

  const zipCode = data.zipCode || payer.address?.zip_code;
  const street = data.street || payer.address?.street_name;

  const fullName =
    data.fullName ||
    `${firstName || ""} ${lastName || ""}`.trim();

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
    !identificationNumber
  ) {
    return {
      success: false,
      message: "Dados incompletos para pagamento.",
      data,
    };
  }

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

  const externalReference = `booking_${Date.now()}_${accommodationId}`;

  if (!process.env.MERCADO_PAGO_WEBHOOK_URL) {
    return {
      success: false,
      message: "MERCADO_PAGO_WEBHOOK_URL nao configurado.",
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
        "Datas conflitantes com reservas existentes.",
      status: "conflict",
    };
  }

  try {
    // ==============================
    // PAYMENT DATA MP
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
        phone: {
          area_code: phoneAreaCode || "11",
          number: phoneNumber || "999999999",
        },
        address: {
          street_number: streetNumber,
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
            zip_code: zipCode,
            street_name: place.address?.street || street,
            street_number: streetNumber,
          },
        },
        items: [
          {
            id: accommodationId,
            title: place.title,
            description: place.description,
            quantity: 1,
            unit_price: Number(totalPrice),
            category_id: "lodging",
          },
        ],
      },

      notification_url: process.env.MERCADO_PAGO_WEBHOOK_URL,
      external_reference: externalReference,

      metadata: {
        userId: user?._id?.toString(),
        accommodationId: accommodationId.toString(),
        guests,
        nights,
        totalPrice,
        pricePerNight: place.price,
        checkIn,
        checkOut,
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

    if (paymentStatus === "approved") {
      return {
        success: true,
        message:
          "Pagamento aprovado. Reserva será criada após webhook.",
        status: paymentStatus,
        payment: response,
      };
    }

    if (["authorized", "pending_capture"].includes(paymentStatus)) {
      return {
        success: false,
        message:
          "Pagamento autorizado aguardando captura.",
        status: paymentStatus,
        payment: response,
      };
    }

    if (paymentStatus === "pending") {
      return {
        success: false,
        message:
          "Pagamento pendente.",
        status: paymentStatus,
        payment: response,
      };
    }

    if (paymentStatus === "in_process") {
      return {
        success: false,
        message: "Pagamento em análise.",
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
