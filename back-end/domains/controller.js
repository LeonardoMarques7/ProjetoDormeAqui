import "dotenv/config";
import { uploadToSupabase } from "./supabaseStorageService.js";
import fs, { link } from "fs";
import multer from "multer";
import { __dirname } from "../ultis/dirname.js";
import path from "path";
import { getExtension } from "../ultis/imageDownloader.js";

export const sendToSupabase = async (filename, filePath, mimeType) => {
    try {
        const fileUrl = await uploadToSupabase(filename, filePath, mimeType);
        return fileUrl;
    } catch (error) {
        throw error;
    }
}

export const uploadImage = () => {

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadPath = `${__dirname}/tmp`;
            // Ensure the tmp directory exists
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath)
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Math.round(Math.random() * 1E9);
            const { extension } = getExtension(file.originalname);
            cb(null, `${Date.now()}-${uniqueSuffix}.${extension}`)
        }
    })

    // Retorna a instância do multer (não chame nenhum método aqui)
    return multer({ storage });
}
