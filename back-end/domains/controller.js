import "dotenv/config";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs, { link } from "fs";
import multer from "multer";
import { __dirname } from "../server.js";
import path from "path";
import { getExtension } from "../ultis/imageDownloader.js";

const { S3_ACCESS_KEY, S3_SECRET_KEY, BUCKET } = process.env;

export const sendToS3 = async (filename, path, mimeType) => {
    const client = new S3Client({ region: "us-east-2", credentials: {
        accessKeyId: S3_ACCESS_KEY, 
        secretAccessKey: S3_SECRET_KEY,
    } });


    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: filename,
        Body: fs.readFileSync(path),
        ContentType: mimeType,
        ACL: "public-read"
    });

    try {
        await client.send(command);

        return `https://${BUCKET}.s3.us-east-2.amazonaws.com/${filename}`;
    } catch (error) {
        throw error;
    }
}

export const uploadImage = () => {
    
    const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, `${__dirname}/tmp`)
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Math.round(Math.random() * 1E9);
        const { extension } = getExtension(file.originalname);
        cb(null,`${Date.now()}-${uniqueSuffix}.${extension}`)
    }
    })

    return multer({ storage })
}