import { Router } from "express";
import { connectDb } from "../../config/db.js";
import Place from "./model.js";
import { JWTVerify } from "../../ultis/jwt.js";
import { downloadImage } from "../../ultis/imageDownloader.js";
import { __dirname } from "../../ultis/dirname.js";
import { sendToS3, uploadImage } from "../controller.js";

const router = Router();

router.get("/", async (req, res) => {
  connectDb();
  const { city, checkin, checkout } = req.query;

  try {
    let query = {};

    // Filtra por cidade
    if (city) {
      query.city = { $regex: city, $options: "i" };
    }

    // Filtra por datas (disponibilidade)
    if (checkin && checkout) {
      query.$and = [
        { checkin: { $lte: new Date(checkin) } },    // checkin do lugar <= checkin selecionado
        { checkout: { $gte: new Date(checkout) } },  // checkout do lugar >= checkout selecionado
      ];
    }

    const placeDocs = await Place.find(query);
    res.json(placeDocs);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar acomodações", error });
  }
});


router.get("/owner", async (req, res) => {
    connectDb();
    try {
        const { _id } = await JWTVerify(req);

        try {
            const placeDocs = await Place.find({owner: _id});

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


router.get("/:id", async (req, res) => {
    connectDb();

    const { id: _id } = req.params;
    
    try {
        const placeDoc = await Place.findOne({_id});

        res.json(placeDoc);
    } catch (error) {
        res.status(500).json("Deu erro ao encontrar a acomodação.",error);
        throw error;
    }
    
    
});

router.put("/:id", async (req, res) => {
    connectDb();

    const { id: _id } = req.params;

    const { title, city, photos, description, extras, perks, price, checkin, checkout, guests } = req.body;

        try {
            const updatePlaceDoc = await Place.findOneAndUpdate({_id}, {
                title,
                city,
                photos,
                description,
                extras,
                perks,
                price,
                checkin,
                checkout,
                guests
            });

            res.json(updatePlaceDoc);

        } catch (error) {
            res.status(500).json("Deu erro ao atualizar a acomodação...",error);
            throw error;
        }
});

router.delete("/:id", async (req, res) => {
    connectDb();

    const { id: _id } = req.params;

    try {
        const deletedPlace = await Place.findOneAndDelete({ _id });

        if (!deletedPlace) {
            return res.status(404).json({ message: "Acomodação não encontrada." });
        }

        res.json({ message: "Acomodação deletada com sucesso!", deletedPlace });
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar a acomodação.", error });
        throw error;
    }
});

router.post("/", async (req, res) => {
    connectDb();

    const { title, city, photos, description, extras, perks, price, checkin, checkout, guests } = req.body;

        try {
            const { _id } = await JWTVerify(req);
            const newPlaceDoc = await Place.create({
                owner: _id,
                title,
                city,
                photos,
                description,
                extras,
                perks,
                price,
                checkin,
                checkout,
                guests
            });

            res.json(newPlaceDoc);

        } catch (error) {
            res.status(500).json("Deu erro ao criar novo lugar..",error);
            throw error;
        }
});

router.post("/upload/link", async (req, res) => {
    const { link } = req.body;
    const path =  `${__dirname}/tmp/`

    try {
        const {filename, fullPath, mimeType} = await downloadImage(link,  path);

        const fileUrl = await sendToS3(filename, fullPath, mimeType)

        res.json(fileUrl);
    } catch (error) {
        console.error(error);
        res.status(500).json("Erro ao baixar a imagem.");
    }
});

router.post("/upload", uploadImage().array("files", 10), async (req, res) => {
    const {files} = req;

    const filesPromisse = new Promise((resolve, reject) => {
        const fileURLArray = [];

        files.forEach(async (file, index) => {
            const { filename, path, mimetype } = file;
            try {
                const fileUrl = await sendToS3(filename, path, mimetype)

                fileURLArray.push(fileUrl);
            } catch (error) {
                console.error("Deu errado ao subir para o S3", error);
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