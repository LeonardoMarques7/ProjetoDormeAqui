import mongoose from "mongoose";
import Place from "./domains/places/model.js";
import Review from "./domains/reviews/model.js";
import "dotenv/config";

const { MONGO_URL } = process.env;

async function updateAverageRatings() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Conectado ao MongoDB");

        // Get all places
        const places = await Place.find({});
        console.log(`Encontrados ${places.length} lugares`);

        for (const place of places) {
            // Get all reviews for this place
            const reviews = await Review.find({ place: place._id });

            if (reviews.length > 0) {
                // Calculate average rating
                const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                const averageRating = totalRating / reviews.length;

                // Update place with new average rating
                await Place.findByIdAndUpdate(place._id, { averageRating });
                console.log(`Atualizado lugar ${place._id}: média ${averageRating.toFixed(2)} (${reviews.length} avaliações)`);
            } else {
                // No reviews, set to 0
                await Place.findByIdAndUpdate(place._id, { averageRating: 0 });
                console.log(`Lugar ${place._id} sem avaliações, média definida como 0`);
            }
        }

        console.log("Atualização das médias de avaliação concluída!");
        process.exit();
    } catch (err) {
        console.error("Erro ao atualizar médias:", err);
        process.exit(1);
    }
}

updateAverageRatings();
