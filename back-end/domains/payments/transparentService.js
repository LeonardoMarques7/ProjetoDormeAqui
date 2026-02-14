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
    $or: [
      { checkin: { $lt: checkoutDate }, checkout: { $gt: checkinDate } }
    ]
  }).limit(1);

  if (conflicting && conflicting.length > 0) {
    return {
      success: false,
      message: "Datas conflitantes com reservas existentes. As datas selecionadas não estão disponíveis.",
      status: "conflict",
    };
  }

  try {
    const paymentData = {
      transaction_amount: Number(totalPrice),
      token: token, // 🔥 token vindo do frontend
      description: `Reserva em ${place.title}`,
      installments: Number(installments) || 1,
      payment_method_id: paymentMethodId, // 🔥 vindo do frontend
      issuer_id: issuerId, // 🔥 vindo do frontend
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
    };

    console.log(
      "🔁 Enviando paymentData para Mercado Pago:",
      JSON.stringify(paymentData, null, 2)
    );

    const response = await paymentClient.create({ body: paymentData });

    // Only consider payment successful when Mercado Pago explicitly returns "approved"
    if (response && response.status === "approved") {
      return {
        success: true,
        message: "Pagamento realizado com sucesso.",
        paymentId: response.id,
        status: response.status,
        status_detail: response.status_detail,
      };
    }

    // Any other status (including in_process, rejected, or errors) must be treated as failure
    return {
      success: false,
      message: "Pagamento não aprovado.",
      status: response?.status,
      status_detail: response?.status_detail,
    };
  } catch (error) {
    console.error(
      "❌ Erro ao criar pagamento:",
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
