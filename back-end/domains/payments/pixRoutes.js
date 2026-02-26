import { Router } from "express";
import { createPixPaymentController, createPixPayloadController, getPixStatusController } from "./pixController.js";
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
      message: "Usuário não autenticado. Faça login para continuar. paymentsPixRoutes",
      error: error.message,
    });
  }
};


router.post("/pix", authenticateUser, createPixPaymentController);

// Polling de status do Pix (autenticado)
router.get("/pix/status/:paymentId", authenticateUser, getPixStatusController);

// Gera payload EMV para testes
router.post("/pix/payload", createPixPayloadController);

export default router;
