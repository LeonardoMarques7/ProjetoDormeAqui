import { Router } from "express";
import UserRoutes from "../domains/users/routes.js";
import PlacesRoutes from "../domains/places/routes.js";
import BookingRoutes from "../domains/bookings/routes.js";

const router = Router();

router.use("/users", UserRoutes);
router.use("/places", PlacesRoutes);
router.use("/bookings", BookingRoutes);

export default router;