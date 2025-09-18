import { Router } from "express";
import { connectDb } from "../../config/db.js";
import User from "./model.js";
import bcrypt from "bcrypt";

const bcryptSalt = bcrypt.genSaltSync();

const router = Router();

router.get("/", async (req, res) => {
    connectDb();

    try {
        const userDoc = await User.find();

        res.json(userDoc);
    } catch (error) {
        res.status(500).json(error);
    }
})


router.post("/users", async (req, res) => {
    connectDb();

    const { name, email, password } = req.body;

    const encryptPassword = bcrypt.hashSync(password, bcryptSalt);

    try {
        const newUserDoc = await User.create({
            name,
            email,
            password: encryptPassword,
        })

        res.json(newUserDoc);
    }catch (error) {
        res.status(500).json(error);
    }
})

router.post("/login", async (req, res) => {
    connectDb();

    const { email, password } = req.body;

    try {
        const userDoc = await User.findOne({email});
    
        if (userDoc) {
            const { name, _id } = userDoc;

            const passwordCorrect = bcrypt.compareSync(password, userDoc.password);
            passwordCorrect ? res.json({ name, email, _id }) : res.status(400).json("Senha inválida!");

        }
        else {
            res.status(400).json("Usuário não encontrado!");
        }
    
        
    }catch (error) {
        res.status(500).json(error);
    }

})

export default router;