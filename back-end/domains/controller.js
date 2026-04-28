import "dotenv/config";
import { uploadToSupabase } from "./supabaseStorageService.js";
import fs, { link } from "fs";
import multer from "multer";
import { __dirname } from "../ultis/dirname.js";
import path from "path";
import { getExtension } from "../ultis/imageDownloader.js";
import crypto from "crypto";

const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);

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
            const uniqueSuffix = crypto.randomBytes(12).toString("hex");
            const { extension } = getExtension(file.originalname);
            if (!allowedExtensions.has(String(extension || "").toLowerCase())) {
                return cb(new Error("Tipo de arquivo nao permitido"));
            }
            cb(null, `${Date.now()}-${uniqueSuffix}.${extension}`)
        }
    })

    // Retorna a instância do multer (não chame nenhum método aqui)
    return multer({
        storage,
        limits: { fileSize: 5 * 1024 * 1024, files: 10 },
        fileFilter: (req, file, cb) => {
            if (!allowedImageTypes.has(file.mimetype)) {
                return cb(new Error("Tipo de arquivo nao permitido"));
            }
            cb(null, true);
        }
    });
}
