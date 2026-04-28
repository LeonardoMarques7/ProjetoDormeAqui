import { Router } from "express";
import Place from "./model.js";
import User from "../users/model.js";
import { JWTVerify } from "../../ultis/jwt.js";
import { downloadImage } from "../../ultis/imageDownloader.js";
import { __dirname } from "../../ultis/dirname.js";
import { sendToSupabase, uploadImage } from "../controller.js";
import { requireAuth } from "../middleware.js";
import { escapeRegex, isSafeRemoteImageUrl } from "../../security.js";

const router = Router();

// Configuração do cookie baseada no ambiente (igual ao users/routes.js)
const isProduction = process.env.NODE_ENV === 'production';
const COOKIE_NAME = isProduction ? 'prod_auth_token' : 'dev_auth_token';


router.get("/", async (req, res) => {
    const { city, guests, rooms, minRating } = req.query;

    try {
        let query = { $or: [{ isActive: true }, { isActive: { $exists: false } }] };
        
        // Filtro por cidade
        if (city && city.trim() !== "") {
            query.city = { $regex: escapeRegex(String(city).slice(0, 80)), $options: "i" };
        }

        // Filtro por mínimo de hóspedes
        if (guests && parseInt(guests) > 0) {
            query.guests = { $gte: parseInt(guests) };
        }

        // Filtro por mínimo de quartos
        if (rooms && parseInt(rooms) > 0) {
            query.rooms = { $gte: parseInt(rooms) };
        }

        // Filtro por avaliação mínima
        if (minRating && parseFloat(minRating) > 0) {
            query.averageRating = { $gte: parseFloat(minRating) };
        }

        const placeDocs = await Place.find(query);
        res.json(placeDocs);
    } catch (error) {
        res.status(500).json({ message: "Deu erro ao buscar acomodações", error });
    }
});


router.get("/owner", async (req, res) => {
    try {
        const { _id } = await JWTVerify(req, COOKIE_NAME);

        try {
            const placeDocs = await Place.find({owner: _id, isActive: true});

            res.json(placeDocs);
        } catch (error) {
            res.status(500).json("Deu erro ao encontrar as acomodações.",error);
            throw error;
        }
    } catch (error) {
        res.status(500).json("Deu erro ao verificar o usuário.",error);
        throw error;
    }

});

router.get("/user/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const placeDocs = await Place.find({ owner: userId, $or: [{ isActive: true }, { isActive: { $exists: false } }] });

        res.json(placeDocs);
    } catch (error) {
        console.error("Erro ao buscar acomodações para o usuário:", userId, error);
        res.status(500).json({ message: "Erro ao buscar acomodações do usuário.", error });
    }
});

router.get("/owner/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const placeDocs = await Place.find({ owner: id, isActive: true });

        res.json(placeDocs);
    } catch (error) {
        console.error("Erro ao buscar acomodações para o dono:", id, error);
        res.status(500).json({ message: "Erro ao buscar acomodações do dono.", error });
    }
});


router.get("/:id", async (req, res) => {
    const { id: _id } = req.params;

    try {
        const placeDoc = await Place.findOne({_id, $or: [{ isActive: true }, { isActive: { $exists: false } }]}).populate('owner', '-password');

        res.json(placeDoc);
    } catch (error) {
        res.status(500).json("Deu erro ao encontrar a acomodação.",error);
        throw error;
    }


});

router.put("/:id", requireAuth, async (req, res) => {

    const { id: _id } = req.params;

    const { type, title, city, photos, description, extras, perks, price, checkin, checkout, guests, rooms, bathrooms, beds } = req.body;

        try {
            // Verify ownership - only owner can edit
            const placeDoc = await Place.findById(_id);
            
            if (!placeDoc) {
                return res.status(404).json({ error: "Acomodação não encontrada" });
            }

            // Check if current user is the owner
            if (placeDoc.owner.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: "Você não tem permissão para editar esta acomodação" });
            }

            const updatePlaceDoc = await Place.findOneAndUpdate({_id}, {
                type,
                title,
                city,
                photos,
                description,
                extras,
                perks,
                price,
                checkin,
                checkout,
                guests,
                rooms,
                bathrooms,
                beds,
            });

            res.json(updatePlaceDoc);

        } catch (error) {
            res.status(500).json("Deu erro ao atualizar a acomodação...",error);
            throw error;
        }
});

router.patch("/:id/status", requireAuth, async (req, res) => {
    const { id: _id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
        return res.status(400).json({ error: "O campo isActive deve ser booleano." });
    }

    try {
        const placeDoc = await Place.findById(_id);

        if (!placeDoc) {
            return res.status(404).json({ error: "Acomodação não encontrada" });
        }

        if (placeDoc.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Você não tem permissão para atualizar esta acomodação" });
        }

        const updatedPlace = await Place.findByIdAndUpdate(
            _id,
            { isActive },
            { new: true }
        );

        return res.json(updatedPlace);
    } catch (error) {
        console.error("Erro ao atualizar status da acomodação:", error);
        return res.status(500).json({ error: "Erro ao atualizar status da acomodação." });
    }
});

router.delete("/:id", requireAuth, async (req, res) => {
    const { id: _id } = req.params;

    try {
        const placeDoc = await Place.findById(_id);
        
        if (!placeDoc) {
            return res.status(404).json({ message: "Acomodação não encontrada." });
        }

        // Check if current user is the owner
        if (placeDoc.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Você não tem permissão para deletar esta acomodação" });
        }

        const deletedPlace = await Place.findOneAndUpdate({ _id }, { isActive: false }, { new: true });

        res.json({ message: "Acomodação deletada com sucesso!", deletedPlace });
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar a acomodação.", error });
        throw error;
    }
});

router.post("/", requireAuth, async (req, res) => {
    const { type, title, city, photos, description, extras, perks, price, checkin, checkout, guests, rooms, bathrooms, beds } = req.body;

        try {
            const { _id } = req.user;
            const newPlaceDoc = await Place.create({
                owner: _id,
                type,
                title,
                city,
                photos,
                description,
                extras,
                perks,
                price,
                checkin,
                checkout,
                guests,
                rooms,
                bathrooms,
                beds,
            });

            res.json(newPlaceDoc);

        } catch (error) {
            res.status(500).json("Deu erro ao criar novo lugar..",error);
            throw error;
        }
});

router.post("/upload/link", requireAuth, async (req, res) => {
    const { link } = req.body;
    const path =  `${__dirname}/tmp/`

    try {
        if (!isSafeRemoteImageUrl(link)) {
            return res.status(400).json({ error: "URL de imagem invalida." });
        }
        const {filename, fullPath, mimeType} = await downloadImage(link,  path);

        const fileUrl = await sendToSupabase(filename, fullPath, mimeType)

        res.json(fileUrl);
    } catch (error) {
        console.error(error);
        res.status(500).json("Erro ao baixar a imagem.");
    }
});

router.post("/upload", requireAuth, uploadImage().array("files", 10), async (req, res) => {
    const {files} = req;

    const filesPromisse = new Promise((resolve, reject) => {
        const fileURLArray = [];

        files.forEach(async (file, index) => {
            const { filename, path, mimetype } = file;
            try {
                const fileUrl = await sendToSupabase(filename, path, mimetype)

                fileURLArray.push(fileUrl);
            } catch (error) {
                console.error("Deu errado ao subir para o Supabase", error);
                reject(error);
            }
        })

        const idInterval = setInterval(() => {
        
            if (files.length === fileURLArray.length) {
                clearInterval(idInterval);
                resolve(fileURLArray);
            };
        }, 100)
        
    })

    const fileURLArrayResolve = await filesPromisse;

    res.json(fileURLArrayResolve);
})

export default router;
