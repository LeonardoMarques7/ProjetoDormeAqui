import axios from "axios";

/**
 * Serviço de Pagamentos - Frontend
 * Responsável por comunicar com a API de pagamentos do backend
 */

// Configuração de timeout para evitar ERR_CONNECTION_RESET
const PAYMENT_TIMEOUT = 30000; // 30 segundos

/**
 * Cria uma preferência de checkout no Mercado Pago
 * @param {Object} bookingData - Dados da reserva
 * @param {string} bookingData.accommodationId - ID da acomodação
 * @param {string} bookingData.checkIn - Data de check-in (ISO 8601)
 * @param {string} bookingData.checkOut - Data de check-out (ISO 8601)
 * @param {number} bookingData.guests - Número de hóspedes
 * @returns {Promise<Object>} Dados da preferência criada
 */
export const createCheckoutPreference = async (bookingData) => {
    console.log("🚀 [FRONTEND] Iniciando createCheckoutPreference");
    console.log("Dados:", bookingData);
    
    try {
        const response = await axios.post("/payments/create", bookingData, {
            timeout: PAYMENT_TIMEOUT,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log("✅ [FRONTEND] Resposta recebida:", response.data);
        
        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || "Erro ao criar preferência de pagamento");
        }
    } catch (error) {
        console.error("❌ [FRONTEND] Erro ao criar preferência:", error);
        
        // Tratamento específico de erros de rede
        if (error.code === 'ERR_NETWORK' || error.code === 'ECONNRESET' || error.message === 'Network Error') {
            console.error("🔴 Erro de conexão detectado");
            throw new Error("Erro de conexão com o servidor. Verifique se o backend está rodando na porta 3000.");
        }
        
        // Tratamento de timeout
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            console.error("🔴 Timeout na requisição");
            throw new Error("A requisição demorou muito. Tente novamente.");
        }
        
        // Tratamento específico de erros HTTP
        if (error.response) {
            const { status, data } = error.response;
            
            switch (status) {
                case 400:
                    throw new Error(data.message || "Dados inválidos. Verifique as informações.");
                case 401:
                    throw new Error("Você precisa estar logado para fazer uma reserva.");
                case 404:
                    throw new Error("Acomodação não encontrada.");
                case 409:
                    throw new Error(data.message || "Conflito ao criar reserva.");
                case 500:
                    throw new Error(data.message || "Erro interno do servidor. Tente novamente.");
                default:
                    throw new Error(data.message || "Erro ao processar pagamento. Tente novamente.");
            }
        }
        
        throw new Error("Erro de conexão. Verifique sua internet.");
    }
};

/**
 * Verifica o status de um pagamento
 * @param {string} paymentId - ID do pagamento
 * @returns {Promise<Object>} Status do pagamento
 */
export const checkPaymentStatus = async (paymentId) => {
    try {
        const response = await axios.get(`/payments/status/${paymentId}`, {
            timeout: PAYMENT_TIMEOUT
        });
        
        if (response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || "Erro ao verificar status");
        }
    } catch (error) {
        console.error("Erro ao verificar status:", error);
        throw new Error("Não foi possível verificar o status do pagamento.");
    }
};

/**
 * Redireciona o usuário para o checkout do Mercado Pago
 * @param {string} initPoint - URL de checkout (init_point)
 */
export const redirectToCheckout = (initPoint) => {
    if (!initPoint) {
        throw new Error("URL de checkout inválida");
    }
    
    // Redireciona para o Mercado Pago
    window.location.href = initPoint;
};

/**
 * Testa a configuração do Mercado Pago
 * @returns {Promise<Object>} Resultado do teste
 */
export const testPaymentConfig = async () => {
    try {
        const response = await axios.get("/payments/test-config", {
            timeout: PAYMENT_TIMEOUT
        });
        
        return response.data;
    } catch (error) {
        console.error("Erro ao testar configuração:", error);
        throw new Error("Não foi possível testar a configuração de pagamento.");
    }
};
