import "dotenv/config";
import jwt from "jsonwebtoken";

const { JWT_SECRET_KEY } = process.env;

// ⭐ Atualizado para aceitar o nome do cookie como parâmetro
export const JWTVerify = (req, cookieName = 'token') => {
    const token = req.cookies[cookieName]; // Usa o nome passado como parâmetro

    if (token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, JWT_SECRET_KEY, {}, (error, userInfo) => {
                if (error) {
                    console.error("Erro ao verificar JWT:", error);
                    reject(error);
                }
                resolve(userInfo);
            });
        });
    } else {
        return Promise.reject(new Error("Token não encontrado"));
    }
};

export const JWTSign = (newUserObj) => {
    return new Promise((resolve, reject) => {
        jwt.sign(newUserObj, JWT_SECRET_KEY, { expiresIn: '7d' }, (error, token) => {
            if (error) {
                console.error("Erro ao assinar JWT:", error);
                reject(error);
            }
            resolve(token);
        });
    });
};