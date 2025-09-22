import { Router } from "express";
import { connectDb } from "../../config/db.js";
import Place from "./model.js";
import { JWTVerify } from "../../ultis/jwt.js";
import { downloadImage } from "../../ultis/imageDownloader.js";
import { __dirname } from "../../server.js";
import { sendToS3, uploadImage } from "../controller.js";

const router = Router();

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

// {
//   fieldname: 'files',
//   originalname: 'image3.jpg',
//   encoding: '7bit',
//   mimetype: 'image/jpeg',
//   destination: 'C:\\Users\\leona\\Desktop\\ProjetoDormeAqui\\back-end/tmp',
//   filename: '1758510226329.jpg',
//   path: 'C:\\Users\\leona\\Desktop\\ProjetoDormeAqui\\back-end\\tmp\\1758510226329.jpg',
//   size: 140384
// }


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