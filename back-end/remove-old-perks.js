import { connectDb } from "./config/db.js";
import Place from "./domains/places/model.js";

// Perks to remove from all places
const PERKS_TO_REMOVE = [
    "varanda",
    "radio",
    "entrada privada",
    "micro-ondas",
    "geladeira",
    "pets",
    "toalhas",
    "roupas_cama"
];

async function removeOldPerks() {
    try {
        await connectDb();
        console.log("Conectado ao MongoDB");

        // Get all places
        const places = await Place.find({});
        console.log(`Encontrados ${places.length} lugares`);

        let totalUpdated = 0;

        for (const place of places) {
            const originalPerks = place.perks || [];
            const filteredPerks = originalPerks.filter(perk => !PERKS_TO_REMOVE.includes(perk));

            if (filteredPerks.length !== originalPerks.length) {
                // Perks were removed, update the place
                await Place.findByIdAndUpdate(place._id, { perks: filteredPerks });
                console.log(`Atualizado lugar ${place._id}: removidos ${originalPerks.length - filteredPerks.length} perks antigos`);
                totalUpdated++;
            }
        }

        console.log(`Remoção de perks antigos concluída! ${totalUpdated} lugares atualizados.`);
        process.exit();
    } catch (err) {
        console.error("Erro ao remover perks antigos:", err);
        process.exit(1);
    }
}

removeOldPerks();
