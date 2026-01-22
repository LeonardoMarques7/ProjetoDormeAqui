import express from "express";
import Review from "./model.js";
import Place from "../places/model.js";

const router = express.Router();

// Create a new review
router.post("/", async (req, res) => {
    try {
        const { booking, place, user, rating, comment } = req.body;
        const review = new Review({ booking, place, user, rating, comment });
        await review.save();

        // Update place average rating
        const reviews = await Review.find({ place });
        const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await Place.findByIdAndUpdate(place, { averageRating });

        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get reviews for a place
router.get("/place/:placeId", async (req, res) => {
    try {
        const reviews = await Review.find({ place: req.params.placeId }).populate("user", "name photo");
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get reviews by user
router.get("/user/:userId", async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.params.userId }).populate("place", "title");
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
