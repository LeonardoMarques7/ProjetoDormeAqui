import axios from 'axios';
import 'dotenv/config';
import crypto from 'crypto';

// Lightweight Mercado Pago client using REST API to avoid SDK dependency

// Valida se o token está configurado
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

export const validateToken = () => {
    if (!accessToken) {
        return {
            valid: false,
            error: 'MERCADO_PAGO_ACCESS_TOKEN não está configurado',
            details: 'Adicione MERCADO_PAGO_ACCESS_TOKEN ao arquivo .env'
        };
    }

    const isTestToken = accessToken.startsWith('TEST-');
    const isProdToken = accessToken.startsWith('APP_USR-');
    const tokenLength = accessToken.length;

    console.log('🔧 Configurando Mercado Pago (REST client)...');
    console.log('Token presente: Sim');
    console.log('Comprimento do token:', tokenLength, 'caracteres');
    console.log('Prefixo:', accessToken.substring(0, 10) + '...');

    if (!isTestToken && !isProdToken) {
        return {
            valid: false,
            error: 'Token não começa com TEST- ou APP_USR-',
            details: `Token inválido: ${accessToken.substring(0, 20)}...`
        };
    }
    return {
        valid: true,
        type: isTestToken ? 'TESTE' : 'PRODUÇÃO',
        length: tokenLength
    };
};

// Executa validação inicial
const validation = validateToken();
if (!validation.valid) {
    console.error('❌ ERRO CRÍTICO:', validation.error);
    console.error('Detalhes:', validation.details);
} else {
    console.log('✅ Token válido detectado');
    console.log('Ambiente:', validation.type);
}

const validToken = validation.valid ? accessToken : 'INVALID_TOKEN';

const api = axios.create({
    baseURL: process.env.MERCADO_PAGO_API_URL || 'https://api.mercadopago.com',
    timeout: 30000,
    headers: {
        Authorization: `Bearer ${validToken}`,
        'Content-Type': 'application/json'
    }
});

export const preferenceClient = {
    create: async ({ body }) => {
        const res = await api.post('/checkout/preferences', body);
        return res.data;
    }
};

export const paymentClient = {
    create: async ({ body }) => {
        const idempotencyKey = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const res = await api.post('/v1/payments', body, { headers: { 'X-Idempotency-Key': idempotencyKey } });
        return res.data;
    },
    get: async ({ id }) => {
        const res = await api.get(`/v1/payments/${id}`);
        return res.data;
    },
    capture: async ({ id }) => {
        const res = await api.post(`/v1/payments/${id}/capture`);
        return res.data;
    }
};

export const createPreferenceWithBackUrls = async (preferenceData) => {
    console.log('🚀 [REST] Criando preferência com back_urls');
    console.log('🚀 [REST] Dados enviados:', JSON.stringify(preferenceData, null, 2));
    try {
        const response = await preferenceClient.create({ body: preferenceData });
        console.log('✅ [REST] Preferência criada:');
        console.log('✅ [REST] ID:', response.id);
        console.log('✅ [REST] back_urls na resposta:', JSON.stringify(response.back_urls, null, 2));
        console.log('✅ [REST] navigation:', JSON.stringify(response.navigation, null, 2));
        return response;
    } catch (error) {
        console.error('❌ [REST] Erro ao criar preferência:');
        console.error('❌ [REST] Mensagem:', error.message);
        console.error('❌ [REST] Status:', error.response?.status);
        console.error('❌ [REST] Response data:', error.response?.data);
        throw error;
    }
};

export const testToken = async () => {
    try {
        const testPreference = {
            items: [
                {
                    title: 'Teste de Configuração',
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: 1.0
                }
            ]
        };
        const response = await preferenceClient.create({ body: testPreference });
        return {
            success: true,
            message: 'Token válido e funcionando',
            preferenceId: response.id,
            initPoint: response.init_point
        };
    } catch (error) {
        console.error('❌ Erro ao testar token (REST):', error?.response?.data || error.message);
        let errorDetails = {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        };
        if (error.response?.status === 403 || error.message?.includes('UNAUTHORIZED')) {
            errorDetails.suggestion = 'Token inválido ou expirado. Gere um novo token no dashboard do Mercado Pago.';
        }
        return {
            success: false,
            message: 'Falha na autenticação com Mercado Pago',
            error: errorDetails
        };
    }
};

export default api;
