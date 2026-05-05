import { Router } from "express";
import { JWTVerify } from "../../ultis/jwt.js";
import {
  createFinancialEntryController,
  deleteFinancialEntryController,
  getFinancialEntries,
  getMonthlyFinancialSummary,
  updateFinancialEntryController,
} from "./controller.js";

const router = Router();

const isProduction = process.env.NODE_ENV === "production";
const COOKIE_NAME = isProduction ? "prod_auth_token" : "dev_auth_token";

const authenticateUser = async (req, res, next) => {
  try {
    req.user = await JWTVerify(req, COOKIE_NAME);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Usuário não autenticado. Faça login para continuar.",
      error: error.message,
    });
  }
};

router.use(authenticateUser);

router.get("/", getFinancialEntries);
router.get("/summary", getMonthlyFinancialSummary);
router.post("/", createFinancialEntryController);
router.patch("/:entryId", updateFinancialEntryController);
router.delete("/:entryId", deleteFinancialEntryController);

export default router;
