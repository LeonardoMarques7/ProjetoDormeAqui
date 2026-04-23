import { Router } from "express";
import { JWTVerify } from "../../ultis/jwt.js";
import { buildHostDashboardData } from "./service.js";

const router = Router();

const isProduction = process.env.NODE_ENV === "production";
const COOKIE_NAME = isProduction ? "prod_auth_token" : "dev_auth_token";

router.get("/host", async (req, res) => {
  try {
    const { _id: hostId } = await JWTVerify(req, COOKIE_NAME);
    const dashboardData = await buildHostDashboardData(hostId);
    return res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Erro ao buscar dashboard do anfitrião:", error);
    return res.status(500).json({ message: "Erro ao carregar dashboard do anfitrião." });
  }
});

export default router;

