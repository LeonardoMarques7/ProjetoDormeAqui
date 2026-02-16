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
          },
        ],
      },
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

    // Pagamento aprovado -> cria booking imediatamente
    if (paymentStatus === "approved") {
      console.log("=== PAYMENT APPROVED → CREATING BOOKING ===");

      let booking;
      try {
        booking = await Booking.createFromPayment({
          place: accommodationId,
          user: user?._id,
          pricePerNight: place.price,
          priceTotal: totalPrice,
          checkin: checkIn,
          checkout: checkOut,
          guests,
          nights,
          mercadopagoPaymentId: response.id,
          paymentStatus: "approved", // já aprovado!
        });
      } catch (createErr) {
        console.error("❌ Erro ao criar booking após autorização:", createErr);
        return {
          success: false,
          message: "Erro ao criar reserva após autorização de pagamento.",
          error: createErr.message || createErr,
        };
      }

      return {
        success: true,
        booking,
        status: response?.status || "approved",
        payment: response,
      };
    }

    // Pagamento pendente
    if (paymentStatus === "pending") {
      return {
        success: false,
        message: "Pagamento pendente. Reserva ainda não criada.",
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
