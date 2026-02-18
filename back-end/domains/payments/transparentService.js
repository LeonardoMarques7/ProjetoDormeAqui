import { paymentClient } from "../../config/mercadopago.js";
import Place from "../places/model.js";
import Booking from "../bookings/model.js";

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

    const email = data.email || payer.email;
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
    if (!accommodationId || !checkIn || !checkOut || !guests || !token || !email || !paymentMethodId || !identificationNumber) {
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

    if (!process.env.MERCADO_PAGO_WEBHOOK_URL) {
      console.error("❌ MERCADO_PAGO_WEBHOOK_URL não configurado.");
      return { success: false, message: "MERCADO_PAGO_WEBHOOK_URL não configurado." };
    }

    // ==============================
    // CONFLITO DE RESERVA
    // ==============================
    const conflicting = await Booking.find({
      place: accommodationId,
      $or: [{ checkin: { $lt: checkoutDate }, checkout: { $gt: checkinDate } }],
    }).limit(1);

    if (conflicting?.length > 0) {
      console.warn("⚠️ Datas conflitantes com reservas existentes:", conflicting);
      return { success: false, message: "Datas conflitantes com reservas existentes.", status: "conflict" };
    }

    // ==============================
    // PREPARAR PAYMENT DATA MP
    // ==============================
    const externalReference = `booking_${Date.now()}_${accommodationId}`;

    const paymentData = {
      transaction_amount: totalPrice,
      token,
      description: `Reserva em ${place.title}`,
      installments,
      payment_method_id: paymentMethodId,
      issuer_id: issuerId,
      payer: {
        email,
        first_name: firstName,
        last_name: lastName,
        identification: { type: identificationType, number: identificationNumber },
        phone: { area_code: phoneAreaCode, number: phoneNumber },
        address: { street_number: streetNumber, zip_code: zipCode, street_name: street },
      },
      additional_info: {
        payer: {
          first_name: firstName,
          last_name: lastName,
          phone: { area_code: phoneAreaCode, number: phoneNumber },
          address: { zip_code: zipCode, street_name: street, street_number: streetNumber },
        },
        items: [
          {
            id: accommodationId,
            title: place.title,
            description: place.description,
            quantity: 1,
            unit_price: totalPrice,
            category_id: "lodging",
          },
        ],
      },
      notification_url: process.env.MERCADO_PAGO_WEBHOOK_URL,
      external_reference: externalReference,
      metadata: {
        userId: user?._id?.toString() || "",
        accommodationId: accommodationId?.toString() || "",
        guests: String(guests),
        nights: String(nights),
        totalPrice: String(totalPrice),
        pricePerNight: String(pricePerNight),
        checkIn: checkIn,
        checkOut: checkOut
      },
      capture: false,
    };

    console.log("🔁 Enviando paymentData MP:", JSON.stringify(paymentData, null, 2));

    // ==============================
    // CRIAR PAGAMENTO NO MP
    // ==============================
    const response = await paymentClient.create({ body: paymentData });
    console.log("💳 MP RESPONSE:", response);

    const paymentStatus = String(response.status).toLowerCase();

    // ==============================
    // TRATAR STATUS DE PAGAMENTO
    // ==============================
    switch (paymentStatus) {
      case "approved":
        console.log("✅ Pagamento aprovado pelo MP.");
        return { success: true, message: "Pagamento aprovado. Reserva será criada após webhook.", status: paymentStatus, payment: response };

      case "authorized":
      case "pending_capture":
        console.log("⚠️ Pagamento autorizado, aguardando captura:", paymentStatus);
        return { success: false, message: "Pagamento autorizado aguardando captura.", status: paymentStatus, payment: response };

      case "pending":
        console.log("⏳ Pagamento pendente:", paymentStatus);
        return { success: false, message: "Pagamento pendente.", status: paymentStatus, payment: response };

      case "in_process":
        console.log("🔍 Pagamento em análise (in_process):", response.status_detail);
        return { success: false, message: "Pagamento em análise.", status: paymentStatus, status_detail: response.status_detail, payment: response };

      case "rejected":
        console.log("❌ Pagamento rejeitado pelo MP:", response.status_detail);
        return { success: false, message: "Pagamento rejeitado.", status: paymentStatus, status_detail: response.status_detail, payment: response };

      default:
        console.warn("⚠️ Status de pagamento desconhecido:", paymentStatus);
        return { success: false, message: "Pagamento não autorizado.", status: paymentStatus, status_detail: response.status_detail, payment: response };
    }
  } catch (error) {
    console.error("❌ Erro ao processar pagamento:", error.response?.data || error.message);
    return { success: false, message: error.response?.data?.message || error.message || "Erro ao processar pagamento.", error: error.response?.data || error, status: error.response?.status || 500 };
  }
};
