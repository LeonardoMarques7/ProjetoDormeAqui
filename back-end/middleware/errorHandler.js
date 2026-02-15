/**
 * Middleware de Tratamento de Erros
 * Centraliza o tratamento de erros da aplicação
 */

/**
 * Error Handler Middleware
 * @param {Error} err - Objeto de erro
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 * @param {NextFunction} next - Função next
 */
export const errorHandler = (err, req, res, next) => {
    console.error("❌ Erro capturado no errorHandler:");
    console.error("Mensagem:", err.message);
    console.error("Status Code:", err.statusCode || err.status || 500);
    console.error("Stack:", err.stack);
    
    // Se for erro da API do Mercado Pago, mostra detalhes específicos
    if (err.originalError) {
        console.error("Erro original (Mercado Pago):", err.originalError);
        console.error("Resposta da API:", err.originalError.response?.data);
        console.error("Status da API:", err.originalError.status);
    }
    
    // Define o status code (padrão 500)
    const statusCode = err.statusCode || err.status || 500;
    
    // Mensagem de erro (não expõe detalhes internos em produção)
    const isDevelopment = process.env.NODE_ENV === "development";
    let message = err.message || getPublicErrorMessage(statusCode);
    
    // Se for erro do Mercado Pago, adiciona contexto
    if (err.originalError?.response?.data) {
        const mpError = err.originalError.response.data;
        message += ` | Mercado Pago: ${mpError.message || mpError.error || 'Erro desconhecido'}`;
    }
    
    // Resposta padronizada
    const errorResponse = {
        success: false,
        message: message,
        ...(isDevelopment && { 
            stack: err.stack,
            originalError: err.originalError?.message,
            mercadoPagoError: err.originalError?.response?.data,
            details: err 
        })
    };
    
    console.error("📤 Resposta de erro enviada:", errorResponse);
    res.status(statusCode).json(errorResponse);
};


/**
 * Retorna mensagens de erro amigáveis para o usuário
 * @param {number} statusCode - Código de status HTTP
 * @returns {string} Mensagem amigável
 */
const getPublicErrorMessage = (statusCode) => {
    const messages = {
        400: "Dados inválidos. Verifique as informações enviadas.",
        401: "Acesso não autorizado. Faça login para continuar.",
        403: "Acesso proibido. Você não tem permissão para esta ação.",
        404: "Recurso não encontrado.",
        409: "Conflito de dados. A ação não pode ser realizada.",
        422: "Dados inválidos. Verifique as informações enviadas.",
        500: "Erro interno do servidor. Tente novamente mais tarde."
    };
    
    return messages[statusCode] || "Ocorreu um erro inesperado. Tente novamente.";
};

/**
 * Middleware para rotas não encontradas (404)
 */
export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: "Rota não encontrada",
        path: req.originalUrl,
        method: req.method
    });
};

/**
 * Wrapper para controllers async
 * Elimina a necessidade de try/catch em cada controller
 * @param {Function} fn - Função controller async
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
