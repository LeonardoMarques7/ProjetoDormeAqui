import { Router } from "express";
import UserRoutes from "../domains/users/routes.js";
import PlacesRoutes from "../domains/places/routes.js";
import BookingRoutes from "../domains/bookings/routes.js";
import ReviewRoutes from "../domains/reviews/routes.js";
import PaymentRoutes from "../domains/payments/routes.js";
import { handleMercadoPagoWebhook, verifyWebhook } from "../webhooks/mercadopago.js";

const router = Router();

// Rotas de domínio
router.use("/users", UserRoutes);
router.use("/places", PlacesRoutes);
router.use("/bookings", BookingRoutes);
router.use("/reviews", ReviewRoutes);
router.use("/payments", PaymentRoutes);

// Webhook do Mercado Pago (rota pública, sem autenticação)
router.post("/webhook/mercadopago", handleMercadoPagoWebhook);
router.get("/webhook/mercadopago", verifyWebhook);

export default router;
