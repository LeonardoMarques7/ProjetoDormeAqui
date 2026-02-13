import { preferenceClient, paymentClient, testToken, validateToken } from "../../config/mercadopago.js";
import Place from "../places/model.js";


/**
 * Serviço de Pagamentos - Mercado Pago
 * Responsável por criar preferências de checkout e processar pagamentos
 */

/**
 * Calcula o número de noites entre duas datas
 * @param {Date} checkIn - Data de check-in
 * @param {Date} checkOut - Data de check-out
 * @returns {number} Número de noites
 */
export const calculateNights = (checkIn, checkOut) => {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

/**
 * Calcula o preço total da reserva
 * @param {number} pricePerNight - Preço por noite
 * @param {number} nights - Número de noites
 * @returns {number} Preço total
 */
export const calculateTotalPrice = (pricePerNight, nights) => {
    return pricePerNight * nights;
};

/**
 * Busca acomodação e valida preço
 * @param {string} accommodationId - ID da acomodação
 * @returns {Promise<Object>} Dados da acomodação
 * @throws {Error} Se acomodação não for encontrada
 */
export const getAccommodationDetails = async (accommodationId) => {
    const place = await Place.findById(accommodationId);
    
    if (!place) {
        const error = new Error("Acomodação não encontrada");
        error.statusCode = 404;
        throw error;
    }
    
    return place;
};

/**
 * Cria uma preferência de checkout no Mercado Pago
 * @param {Object} params - Parâmetros da preferência
 * @param {string} params.accommodationId - ID da acomodação
 * @param {string} params.userId - ID do usuário
 * @param {Date} params.checkIn - Data de check-in
 * @param {Date} params.checkOut - Data de check-out
 * @param {number} params.guests - Número de hóspedes
 * @param {string} params.frontendUrl - URL base do frontend
 * @returns {Promise<Object>} Dados da preferência criada
 */
export const createCheckoutPreference = async ({
    accommodationId,
    userId,
    checkIn,
    checkOut,
    guests,
    frontendUrl
}) => {
    console.log("🔍 Iniciando criação de preferência:", {
        accommodationId,
        userId,
        checkIn: checkIn?.toISOString?.(),
        checkOut: checkOut?.toISOString?.(),
        guests,
        frontendUrl
    });

    // Validações de entrada
    if (!accommodationId || !userId || !checkIn || !checkOut || !guests) {
        console.error("❌ Dados incompletos:", { accommodationId, userId, checkIn, checkOut, guests });
        const error = new Error("Dados incompletos para criar preferência");
        error.statusCode = 400;
        throw error;
    }

    // Busca acomodação e valida
    let place;
    try {
        place = await getAccommodationDetails(accommodationId);
        console.log("✅ Acomodação encontrada:", place.title, "Preço:", place.price);
    } catch (error) {
        console.error("❌ Erro ao buscar acomodação:", error.message);
        throw error;
    }
    
    // Calcula noites e preço total (backend sempre recalcula - nunca confia no frontend)
    const nights = calculateNights(checkIn, checkOut);
    const totalPrice = calculateTotalPrice(place.price, nights);
    
    console.log("💰 Cálculo de preço:", { nights, pricePerNight: place.price, totalPrice });
    
    // Validações de negócio
    if (nights <= 0) {
        const error = new Error("Período de estadia inválido");
        error.statusCode = 400;
        throw error;
    }
    
    if (guests > place.guests) {
        const error = new Error("Número de hóspedes excede o limite da acomodação");
        error.statusCode = 400;
        throw error;
    }

    // Verifica se MERCADO_PAGO_WEBHOOK_URL está configurado
    if (!process.env.MERCADO_PAGO_WEBHOOK_URL) {
        console.error("❌ MERCADO_PAGO_WEBHOOK_URL não configurado!");
        const error = new Error("Configuração de webhook ausente");
        error.statusCode = 500;
        throw error;
    }
    
    // Cria a preferência no Mercado Pago
    const preferenceData = {
        items: [
            {
                id: accommodationId,
                title: place.title || "Estadia DormeAqui",
                description: `Estadia em ${place.city || 'Local não especificado'} - ${nights} noite(s)`,
                quantity: 1,
                currency_id: "BRL",
                unit_price: Number(totalPrice),
                picture_url: place.photos?.[0] || undefined
            }
        ],
        back_urls: {
            success: `${frontendUrl}/payment/success`,
            pending: `${frontendUrl}/payment/pending`,
            failure: `${frontendUrl}/payment/failure`
        },
        // auto_return desabilitado temporariamente - requer back_urls.success válido
        // auto_return: "approved",

        notification_url: process.env.MERCADO_PAGO_WEBHOOK_URL,
        external_reference: `booking_${Date.now()}_${accommodationId}`,
        metadata: {
            userId: userId.toString(),
            accommodationId: accommodationId.toString(),
            checkIn: checkIn.toISOString(),
            checkOut: checkOut.toISOString(),
            guests: guests.toString(),
            nights: nights.toString(),
            totalPrice: totalPrice.toString(),
            pricePerNight: place.price.toString()
        }
    };

    console.log("📦 Dados da preferência:", JSON.stringify(preferenceData, null, 2));
    
    try {
        console.log("🚀 Chamando Mercado Pago API...");
        const response = await preferenceClient.create({ body: preferenceData });
        
        console.log("✅ Preferência criada com sucesso:", {
            preferenceId: response.id,
            initPoint: response.init_point
        });
        
        return {
            preferenceId: response.id,
            initPoint: response.init_point,
            sandboxInitPoint: response.sandbox_init_point,
            totalPrice,
            nights,
            pricePerNight: place.price,
            accommodationTitle: place.title
        };
    } catch (error) {
        console.error("❌ Erro detalhado ao criar preferência Mercado Pago:");
        console.error("Mensagem:", error.message);
        console.error("Stack:", error.stack);
        
        // Captura detalhes completos do erro
        const errorDetails = {
            message: error.message,
            status: error.status || error.statusCode,
            code: error.code,
            responseData: error.response?.data,
            responseBody: error.response?.body,
            cause: error.cause,
            name: error.name
        };
        
        console.error("Detalhes completos do erro:", JSON.stringify(errorDetails, null, 2));
        
        // Análise específica do erro 403 UNAUTHORIZED
        if (error.status === 403 || error.message?.includes("UNAUTHORIZED")) {
            console.error("🔴 ERRO DE AUTENTICAÇÃO DETECTADO");
            console.error("Possíveis causas:");
            console.error("1. Token inválido ou expirado");
            console.error("2. Token truncado durante cópia");
            console.error("3. Conta do Mercado Pago com restrições");
            console.error("4. Token de produção sendo usado em ambiente de teste");
            
            // Valida o token novamente
            const tokenValidation = validateToken();
            console.error("Validação do token:", tokenValidation);
        }
        
        const newError = new Error(`Erro ao criar preferência: ${error.message}`);
        newError.statusCode = error.status || 500;
        newError.originalError = errorDetails;
        throw newError;
    }

};


/**
 * Verifica se o token do Mercado Pago está configurado corretamente
 * @returns {Promise<Object>} Resultado da verificação
 */
export const verifyMercadoPagoConfig = async () => {
    console.log("🔍 Verificando configuração do Mercado Pago...");
    
    // Primeiro valida o formato do token
    const validation = validateToken();
    if (!validation.valid) {
        return {
            success: false,
            message: "Token inválido",
            details: validation
        };
    }
    
    // Testa o token fazendo uma chamada real
    const testResult = await testToken();
    return testResult;
};

/**
 * Busca informações de um pagamento no Mercado Pago
 * @param {string} paymentId - ID do pagamento
 * @returns {Promise<Object>} Dados do pagamento
 */
export const getPaymentInfo = async (paymentId) => {

    try {
        const response = await paymentClient.get({ id: paymentId });
        return response;
    } catch (error) {
        console.error("Erro ao buscar pagamento:", error);
        const newError = new Error("Erro ao buscar informações do pagamento");
        newError.statusCode = 500;
        throw newError;
    }
};

/**
 * Processa notificação de pagamento do webhook
 * @param {Object} paymentData - Dados do pagamento recebido
 * @returns {Promise<Object>} Resultado do processamento
 */
export const processPaymentNotification = async (paymentData) => {
    const { data } = paymentData;
    
    if (!data || !data.id) {
        const error = new Error("Dados de pagamento inválidos");
        error.statusCode = 400;
        throw error;
    }
    
    // Busca informações detalhadas do pagamento
    const paymentInfo = await getPaymentInfo(data.id);
    
    if (!paymentInfo || !paymentInfo.metadata) {
        const error = new Error("Não foi possível obter informações do pagamento");
        error.statusCode = 500;
        throw error;
    }
    
    const { metadata } = paymentInfo;
    const paymentStatus = paymentInfo.status; // approved, pending, rejected, etc.
    
    return {
        paymentId: data.id,
        status: paymentStatus,
        metadata: {
            userId: metadata.userId,
            accommodationId: metadata.accommodationId,
            checkIn: new Date(metadata.checkIn),
            checkOut: new Date(metadata.checkOut),
            guests: parseInt(metadata.guests),
            nights: parseInt(metadata.nights),
            totalPrice: parseFloat(metadata.totalPrice),
            pricePerNight: parseFloat(metadata.pricePerNight)
        },
        paymentInfo
    };
};
