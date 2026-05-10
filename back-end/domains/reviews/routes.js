import express from "express";
import {
  createReview,
  getPlaceReviews,
  getUserReviews,
} from "../../prisma/repositories/reviews.repository.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const review = await createReview(req.body);
    res.status(201).json(review);
  } catch (error) {
    console.error("Erro ao criar avaliacao:", error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.get("/place/:placeId", async (req, res) => {
  try {
    const reviews = await getPlaceReviews(req.params.placeId);
    res.json(reviews);
  } catch (error) {
    console.error("Erro ao buscar avaliacoes por acomodacao:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const reviews = await getUserReviews(req.params.userId);
    res.json(reviews);
  } catch (error) {
    console.error("Erro ao buscar avaliacoes por usuario:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
