import { createCheckoutPreference, verifyMercadoPagoConfig } from "./service.js";

import { capturePayment } from "./captureService.js";



/**
 * Controller de Pagamentos
 * Responsável por receber requisições HTTP e chamar os serviços apropriados
 */

/**
 * Cria uma preferência de checkout Mercado Pago
 * POST /api/payments/create
 */
export const createPaymentPreference = async (req, res, next) => {
    console.log("🚀 [CONTROLLER] Iniciando createPaymentPreference");
    const requestStartTime = Date.now();
    
    try {
        console.log("📥 Requisição recebida em /api/payments/create");
        console.log("Headers:", req.headers);
        console.log("Body:", JSON.stringify(req.body, null, 2));
        console.log("User:", req.user);

        
        const { accommodationId, checkIn, checkOut, guests } = req.body;
        const userId = req.user?._id; // Assumindo que o middleware de auth adiciona req.user
        
        // Validações básicas
        if (!accommodationId || !checkIn || !checkOut || !guests) {
            console.log("❌ Dados incompletos:", { accommodationId, checkIn, checkOut, guests });
            return res.status(400).json({
                success: false,
                message: "Dados incompletos. Envie: accommodationId, checkIn, checkOut, guests",
                required: ["accommodationId", "checkIn", "checkOut", "guests"]
            });
        }
        
        if (!userId) {
            console.log("❌ UserId não encontrado no token");
            return res.status(401).json({
                success: false,
                message: "Usuário não autenticado corretamente"
            });
        }

        
        // Valida formato das datas
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        
        if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Formato de data inválido. Use ISO 8601 (YYYY-MM-DD)"
            });
        }
        
        // Valida que check-out é depois do check-in
        if (checkOutDate <= checkInDate) {
            return res.status(400).json({
                success: false,
                message: "Data de check-out deve ser posterior à data de check-in"
            });
        }
        
        // Valida número de hóspedes
        const guestsNumber = parseInt(guests);
        if (isNaN(guestsNumber) || guestsNumber < 1) {
            return res.status(400).json({
                success: false,
                message: "Número de hóspedes inválido"
            });
        }
        
        // Determina URL do frontend baseado no ambiente
        let frontendUrl = process.env.NODE_ENV === "production" 
            ? process.env.FRONTEND_URL || "https://projetodormeaqui.onrender.com"
            : "http://localhost:5173";
        
        // Validação crucial: garante que frontendUrl está definido
        if (!frontendUrl) {
            console.error("❌ FRONTEND_URL não definido!");
            return res.status(500).json({
                success: false,
                message: "Configuração de URL do frontend ausente"
            });
        }
        
        // Remove trailing slash se existir
        frontendUrl = frontendUrl.replace(/\/$/, '');
        
        console.log("🔗 Frontend URL configurada:", frontendUrl);
        console.log("⏱️ [CONTROLLER] Tempo até chamada do service:", Date.now() - requestStartTime, "ms");
        
        // Cria a preferência de pagamento
        const preference = await createCheckoutPreference({
            accommodationId,
            userId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests: guestsNumber,
            frontendUrl,
            payerEmail: req.user?.email
        });
        
        console.log("✅ [CONTROLLER] Preferência criada com sucesso:", preference.preferenceId);
        console.log("⏱️ [CONTROLLER] Tempo total:", Date.now() - requestStartTime, "ms");
        
        // Retorna o init_point para redirecionamento
        return res.status(200).json({

            success: true,
            message: "Preferência de pagamento criada com sucesso",
            data: {
                initPoint: preference.initPoint,
                sandboxInitPoint: preference.sandboxInitPoint,
                preferenceId: preference.preferenceId,
                bookingDetails: {
                    totalPrice: preference.totalPrice,
                    nights: preference.nights,
                    pricePerNight: preference.pricePerNight,
                    accommodationTitle: preference.accommodationTitle
                }
            }
        });
        
    } catch (error) {
        console.error("❌ Erro no controller createPaymentPreference:", error);
        console.error("Stack:", error.stack);
        console.error("⏱️ [CONTROLLER] Tempo até erro:", Date.now() - requestStartTime, "ms");
        
        // Garante que uma resposta seja enviada para evitar ERR_CONNECTION_RESET
        if (!res.headersSent) {
            const statusCode = error.statusCode || 500;
            return res.status(statusCode).json({
                success: false,
                message: error.message || "Erro interno ao processar pagamento",
                error: process.env.NODE_ENV === 'development' ? {
                    message: error.message,
                    stack: error.stack
                } : undefined
            });
        }
        
        // Se headers já foram enviados, passa para o middleware de erro
        next(error);
    }

};

/**
 * Testa a configuração do Mercado Pago
 * GET /api/payments/test-config
 * Endpoint público para verificar se o token está configurado corretamente
 */
export const testMercadoPagoConfig = async (req, res, next) => {
    try {
        console.log("🧪 Testando configuração do Mercado Pago...");
        
        const result = await verifyMercadoPagoConfig();
        
        if (result.success) {
            return res.status(200).json({
                success: true,
                message: "Configuração do Mercado Pago válida",
                details: result
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Problema na configuração do Mercado Pago",
                details: result
            });
        }
    } catch (error) {
        console.error("❌ Erro ao testar configuração:", error);
        next(error);
    }
};

/**
 * Verifica status de um pagamento (para consulta manual)
 * GET /api/payments/status/:paymentId
 */
export const checkPaymentStatus = async (req, res, next) => {

    try {
        const { paymentId } = req.params;
        
        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: "ID do pagamento é obrigatório"
            });
        }
        
        const { getPaymentInfo } = await import("./service.js");
        const paymentInfo = await getPaymentInfo(paymentId);
        
        return res.status(200).json({
            success: true,
            data: {
                status: paymentInfo.status,
                statusDetail: paymentInfo.status_detail,
                amount: paymentInfo.transaction_amount,
                dateCreated: paymentInfo.date_created,
                dateApproved: paymentInfo.date_approved
            }
        });
        
    } catch (error) {
        next(error);
    }
};


/**
 * Captura um pagamento previamente autorizado
 * POST /api/payments/capture/:paymentId
 */
export const captureAuthorizedPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: "paymentId é obrigatório",
      });
    }

    console.log("🚀 [CONTROLLER] Capturando pagamento:", paymentId);

    const result = await capturePayment(paymentId);

    return res.status(200).json({
      success: true,
      message: "Pagamento capturado com sucesso",
      data: {
        id: result.id,
        status: result.status,
        status_detail: result.status_detail,
        captured: result.captured,
      },
    });
  } catch (error) {
    console.error("❌ Erro ao capturar pagamento:", error);
    next(error);
  }
};


/**
 * POST /api/payments/failed/:paymentId/retry
 * Tentativa de retry para pagamento rejeitado - estratégias:
 *  - se token presente, tenta criar payment direto (pode falhar)
 *  - fallback: cria preferência de checkout e retorna init_point para frontend
 */
export const retryFailedPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    if (!paymentId) return res.status(400).json({ success: false, message: 'paymentId é obrigatório' });

    const FailedPayment = (await import("./failedPaymentModel.js")).default;
    const failed = await FailedPayment.findOne({ paymentId });
    if (!failed) return res.status(404).json({ success: false, message: 'FailedPayment não encontrado' });

    const { metadata, paymentInfo } = failed;

    // Tentar re-criar pagamento direto se tivermos token (pode expirar)
    try {
      const { paymentClient } = await import("../../config/mercadopago.js");
      const token = paymentInfo?.token || metadata?.token;
      if (token) {
        const body = {
          transaction_amount: Number(metadata?.totalPrice) || Number(paymentInfo?.transaction_amount) || 0,
          token,
          description: paymentInfo?.description || metadata?.description || 'Retry de pagamento',
          installments: Number(metadata?.installments) || Number(paymentInfo?.installments) || 1,
          payment_method_id: paymentInfo?.payment_method_id || metadata?.payment_method_id,
          payer: paymentInfo?.payer || { email: metadata?.userEmail || metadata?.payerEmail }
        };
        const resp = await paymentClient.create({ body });
        return res.status(200).json({ success: true, method: 'direct_payment', payment: resp });
      }
    } catch (err) {
      console.error('Falha ao tentar criar pagamento direto no retry:', err?.response?.data || err.message || err);
      // continua para fallback
    }

    // Fallback: criar preferência de checkout para o usuário refazer o checkout
    try {
      const frontendUrl = (process.env.FRONTEND_URL && process.env.FRONTEND_URL.replace(/\/$/, '')) || 'http://localhost:5173';
      const accommodationId = metadata?.accommodationId || metadata?.accommodation_id || metadata?.external_reference?.split('_')?.pop();
      const userId = metadata?.userId || metadata?.user_id || metadata?.userIdString;
      const checkIn = metadata?.checkIn || metadata?.check_in;
      const checkOut = metadata?.checkOut || metadata?.check_out;
      const guests = Number(metadata?.guests) || 1;

      const preference = await createCheckoutPreference({
        accommodationId,
        userId,
        checkIn: checkIn ? new Date(checkIn) : undefined,
        checkOut: checkOut ? new Date(checkOut) : undefined,
        guests,
        frontendUrl,
        payerEmail: metadata?.userEmail || paymentInfo?.payer?.email
      });

      return res.status(200).json({ success: true, method: 'preference', preference });
    } catch (err) {
      console.error('Falha ao criar preferência de retry:', err?.response?.data || err.message || err);
      return res.status(500).json({ success: false, message: 'Não foi possível gerar retry automático', error: err?.message || err });
    }
  } catch (error) {
    next(error);
  }
};
