import { preferenceClient, paymentClient, testToken, validateToken, createPreferenceWithBackUrls } from "../../config/mercadopago.js";
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
    frontendUrl,
    payerEmail
}) => {
    console.log("🔍 [SERVICE] Iniciando criação de preferência");
    console.log("🔍 [SERVICE] Parâmetros:", {
        accommodationId,
        userId: userId?.toString?.() || userId,
        checkIn: checkIn?.toISOString?.(),
        checkOut: checkOut?.toISOString?.(),
        guests,
        frontendUrl
    });

    // Validações de entrada
    if (!accommodationId || !userId || !checkIn || !checkOut || !guests) {
        console.error("❌ [SERVICE] Dados incompletos:", { accommodationId, userId, checkIn, checkOut, guests });
        const error = new Error("Dados incompletos para criar preferência");
        error.statusCode = 400;
        throw error;
    }

    // Validação do frontendUrl
    if (!frontendUrl) {
        console.error("❌ [SERVICE] frontendUrl não fornecido!");
        const error = new Error("URL do frontend não configurada");
        error.statusCode = 500;
        throw error;
    }

    // Garante que a URL começa com http:// ou https://
    let baseUrl = frontendUrl.trim();
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        console.error("❌ [SERVICE] URL do frontend inválida:", baseUrl);
        const error = new Error("URL do frontend inválida - deve começar com http:// ou https://");
        error.statusCode = 500;
        throw error;
    }

    // Remove trailing slash se existir
    baseUrl = baseUrl.replace(/\/$/, '');
    console.log("🔗 [SERVICE] Base URL:", baseUrl);

    // Busca acomodação e valida
    let place;
    try {
        place = await getAccommodationDetails(accommodationId);
        console.log("✅ [SERVICE] Acomodação:", place.title, "- R$", place.price);
    } catch (error) {
        console.error("❌ [SERVICE] Erro ao buscar acomodação:", error.message);
        throw error;
    }
    
    // Calcula noites e preço total
    const nights = calculateNights(checkIn, checkOut);
    const totalPrice = calculateTotalPrice(place.price, nights);
    
    console.log("💰 [SERVICE] Cálculo:", { nights, pricePerNight: place.price, totalPrice });
    
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

    // Verifica webhook URL
    if (!process.env.MERCADO_PAGO_WEBHOOK_URL) {
        console.error("❌ [SERVICE] MERCADO_PAGO_WEBHOOK_URL não configurado!");
        const error = new Error("Configuração de webhook ausente");
        error.statusCode = 500;
        throw error;
    }
    
    // Configura as URLs de retorno - formato exato exigido pelo Mercado Pago
    const successUrl = `${baseUrl}/payment/success`;
    const failureUrl = `${baseUrl}/payment/failure`;
    const pendingUrl = `${baseUrl}/payment/pending`;

    console.log("🔗 [SERVICE] Back URLs:");
    console.log("  success:", successUrl);
    console.log("  failure:", failureUrl);
    console.log("  pending:", pendingUrl);

    const itemCategoryId = process.env.MERCADO_PAGO_ITEM_CATEGORY_ID || "lodging";

    // Cria a preferência no Mercado Pago
    // NOTA: O Mercado Pago SDK pode não estar passando back_urls corretamente
    // Vamos tentar diferentes formatos
    const preferenceData = {
        items: [
            {
                id: accommodationId,
                title: place.title || "Estadia DormeAqui",
                description: `Estadia em ${place.city || 'Local não especificado'} - ${nights} noite(s)`,
                quantity: 1,
                currency_id: "BRL",
                unit_price: Number(totalPrice),
                picture_url: place.photos?.[0] || undefined,
                category_id: itemCategoryId
            }
        ],
        payer: payerEmail ? { email: payerEmail } : undefined,
        // Formato 1: back_urls direto no objeto raiz
          back_urls: {
            success: successUrl,
            failure: failureUrl,
            pending: pendingUrl
        },
        // Formato 2: navigation.back_urls (algumas versões do SDK usam isso)
        navigation: {
            back_urls: {
                success: successUrl,
                failure: failureUrl,
                pending: pendingUrl
            }
        },
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

    console.log("📦 [SERVICE] Enviando para Mercado Pago:");
    console.log("📦 [SERVICE] back_urls:", JSON.stringify(preferenceData.back_urls, null, 2));
    
    try {
        console.log("🚀 [SERVICE] Chamando API do Mercado Pago...");
        
        // Usa a função auxiliar que tem logs detalhados
        const response = await createPreferenceWithBackUrls(preferenceData);
        
        console.log("✅ [SERVICE] Resposta recebida:");
        console.log("✅ [SERVICE] Preference ID:", response.id);
        console.log("✅ [SERVICE] init_point:", response.init_point);
        
        // Verifica se as back_urls foram salvas
        const responseBackUrls = response.back_urls || response.navigation?.back_urls;
        console.log("✅ [SERVICE] back_urls na resposta:", JSON.stringify(responseBackUrls, null, 2));
        
        // Se as back_urls estiverem vazias, loga um aviso
        if (!responseBackUrls || !responseBackUrls.success) {
            console.warn("⚠️ [SERVICE] ATENÇÃO: back_urls não foram salvas na preferência!");
            console.warn("⚠️ [SERVICE] Isso pode ser um problema com o token ou a conta do Mercado Pago");
        }
        
        return {
            preferenceId: response.id,
            initPoint: response.init_point,
            sandboxInitPoint: response.sandbox_init_point,
            totalPrice,
            nights,
            pricePerNight: place.price,
            accommodationTitle: place.title,
            backUrls: responseBackUrls // Retorna para o controller verificar
        };
    } catch (error) {
        console.error("❌ [SERVICE] Erro ao criar preferência:");
        console.error("❌ [SERVICE] Mensagem:", error.message);
        console.error("❌ [SERVICE] Status:", error.status);
        console.error("❌ [SERVICE] Response:", error.response?.data);
        
        const newError = new Error(`Erro ao criar preferência: ${error.message}`);
        newError.statusCode = error.status || 500;
        newError.originalError = error;
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
    const incomingId = paymentData?.data?.id || paymentData?.id || paymentData?.resource;
    if (!incomingId) {
        const error = new Error("Dados de pagamento inválidos");
        error.statusCode = 400;
        throw error;
    }

    // Busca informações detalhadas do pagamento
    const paymentInfo = await getPaymentInfo(incomingId);
    if (!paymentInfo) {
        const error = new Error("Não foi possível obter informações do pagamento");
        error.statusCode = 500;
        throw error;
    }

    const paymentStatus = paymentInfo.status; // approved, pending, rejected, etc.

    // Reconstrói metadata de forma robusta a partir de diferentes fontes
    const rawMeta = paymentInfo.metadata || {};
    let userId = rawMeta.userId || rawMeta.user || undefined;
    let accommodationId = rawMeta.accommodationId || rawMeta.accommodation || undefined;
    let checkIn = rawMeta.checkIn || rawMeta.check_in || undefined;
    let checkOut = rawMeta.checkOut || rawMeta.check_out || undefined;
    let guests = rawMeta.guests || rawMeta.numGuests || undefined;
    let nights = rawMeta.nights || undefined;
    let totalPrice = rawMeta.totalPrice || rawMeta.total || undefined;
    let pricePerNight = rawMeta.pricePerNight || undefined;

    // Fallback a partir de external_reference e additional_info
    if (!accommodationId && paymentInfo.external_reference) {
        const match = String(paymentInfo.external_reference).match(/booking_\d+_(\w+)/);
        if (match) accommodationId = match[1];
    }
    if (!accommodationId && paymentInfo.additional_info?.items?.[0]?.id) {
        accommodationId = paymentInfo.additional_info.items[0].id;
    }
    if (!totalPrice && paymentInfo.transaction_amount) {
        totalPrice = paymentInfo.transaction_amount;
    }

    // Normaliza tipos
    const parsedTotal = totalPrice !== undefined ? parseFloat(totalPrice) : NaN;
    const parsedGuests = guests !== undefined ? parseInt(guests) : NaN;
    const parsedNights = nights !== undefined ? parseInt(nights) : NaN;
    const parsedPricePerNight = pricePerNight !== undefined ? parseFloat(pricePerNight) : NaN;

    const parsedCheckIn = checkIn ? new Date(checkIn) : undefined;
    const parsedCheckOut = checkOut ? new Date(checkOut) : undefined;

    return {
        paymentId: String(incomingId),
        status: paymentStatus,
        metadata: {
            userId,
            accommodationId,
            checkIn: parsedCheckIn,
            checkOut: parsedCheckOut,
            guests: isNaN(parsedGuests) ? undefined : parsedGuests,
            nights: isNaN(parsedNights) ? undefined : parsedNights,
            totalPrice: isNaN(parsedTotal) ? undefined : parsedTotal,
            pricePerNight: isNaN(parsedPricePerNight) ? undefined : parsedPricePerNight
        },
        paymentInfo
    };
};
