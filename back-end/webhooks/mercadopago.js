import { processPaymentNotification } from "../domains/payments/service.js";
import Booking from "../domains/bookings/model.js";
import fs from "fs";
import path from "path";

/**
 * Webhook Handler - Mercado Pago
 * Processa notificações de pagamento e cria/atualiza reservas
 */

/**
 * POST /api/webhook/mercadopago
 * Recebe notificações de pagamento do Mercado Pago
 * Importante: Sempre retornar 200 para evitar reenvios
 */
export const handleMercadoPagoWebhook = async (req, res) => {
    try {
        console.log("Webhook recebido:", JSON.stringify(req.body, null, 2));
        // Salva notificação em log para auditoria / conciliação financeira
        try {
            const logPath = path.resolve("tmp", "mp_notifications.log");
            fs.appendFileSync(logPath, JSON.stringify({ timestamp: new Date().toISOString(), notification: req.body }) + "\n");
        } catch (logErr) {
            console.error("Falha ao gravar log de notificação:", logErr?.message || logErr);
        }
        
        // Compatibilidade com diferentes formatos de webhook do Mercado Pago
        const mpType = req.body.type || req.body.topic || (req.body.action ? String(req.body.action).split('.')[0] : undefined);
        const data = req.body.data || {};
        const incomingPaymentId = data.id || req.body.id || req.body.resource || (req.body?.data?.id);
        
        // Valida o tipo de notificação
        if (!mpType || String(mpType).toLowerCase() !== "payment") {
            console.log(`Tipo de notificação ignorado: ${mpType}`);
            return res.status(200).json({ 
                received: true, 
                message: "Notificação recebida mas não processada (tipo não é payment)" 
            });
        }
        
        if (!incomingPaymentId) {
            console.log("Notificação sem ID de pagamento");
            return res.status(200).json({ 
                received: true, 
                message: "Notificação recebida mas sem dados de pagamento" 
            });
        }
        
        // Normaliza payload para processPaymentNotification
        const normalizedPayload = { data: { id: incomingPaymentId } };
        
        // Processa a notificação de pagamento
        const paymentData = await processPaymentNotification(normalizedPayload);
        
        const { 
            paymentId, 
            status, 
            metadata 
        } = paymentData;
        
        const {
            userId,
            accommodationId,
            checkIn,
            checkOut,
            guests,
            nights,
            totalPrice,
            pricePerNight
        } = metadata;
        
        console.log("Processando pagamento:", {
            paymentId,
            status,
            userId,
            accommodationId,
            totalPrice
        });
        
        // IDEMPOTÊNCIA: Verifica se já existe reserva com este paymentId
        const existingBooking = await Booking.findOne({ 
            mercadopagoPaymentId: paymentId.toString() 
        });
        
        if (existingBooking) {
            console.log(`Reserva já existe para o pagamento ${paymentId}. ID: ${existingBooking._id}`);
            
            // Atualiza o status se mudou
            if (existingBooking.paymentStatus !== mapPaymentStatus(status)) {
                existingBooking.paymentStatus = mapPaymentStatus(status);
                await existingBooking.save();
                console.log(`Status da reserva atualizado para: ${mapPaymentStatus(status)}`);
            }
            
            return res.status(200).json({ 
                received: true, 
                message: "Reserva já existente, status atualizado se necessário",
                bookingId: existingBooking._id
            });
        }
        
        // Mapeia o status do Mercado Pago para nosso status interno
        let paymentStatus = mapPaymentStatus(status);

        // Se o pagamento foi rejeitado, não cria a reserva
        if (paymentStatus === "rejected") {
            console.log(`Pagamento ${paymentId} rejeitado. Reserva não será criada.`);
            return res.status(200).json({ 
                received: true, 
                message: "Pagamento rejeitado, reserva não criada",
                paymentStatus: "rejected"
            });
        }

        // Se não estiver aprovado, tentar captura automática para pagamentos em 'authorized' / 'pending_capture' quando possível
        if (status && ["authorized", "pending_capture"].includes(String(status).toLowerCase())) {
            try {
                console.log(`Pagamento ${paymentId} em estado '${status}'. Tentando captura automática antes de criar reserva.`);
                const { capturePayment } = await import("../domains/payments/captureService.js");
                const captureResult = await capturePayment(paymentId);
                if (captureResult) {
                    console.log("Resultado da captura:", captureResult.status);
                    // Atualiza status e paymentInfo para usar dados mais recentes
                    paymentStatus = mapPaymentStatus(captureResult.status);
                }
            } catch (err) {
                console.error("Falha ao tentar capturar pagamento no webhook:", err?.message || err);
                return res.status(200).json({ received: true, message: "Notificação recebida mas captura falhou; reserva não criada", error: err?.message || err });
            }
        }

        // Somente cria reserva quando o status final for 'approved'
        if (paymentStatus !== "approved") {
            console.log(`Pagamento ${paymentId} não está aprovado (status: ${paymentStatus}). Reserva não criada.`);
            return res.status(200).json({ received: true, message: "Pagamento não aprovado - aguardando confirmação via webhook", paymentStatus });
        }

        // Validação de metadata antes de criar reserva
        if (!userId || !accommodationId || typeof totalPrice === 'undefined' || totalPrice === null || Number.isNaN(Number(totalPrice))) {
            console.error("Metadata incompleta ou inválida - não criando reserva", { userId, accommodationId, totalPrice, metadata });
            return res.status(200).json({ received: true, message: "Metadata incompleta; reserva não criada", paymentStatus, metadata });
        }

        // Cria a reserva somente quando pagamento estiver aprovado
        const newBooking = new Booking({
            place: accommodationId,
            user: userId,
            pricePerNight: Number(pricePerNight) || 0,
            totalPrice: Number(totalPrice),
            checkIn: checkIn,
            checkOut: checkOut,
            guests: Number(guests) || 1,
            nights: Number(nights) || 1,
            paymentStatus: "approved",
            mercadopagoPaymentId: paymentId.toString()
        });

        await newBooking.save();

        console.log(`Reserva criada com sucesso: ${newBooking._id} (Status: approved)`);

        return res.status(200).json({ 
            received: true, 
            message: "Reserva criada com sucesso",
            bookingId: newBooking._id,
            paymentStatus: "approved"
        });
        
    } catch (error) {
        console.error("Erro ao processar webhook:", error);
        
        // Sempre retorna 200 para o Mercado Pago, mesmo em caso de erro
        // Isso evita que o Mercado Pago fique reenviando a notificação
        return res.status(200).json({ 
            received: true, 
            message: "Notificação recebida mas houve erro no processamento",
            error: error.message
        });
    }
};

/**
 * Mapeia status do Mercado Pago para status interno
 * @param {string} mpStatus - Status do Mercado Pago
 * @returns {string} Status interno
 */
const mapPaymentStatus = (mpStatus) => {
    const statusMap = {
        "approved": "approved",
        "pending": "pending",
        "in_process": "pending",
        "in_mediation": "pending",
        "rejected": "rejected",
        "cancelled": "rejected",
        "refunded": "rejected",
        "charged_back": "rejected"
    };
    
    return statusMap[mpStatus] || "pending";
};

/**
 * GET /api/webhook/mercadopago
 * Endpoint para verificação do webhook (usado pelo Mercado Pago ou para health check)
 */
export const verifyWebhook = async (req, res) => {
    res.status(200).json({ 
        status: "Webhook ativo",
        timestamp: new Date().toISOString()
    });
};
