import { paymentClient } from "../../config/mercadopago.js";
const USE_STRIPE = process.env.USE_STRIPE === "true" || false;
import QRCode from "qrcode";
import { getPrismaClient } from "../../config/prisma.js";

const prisma = getPrismaClient();

export const ensureEmvCrc = (payload) => {
  if (!payload) return payload;
  try {
    if (/6304[0-9A-Fa-f]{4}$/.test(payload)) return payload;
    const crcInput = payload + "63040000";
    const buf = Buffer.from(crcInput, "ascii");
    let crc = 0xffff;
    const poly = 0x1021;
    for (let i = 0; i < buf.length; i += 1) {
      crc ^= buf[i] << 8;
      for (let j = 0; j < 8; j += 1) {
        crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ poly) & 0xffff : (crc << 1) & 0xffff;
      }
    }
    return `${payload}6304${crc.toString(16).toUpperCase().padStart(4, "0")}`;
  } catch {
    return payload;
  }
};

export const generatePixPayload = ({ key, amount, merchantName, merchantCity, txid }) => {
  const gui = "BR.GOV.BCB.PIX";
  const sub00 = `00${String(gui.length).padStart(2, "0")}${gui}`;
  const sub01 = `01${String((key || "").length).padStart(2, "0")}${key || ""}`;
  const mai = sub00 + sub01;
  const tag26 = `26${String(mai.length).padStart(2, "0")}${mai}`;
  const tag52 = "52040000";
  const tag53 = "5303986";
  const tag54 = amount ? `54${String(Number(amount).toFixed(2).length).padStart(2, "0")}${Number(amount).toFixed(2)}` : "";
  const tag58 = "5802BR";
  const tag59 = `59${String((merchantName || "").length).padStart(2, "0")}${merchantName || ""}`;
  const tag60 = `60${String((merchantCity || "").length).padStart(2, "0")}${merchantCity || ""}`;
  const txidValue = txid !== undefined ? String(txid) : "*";
  const tag62 = `62${String(4 + txidValue.length).padStart(2, "0")}05${String(txidValue.length).padStart(2, "0")}${txidValue}`;
  return ensureEmvCrc(`000201${tag26}${tag52}${tag53}${tag54}${tag58}${tag59}${tag60}${tag62}`);
};

export const createPixPayment = async (data, user) => {
  if (USE_STRIPE) {
    const { createPixPayment: stripePix } = await import("./pixService_stripe.js");
    return stripePix(data, user);
  }

  const { accommodationId, checkIn, checkOut, guests, email } = data;
  if (!accommodationId || !checkIn || !checkOut || !guests || !email) {
    return { success: false, message: "Dados incompletos para pagamento PIX." };
  }

  const place = await prisma.place.findFirst({
    where: {
      OR: [{ id: accommodationId }, { legacyMongoId: String(accommodationId) }],
      status: "ACTIVE",
    },
  });

  if (!place) {
    return { success: false, message: "Acomodacao nao encontrada." };
  }

  const nights = Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)));
  const pricePerNight = Number(place.pricePerNight || 0);
  const totalPrice = pricePerNight * nights;

  if (guests < 1 || guests > Number(place.maxGuests || 1)) {
    return { success: false, message: "Numero de hospedes invalido para esta acomodacao." };
  }

  if (!totalPrice || totalPrice <= 0) {
    return { success: false, message: "Valor do pagamento invalido (R$ 0)." };
  }

  try {
    const response = await paymentClient.create({
      body: {
        transaction_amount: Number(totalPrice.toFixed(2)),
        description: `Reserva em ${place.title}`.substring(0, 60),
        payment_method_id: "pix",
        payer: { email },
        additional_info: {
          items: [
            {
              id: String(place.id).substring(0, 36),
              title: String(place.title).substring(0, 60),
              description: String(place.description || place.title).substring(0, 100),
              quantity: 1,
              unit_price: Number(totalPrice.toFixed(2)),
            },
          ],
        },
        ...(process.env.MERCADO_PAGO_WEBHOOK_URL ? { notification_url: process.env.MERCADO_PAGO_WEBHOOK_URL } : {}),
        metadata: {
          userId: user?._id?.toString() || "",
          accommodationId: String(place.id),
          checkIn,
          checkOut,
          guests: String(guests),
          nights: String(nights),
          totalPrice: String(totalPrice),
          pricePerNight: String(pricePerNight),
        },
      },
    });

    const transactionData = response.point_of_interaction?.transaction_data || {};
    let qr_code = transactionData.qr_code || null;
    let qr_code_base64 = transactionData.qr_code_base64 || null;

    if (qr_code) qr_code = ensureEmvCrc(qr_code);
    if (!qr_code_base64 && qr_code) {
      try {
        const dataUrl = await QRCode.toDataURL(qr_code);
        qr_code_base64 = dataUrl.split(",")[1] || null;
      } catch {}
    }

    return {
      success: true,
      message: "Pagamento PIX criado com sucesso.",
      paymentId: response.id,
      status: response.status,
      status_detail: response.status_detail,
      qr_code,
      qr_code_base64,
      paymentResponse: response,
    };
  } catch (error) {
    const mpError = error.response?.data;
    const mpCause = mpError?.cause?.[0];
    const mpCode = mpCause?.code;
    const mpMessage = mpCause?.description || mpError?.message || error.message || "Erro ao criar pagamento PIX.";
    const friendlyMessages = {
      13253: "Pix nao esta habilitado nesta conta Mercado Pago. Cadastre uma chave Pix em mercadopago.com.br/pix.",
      4041: "Metodo de pagamento Pix indisponivel para esta conta.",
    };

    return {
      success: false,
      message: friendlyMessages[mpCode] || mpMessage,
      mpError: mpError || null,
    };
  }
};
