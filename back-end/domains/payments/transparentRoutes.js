import { Router } from "express";
import { createTransparentPayment } from "./transparentController.js";
import { JWTVerify } from "../../ultis/jwt.js";

const router = Router();

const isProduction = process.env.NODE_ENV === "production";
const COOKIE_NAME = isProduction ? "prod_auth_token" : "dev_auth_token";

const authenticateUser = async (req, res, next) => {
  try {
    const userInfo = await JWTVerify(req, COOKIE_NAME);
    req.user = userInfo;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Usuário não autenticado. Faça login para continuar.",
      error: error.message,
    });
  }
};

// Middleware que tenta autenticar, mas permite requisições sem autenticação (guest checkout)
const optionalAuthenticate = async (req, res, next) => {
  try {
    const userInfo = await JWTVerify(req, COOKIE_NAME);
    req.user = userInfo;
  } catch (error) {
    // Não autentica, mas permite seguir como usuário anônimo
    console.warn('transparentRoutes: request without valid auth, proceeding as guest');
    req.user = null;
  }
  next();
};

// Use authentication optional para permitir pagamentos sem sessão (ex.: checkout rápido)
router.post("/transparent", optionalAuthenticate, createTransparentPayment);

import { captureAuthorizedPayment } from "./controller.js";

router.post("/capture/:paymentId", captureAuthorizedPayment);


export default router;
