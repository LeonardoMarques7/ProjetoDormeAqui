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

router.get("/", async (req, res) => {
  connectDb();

  try {
    const userDoc = await User.find();

    res.json(userDoc);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/profile", async (req, res) => {
  const userInfo = await JWTVerify(req);
  res.json(userInfo);
});

router.post("/", async (req, res) => {
  connectDb();

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
    res.cookie("token", token).json(newUserObj);
  } 
  catch (error) {
    res.status(500).json("Erro ao assinar com o JWT", error);
  }d
  


  } catch (error) {
    res.status(500).json(error);
    throw error;
  }
});

router.get("/:id", async (req, res) => {
    connectDb();

    const { id: _id } = req.params;
    
    try {
        const userDoc = await User.findOne({_id});

        res.json(userDoc);
    } catch (error) {
        res.status(500).json("Deu erro ao encontrar o usuário.",error);
        throw error;
    }
    
});

router.post("/upload", uploadImage().array("files", 1), async (req, res) => {
    const { files } = req; // Com .array() usa req.files (plural)

    // Verifica se há arquivo
    if (!files || files.length === 0) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    // Pega apenas o primeiro arquivo
    const file = files[0];
    const { filename, path, mimetype } = file;

    try {
        const fileUrl = await sendToS3(filename, path, mimetype);
        
        // Retorna apenas a URL do arquivo
        res.json([fileUrl]);
    } catch (error) {
        console.error("Erro ao subir para o S3:", error);
        res.status(500).json({ error: "Erro ao fazer upload da imagem" });
    }
});

router.put("/:id", async (req, res) => {
  connectDb();

  const { id: _id } = req.params;

  const {   name,
						email,
						phone,
						city,
						photo,
						bio } = req.body;

      try {
          const updateUserDoc = await User.findOneAndUpdate({_id}, {
            name,
						email,
						phone,
						city,
						photo,
						bio
          });

          res.json(updateUserDoc);

      } catch (error) {
          res.status(500).json("Deu erro ao atualizar as inforamações...",error);
          throw error;
      }
});


router.post("/login", async (req, res) => {
  connectDb();

  const { email, password } = req.body;

  try {
    const userDoc = await User.findOne({ email });

    if (userDoc) {
      const passwordCorrect = bcrypt.compareSync(password, userDoc.password);
      const { name, _id } = userDoc;
      
      if (passwordCorrect) {
        const newUserObj = { name, email, _id };

        try {
          const token = await JWTSign(newUserObj);

          res.cookie("token", token).json(newUserObj);
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

router.post("/logout", (req, res) => {
    res.clearCookie("token").json("Deslogado com sucesso!")
})

router.delete("/:id", async (req, res) => {
    connectDb();

    const { id: _id } = req.params;

    try {
        const deleteAccount = await User.findOneAndDelete({ _id });

        if (!deleteAccount) {
            return res.status(404).json({ message: "Usuário não encontrada." });
        }

        res.json({ message: "Usuário deletado com sucesso!", deleteAccount });
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar o usuário.", error });
        throw error;
    }
});

export default router;