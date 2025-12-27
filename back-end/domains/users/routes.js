import "dotenv/config";
import { Router } from "express";
import { connectDb } from "../../config/db.js";
import User from "./model.js";
import { __dirname } from "../../ultis/dirname.js";
import bcrypt from "bcrypt"
import { JWTSign, JWTVerify } from "../../ultis/jwt.js";
import { downloadImage } from "../../ultis/imageDownloader.js";
import { sendToS3, uploadImage } from "../controller.js";

const router = Router();
const bcryptSalt = bcrypt.genSaltSync();

connectDb();

// 🔥 ADICIONE ESTA FUNÇÃO HELPER NO TOPO
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
  path: '/'
};

// ... seus middlewares permanecem iguais ...

// 1️⃣ ATUALIZE A ROTA DE REGISTRO
router.post("/", async (req, res) => {
  const { name, email, password } = req.body;
  const encryptedPassword = bcrypt.hashSync(password, bcryptSalt);

  try {
    const newUserDoc = await User.create({
      name,
      email,
      password: encryptedPassword,
    });

    const { _id } = newUserDoc;
    const newUserObj = { name, email, _id };

    try {
      const token = await JWTSign(newUserObj);
      // 🔥 MUDANÇA AQUI:
      res.cookie("token", token, cookieOptions).json(newUserObj);
    } 
    catch (error) {
      res.status(500).json("Erro ao assinar com o JWT", error);
    }
  } catch (error) {
    res.status(500).json(error);
    throw error;
  }
});

// 2️⃣ ATUALIZE A ROTA DE LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userDoc = await User.findOne({ email });

    if (userDoc) {
      const passwordCorrect = bcrypt.compareSync(password, userDoc.password);
      const { name, photo, _id } = userDoc;
      
      if (passwordCorrect) {
        const newUserObj = { name, email, photo, _id };

        try {
          const token = await JWTSign(newUserObj);
          // 🔥 MUDANÇA AQUI:
          res.cookie("token", token, cookieOptions).json(newUserObj);
        }
        catch (error) {
          res.status(500).json("Erro ao assinar com o JWT", error);
        }
      } else {
        res.status(400).json("Senha inválida!");
      }
    } else {
      res.status(400).json("Usuário não encontrado!");
    }
  } catch (error) {
    res.status(500).json(error);
    throw error;
  }
});

// 3️⃣ ATUALIZE A ROTA DE LOGOUT
router.post("/logout", (req, res) => {
  // 🔥 MUDANÇA AQUI:
  res.clearCookie("token", cookieOptions).json("Deslogado com sucesso!")
});

// Deletar conta - requer autenticação e só pode deletar a própria conta
router.delete("/:id", requireAuth, async (req, res) => {

  const { id: _id } = req.params;

  // Verifica se o usuário está tentando deletar a própria conta
  if (req.user._id !== _id) {
    return res.status(403).json({ error: "Você só pode deletar sua própria conta" });
  }

  try {
    const deleteAccount = await User.findOneAndDelete({ _id });

    if (!deleteAccount) {
      return res.status(404).json({ message: "Usuário não encontrada." });
    }

    res.clearCookie("token").json({ message: "Usuário deletado com sucesso!", deleteAccount });
  } catch (error) {
    res.status(500).json({ message: "Erro ao deletar o usuário.", error });
    throw error;
  }
});



export default router;