import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import "dotenv/config";

/**
 * Configuração do Mercado Pago
 * Inicializa o SDK com o access token do ambiente
 */

// Valida se o token está configurado
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

/**
 * Valida o formato do token do Mercado Pago
 * @returns {Object} Resultado da validação
 */
export const validateToken = () => {
    if (!accessToken) {
        return {
            valid: false,
            error: "MERCADO_PAGO_ACCESS_TOKEN não está configurado",
            details: "Adicione MERCADO_PAGO_ACCESS_TOKEN ao arquivo .env"
        };
    }

    const isTestToken = accessToken.startsWith("TEST-");
    const isProdToken = accessToken.startsWith("APP_USR-");
    const tokenLength = accessToken.length;

    // Log de configuração
    console.log("🔧 Configurando Mercado Pago...");
    console.log("Token presente: Sim");
    console.log("Comprimento do token:", tokenLength, "caracteres");
    console.log("Prefixo:", accessToken.substring(0, 10) + "...");

    if (!isTestToken && !isProdToken) {
        return {
            valid: false,
            error: "Token não começa com TEST- ou APP_USR-",
            details: `Token inválido: ${accessToken.substring(0, 20)}...`
        };
    }
    return {
        valid: true,
        type: isTestToken ? "TESTE" : "PRODUÇÃO",
        length: tokenLength
    };
};

// Executa validação inicial
const validation = validateToken();
if (!validation.valid) {
    console.error("❌ ERRO CRÍTICO:", validation.error);
    console.error("Detalhes:", validation.details);
} else {
    console.log("✅ Token válido detectado");
    console.log("Ambiente:", validation.type);
}

const validToken = validation.valid ? accessToken : "INVALID_TOKEN";

/**
 * Configuração do SDK Mercado Pago
 * Inclui opções adicionais para melhor compatibilidade
 */
const mercadopagoConfig = new MercadoPagoConfig({
    accessToken: validToken,
    options: {
        timeout: 30000, // Aumentado para 30 segundos para evitar ERR_CONNECTION_RESET
        idempotencyKey: `dormeaqui-${Date.now()}-${Math.random().toString(36).substring(7)}`
    }
});

console.log("🔧 MercadoPagoConfig criado com timeout de 30s");


// Clientes específicos para cada funcionalidade
export const preferenceClient = new Preference(mercadopagoConfig);
export const paymentClient = new Payment(mercadopagoConfig);

/**
 * Testa se o token do Mercado Pago está funcionando
 * Faz uma chamada simples à API para verificar autenticação
 * @returns {Promise<Object>} Resultado do teste
 */
export const testToken = async () => {
    try {
        // Tenta criar uma preferência de teste mínima
        const testPreference = {
            items: [
                {
                    title: "Teste de Configuração",
                    quantity: 1,
                    currency_id: "BRL",
                    unit_price: 1.00
                }
            ]
        };

        const response = await preferenceClient.create({ body: testPreference });
        
        return {
            success: true,
            message: "Token válido e funcionando",
            preferenceId: response.id,
            initPoint: response.init_point
        };
    } catch (error) {
        console.error("❌ Erro ao testar token:", error);
        
        // Analisa o erro específico
        let errorDetails = {
            message: error.message,
            status: error.status || error.statusCode,
            code: error.code
        };

        // Se for erro de autenticação
        if (error.status === 403 || error.message?.includes("UNAUTHORIZED")) {
            errorDetails.suggestion = "Token inválido ou expirado. Gere um novo token no dashboard do Mercado Pago.";
        }

        return {
            success: false,
            message: "Falha na autenticação com Mercado Pago",
            error: errorDetails
        };
    }
};

export default mercadopagoConfig;
