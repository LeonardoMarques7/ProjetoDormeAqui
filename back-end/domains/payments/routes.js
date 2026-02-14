import { Router } from "express";
import { createPaymentPreference, checkPaymentStatus, testMercadoPagoConfig } from "./controller.js";
import { JWTVerify } from "../../ultis/jwt.js";


const router = Router();

// Configuração do cookie baseada no ambiente
const isProduction = process.env.NODE_ENV === 'production';
const COOKIE_NAME = isProduction ? 'prod_auth_token' : 'dev_auth_token';

/**
 * Middleware de autenticação para rotas de pagamento
 */
const authenticateUser = async (req, res, next) => {
    try {
        const userInfo = await JWTVerify(req, COOKIE_NAME);
        req.user = userInfo;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Usuário não autenticado. Faça login para continuar.",
            error: error.message
        });
    }
};

/**
 * POST /api/payments/create
 * Cria uma preferência de checkout Mercado Pago
 * Requer autenticação
 */
router.post("/create", authenticateUser, createPaymentPreference);

/**
 * GET /api/payments/status/:paymentId
 * Verifica status de um pagamento (para consultas manuais)
 * Requer autenticação
 */
router.get("/status/:paymentId", authenticateUser, checkPaymentStatus);

/**
 * GET /api/payments/test-config
 * Testa a configuração do Mercado Pago (token, autenticação)
 * Endpoint público - não requer autenticação
 */
router.get("/test-config", testMercadoPagoConfig);

import transparentRoutes from "./transparentRoutes.js";
import pixRoutes from "./pixRoutes.js";
router.use(transparentRoutes);
router.use(pixRoutes);

export default router;
