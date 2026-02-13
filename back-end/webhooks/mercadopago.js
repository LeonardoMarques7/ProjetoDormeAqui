import { processPaymentNotification } from "../domains/payments/service.js";
import Booking from "../domains/bookings/model.js";

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
        
        const { type, data } = req.body;
        
        // Valida o tipo de notificação
        if (type !== "payment") {
            console.log(`Tipo de notificação ignorado: ${type}`);
            return res.status(200).json({ 
                received: true, 
                message: "Notificação recebida mas não processada (tipo não é payment)" 
            });
        }
        
        if (!data || !data.id) {
            console.log("Notificação sem ID de pagamento");
            return res.status(200).json({ 
                received: true, 
                message: "Notificação recebida mas sem dados de pagamento" 
            });
        }
        
        // Processa a notificação de pagamento
        const paymentData = await processPaymentNotification(req.body);
        
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
        const paymentStatus = mapPaymentStatus(status);
        
        // Se o pagamento foi rejeitado, não cria a reserva
        if (paymentStatus === "rejected") {
            console.log(`Pagamento ${paymentId} rejeitado. Reserva não será criada.`);
            return res.status(200).json({ 
                received: true, 
                message: "Pagamento rejeitado, reserva não criada",
                paymentStatus: "rejected"
            });
        }
        
        // Cria a reserva (para approved ou pending)
        const newBooking = new Booking({
            place: accommodationId,
            user: userId,
            pricePerNight: pricePerNight,
            totalPrice: totalPrice,
            checkIn: checkIn,
            checkOut: checkOut,
            guests: guests,
            nights: nights,
            paymentStatus: paymentStatus,
            mercadopagoPaymentId: paymentId.toString()
        });
        
        await newBooking.save();
        
        console.log(`Reserva criada com sucesso: ${newBooking._id} (Status: ${paymentStatus})`);
        
        return res.status(200).json({ 
            received: true, 
            message: "Reserva criada com sucesso",
            bookingId: newBooking._id,
            paymentStatus: paymentStatus
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
