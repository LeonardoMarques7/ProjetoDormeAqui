import { connectDb } from "./config/db.js";
import Place from "./domains/places/model.js";

async function checkPerks() {
    try {
        await connectDb();
        console.log("Conectado ao MongoDB");

        // Get all places
        const places = await Place.find({});
        console.log(`Encontrados ${places.length} lugares`);

        // Old perks that should be removed
        const OLD_PERKS = [
            "varanda",
            "radio",
            "entrada privada",
            "micro-ondas",
            "geladeira",
            "pets",
            "toalhas",
            "roupas_cama"
        ];

        let placesWithOldPerks = 0;
        let totalOldPerksFound = 0;

        for (const place of places) {
            const perks = place.perks || [];
            const oldPerksInPlace = perks.filter(perk => OLD_PERKS.includes(perk));

            if (oldPerksInPlace.length > 0) {
                console.log(`Lugar ${place._id} (${place.title}): ainda tem perks antigos: ${oldPerksInPlace.join(', ')}`);
                placesWithOldPerks++;
                totalOldPerksFound += oldPerksInPlace.length;
            }
        }

        if (placesWithOldPerks === 0) {
            console.log("✅ Sucesso! Nenhum lugar possui perks antigos.");
        } else {
            console.log(`❌ Ainda há ${placesWithOldPerks} lugares com ${totalOldPerksFound} perks antigos.`);
        }

        process.exit();
    } catch (err) {
        console.error("Erro ao verificar perks:", err);
        process.exit(1);
    }
}

checkPerks();
