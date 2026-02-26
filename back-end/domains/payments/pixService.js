import { paymentClient } from "../../config/mercadopago.js";
import QRCode from 'qrcode';
import Place from "../places/model.js";

// Ensure EMV CRC (CRC16/CCITT - poly 0x1021, init 0xFFFF)
export const ensureEmvCrc = (payload) => {
  if (!payload) return payload;
  try {
    if (/6304[0-9A-Fa-f]{4}$/.test(payload)) return payload;
    const crcInput = payload + '63040000';
    const buf = Buffer.from(crcInput, 'ascii');
    let crc = 0xFFFF;
    const poly = 0x1021;
    for (let i = 0; i < buf.length; i++) {
      crc ^= (buf[i] << 8);
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) crc = ((crc << 1) ^ poly) & 0xFFFF;
        else crc = (crc << 1) & 0xFFFF;
      }
    }
    const hex = crc.toString(16).toUpperCase().padStart(4, '0');
    return payload + '6304' + hex;
  } catch (e) {
    return payload;
  }
};

// Generates a BR Code (EMV) PIX payload and returns the full payload with CRC
export const generatePixPayload = ({ key, amount, merchantName, merchantCity, txid }) => {
  // Merchant Account Information (tag 26)
  const gui = 'BR.GOV.BCB.PIX';
  const sub00 = `00${String(gui.length).padStart(2, '0')}${gui}`;
  const sub01 = `01${String((key || '').length).padStart(2, '0')}${key || ''}`;
  const mai = sub00 + sub01;
  const maiLen = String(mai.length).padStart(2, '0');
  const tag26 = `26${maiLen}${mai}`;

  const tag52 = '52040000';
  const tag53 = '5303986';

  // format amount with 2 decimals (dot) when provided
  let tag54 = '';
  if (amount) {
    const amt = Number(amount).toFixed(2);
    tag54 = `54${String(amt.length).padStart(2, '0')}${amt}`;
  }

  const tag58 = '5802BR';
  const tag59 = `59${String((merchantName || '').length).padStart(2, '0')}${merchantName || ''}`;
  const tag60 = `60${String((merchantCity || '').length).padStart(2, '0')}${merchantCity || ''}`;

  const txidValue = txid !== undefined ? String(txid) : '*';
  // inner field 05 length = 2 (tag) + 2 (LL) + txid.length => total inner length = 4 + txid.length
  const inner62Len = 4 + txidValue.length;
  const tag62 = `62${String(inner62Len).padStart(2, '0')}05${String(txidValue.length).padStart(2, '0')}${txidValue}`;

  const payloadNoCrc = `000201${tag26}${tag52}${tag53}${tag54}${tag58}${tag59}${tag60}${tag62}`;
  const full = ensureEmvCrc(payloadNoCrc);
  return full;
};

export const createPixPayment = async (data, user) => {
  const { accommodationId, checkIn, checkOut, guests, email } = data;

  if (!accommodationId || !checkIn || !checkOut || !guests || !email) {
    return { success: false, message: "Dados incompletos para pagamento PIX." };
  }

  const place = await Place.findById(accommodationId);
  if (!place) {
    return { success: false, message: "Acomodação não encontrada." };
  }

  const nights =
    Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)) || 1;
  const pricePerNight = Number(place.price) || 0;
  const totalPrice = pricePerNight * nights;

  if (!totalPrice || totalPrice <= 0) {
    return { success: false, message: "Valor do pagamento inválido (R$ 0). Verifique o preço da acomodação." };
  }

  try {
    const paymentData = {
      transaction_amount: Number(totalPrice.toFixed(2)),
      description: `Reserva em ${place.title}`.substring(0, 60),
      payment_method_id: "pix",
      payer: { email },
      additional_info: {
        items: [
          {
            id: String(accommodationId).substring(0, 36),
            title: String(place.title).substring(0, 60),
            description: String(place.description || place.title).substring(0, 100),
            quantity: 1,
            unit_price: Number(totalPrice.toFixed(2)),
          },
        ],
      },
      ...(process.env.MERCADO_PAGO_WEBHOOK_URL
        ? { notification_url: process.env.MERCADO_PAGO_WEBHOOK_URL }
        : {}),
      metadata: {
        userId: user?._id?.toString() || "",
        accommodationId: accommodationId.toString(),
        checkIn,
        checkOut,
        guests: guests.toString(),
        nights: nights.toString(),
        totalPrice: totalPrice.toString(),
        pricePerNight: pricePerNight.toString(),
      },
    };

    console.log("🔵 [PIX] Criando pagamento:", JSON.stringify({ amount: paymentData.transaction_amount, email, nights }, null, 2));

    const response = await paymentClient.create({ body: paymentData });

    // response should contain point_of_interaction for PIX
    const poi = response.point_of_interaction || {};
    const transactionData = poi.transaction_data || {};

    let qr_code = transactionData.qr_code || null;
    let qr_code_base64 = transactionData.qr_code_base64 || null;

    // Ensure EMV payload has CRC (tag 63). If missing, compute and append CRC-16/CCITT as required by EMV.
    const ensureEmvCrc = (payload) => {
      if (!payload) return payload;
      try {
        // If already ends with 63 04 XXXX (hex), assume valid
        if (/6304[0-9A-Fa-f]{4}$/.test(payload)) return payload;

        // Compute CRC over payload + '6304' + '0000' as bytes
        const crcInput = payload + '63040000';
        const buf = Buffer.from(crcInput, 'ascii');
        let crc = 0xFFFF;
        const poly = 0x1021;
        for (let i = 0; i < buf.length; i++) {
          crc ^= (buf[i] << 8);
          for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) crc = ((crc << 1) ^ poly) & 0xFFFF;
            else crc = (crc << 1) & 0xFFFF;
          }
        }
        const hex = crc.toString(16).toUpperCase().padStart(4, '0');
        return payload + '6304' + hex;
      } catch (e) {
        return payload;
      }
    };

    if (qr_code) {
      qr_code = ensureEmvCrc(qr_code);
    }

    // If Mercado Pago didn't return a PNG, generate one server-side from the EMV payload
    if (!qr_code_base64 && qr_code) {
      try {
        const dataUrl = await QRCode.toDataURL(qr_code);
        // dataUrl is like "data:image/png;base64,...."
        const parts = dataUrl.split(",");
        if (parts.length === 2) {
          qr_code_base64 = parts[1];
        }
      } catch (e) {
        // ignore generation errors
      }
    }

    return {
      success: true,
      message: "Pagamento PIX criado com sucesso.",
      paymentId: response.id,
      status: response.status,
      status_detail: response.status_detail,
      qr_code: qr_code,
      qr_code_base64: qr_code_base64,
      paymentResponse: response,
    };
  } catch (error) {
    const mpError = error.response?.data;
    const mpMessage = mpError?.message || mpError?.cause?.[0]?.description || error.message || "Erro ao criar pagamento PIX.";
    console.error("❌ [PIX] Erro MP:", JSON.stringify(mpError || error.message, null, 2));
    return {
      success: false,
      message: mpMessage,
      mpError: mpError || null,
    };
  }
};
