import React, { useState, useEffect } from "react";
import axios from "axios";
import { CreditCard, Lock } from "lucide-react";
import QRCode from "qrcode";
import { useUserContext } from "@/components/contexts/UserContext";

const TransparentCheckoutForm = ({ bookingData, onSuccess, onError }) => {
  const { user } = useUserContext();

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [pixResult, setPixResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatedQr, setGeneratedQr] = useState(null);

  /* =========================================================
     GERAR QR CODE REAL DO PIX
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    if (pixResult?.qr_code) {
      QRCode.toDataURL(pixResult.qr_code)
        .then((url) => {
          if (mounted) setGeneratedQr(url);
        })
        .catch(() => {
          if (mounted) setGeneratedQr(null);
        });
    } else {
      setGeneratedQr(null);
    }

    return () => {
      mounted = false;
    };
  }, [pixResult?.qr_code]);

  /* =========================================================
     POLLING DE STATUS DO PIX (CORRIGIDO)
  ========================================================= */

  useEffect(() => {
    if (!pixResult?.paymentId) return;

    let intervalId = null;

    const checkStatus = async () => {
      try {
        const { data } = await axios.get(
          `/payments/status/${pixResult.paymentId}`
        );

        const status =
          data?.status ||
          data?.payment?.status ||
          data?.paymentResponse?.status;

        if (!status) return;

        setPixResult((prev) => {
          if (prev?.status === status) return prev;
          return { ...prev, status };
        });

        const lower = status.toLowerCase();

        if (["approved", "authorized", "paid"].includes(lower)) {
          clearInterval(intervalId);
          onSuccess({ ...pixResult, status: lower });
        }

        if (["cancelled", "rejected", "error"].includes(lower)) {
          clearInterval(intervalId);
          onError("Pagamento PIX não foi aprovado: " + lower);
        }
      } catch (err) {
        // ignora erro transitório
      }
    };

    intervalId = setInterval(checkStatus, 5000);
    checkStatus();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [pixResult?.paymentId]);

  /* =========================================================
     CONFIRMAR PAGAMENTO CARTÃO
  ========================================================= */

  const onConfirm = async () => {
    if (paymentMethod !== "card") return;

    if (!cardNumber || !cardName || !cardExpiry || !cardCvv || !email) {
      onError("Preencha todos os dados do cartão.");
      return;
    }

    setLoading(true);

    try {
      if (!window.MercadoPago) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://sdk.mercadopago.com/js/v2";
          s.onload = resolve;
          s.onerror = () =>
            reject(new Error("Falha ao carregar SDK do Mercado Pago"));
          document.head.appendChild(s);
        });
      }

      const mp = new window.MercadoPago(
        import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY,
        { locale: "pt-BR" }
      );

      const cleanCardNumber = cardNumber.replace(/\s+/g, "");
      const expirationMonth = cardExpiry.split("/")[0]?.replace(/\D/g, "");
      const expirationYear = cardExpiry.split("/")[1]?.replace(/\D/g, "");

      const tokenResponse = await mp.createCardToken({
        cardNumber: cleanCardNumber,
        cardExpirationMonth: expirationMonth,
        cardExpirationYear: expirationYear,
        securityCode: cardCvv,
        cardholderName: cardName,
        identificationType: "CPF",
        identificationNumber: "00000000000",
      });

      const token = tokenResponse?.id;
      if (!token) throw new Error("Token não gerado.");

      const bin = cleanCardNumber.slice(0, 6);
      const paymentMethodResponse = await mp.getPaymentMethods({ bin });

      const paymentMethodId = paymentMethodResponse?.results?.[0]?.id;
      if (!paymentMethodId)
        throw new Error("Não foi possível identificar a bandeira.");

      const payload = {
        ...bookingData,
        token,
        paymentMethodId,
        issuerId: null,
        installments: 1,
        identificationType: "CPF",
        identificationNumber: "00000000000",
        email,
      };

      const { data } = await axios.post(
        "/payments/transparent",
        payload
      );

      if (data.success) {
        onSuccess(data);
      } else {
        onError(data.message || "Pagamento não aprovado.");
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Erro ao processar pagamento.";

      onError(message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="p-8 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Pagamento</h2>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setPaymentMethod("card")}
          className={`p-4 rounded-xl border-2 ${
            paymentMethod === "card"
              ? "border-black"
              : "border-gray-300"
          }`}
        >
          <CreditCard className="w-6 h-6 mx-auto mb-2" />
          Cartão
        </button>

        <button
          onClick={() => setPaymentMethod("pix")}
          className={`p-4 rounded-xl border-2 ${
            paymentMethod === "pix"
              ? "border-black"
              : "border-gray-300"
          }`}
        >
          PIX
        </button>
      </div>

      {paymentMethod === "card" ? (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Número do cartão"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />
          <input
            type="text"
            placeholder="Nome do titular"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            className="w-full p-3 border rounded-xl"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="MM/AA"
              value={cardExpiry}
              onChange={(e) => setCardExpiry(e.target.value)}
              className="w-full p-3 border rounded-xl"
            />
            <input
              type="text"
              placeholder="CVV"
              value={cardCvv}
              onChange={(e) => setCardCvv(e.target.value)}
              className="w-full p-3 border rounded-xl"
            />
          </div>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full bg-black text-white p-4 rounded-xl"
          >
            {loading ? "Processando..." : "Confirmar Pagamento"}
          </button>
        </div>
      ) : (
        <div className="text-center">
          {generatedQr ? (
            <img
              src={generatedQr}
              alt="QR PIX"
              className="w-48 h-48 mx-auto"
            />
          ) : (
            <p>Gerando QR Code...</p>
          )}
        </div>
      )}

      <div className="flex justify-center mt-4 text-sm text-gray-500">
        <Lock className="w-4 h-4 mr-2" />
        Transação segura
      </div>
    </div>
  );
};

export default TransparentCheckoutForm;
