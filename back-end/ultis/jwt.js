import "dotenv/config";
import jwt from "jsonwebtoken";

const { JWT_SECRET_KEY } = process.env;

export const JWTVerify = (req) => {
    const { token } = req.cookies;

    if (token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, JWT_SECRET_KEY, {}, (error, userInfo) => {
            if (error) {
                console.error("Deu algum erro! Com o JWT!", error);
                reject(error);
            }
            resolve(userInfo);
        });
        })
    } else {
        return Promise.reject(new Error("No token provided"));
    }
}

export const JWTSign = (newUserObj) => {
    return new Promise((resolve, reject) => {

        jwt.sign(newUserObj, JWT_SECRET_KEY, {expiresIn: '7d'}, (error, token) => {
            if (error) {
                console.error("Deu algum erro! Ao assnar no JWT!", error);
                reject(error);
            }
            resolve(token);
        });
    })
}