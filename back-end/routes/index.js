import { Router } from "express";
import UserRoutes from "../domains/users/routes.js";
import PlacesRoutes from "../domains/places/routes.js";
import BookingRoutes from "../domains/bookings/routes.js";
import ReviewRoutes from "../domains/reviews/routes.js";

const router = Router();


router.use("/users", UserRoutes);
router.use("/places", PlacesRoutes);
router.use("/bookings", BookingRoutes);
router.use("/reviews", ReviewRoutes);

export default router;