import { Router } from "express";
import { requireAuth } from "../middleware.js";
import { buildAccommodationLogbook } from "./service.js";

const router = Router();

router.get("/accommodations", requireAuth, async (req, res) => {
  try {
    const result = await buildAccommodationLogbook(req.user._id, req.query);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao carregar logbook das acomodações:", error);
    return res.status(500).json({
      message: "Erro ao carregar logbook das acomodações.",
    });
  }
});

export default router;
