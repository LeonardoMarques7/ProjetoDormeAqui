import { Router } from "express";
import { createTransparentPayment, createStripeCheckoutSession } from "./transparentController.js";
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
      message: "Usuário não autenticado. Faça login para continuar. transparentRoutes",
      error: error.message,
    });
  }
};

router.post("/transparent", authenticateUser, createTransparentPayment);

// Stripe Checkout (hosted): requer autenticação pois o userId é necessário para criar a reserva via webhook
router.post("/checkout-session", authenticateUser, createStripeCheckoutSession);

import { captureAuthorizedPayment } from "./controller.js";

router.post("/capture/:paymentId", authenticateUser, (req, res, next) => {
  if (!["admin", "moderator"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Permissao insuficiente" });
  }
  return captureAuthorizedPayment(req, res, next);
});


export default router;
