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

// Middleware opcional de autenticação - não bloqueia se não tiver token
const optionalAuth = async (req, res, next) => {
  try {
    const userInfo = await JWTVerify(req);
    req.user = userInfo; // Adiciona o usuário ao request se autenticado
  } catch (error) {
    req.user = null; // Não há usuário autenticado
  }
  next();
};

// Middleware obrigatório de autenticação - bloqueia se não tiver token
const requireAuth = async (req, res, next) => {
  try {
    const userInfo = await JWTVerify(req);
    req.user = userInfo;
    next();
  } catch (error) {
    res.status(401).json({ error: "Autenticação necessária" });
  }
};

router.get("/", async (req, res) => {
  try {
    const userDoc = await User.find();
    res.json(userDoc);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Rota de perfil - requer autenticação
router.get("/profile", requireAuth, async (req, res) => {
  res.json(req.user);
});

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
      res.cookie("token", token).json(newUserObj);
    } 
    catch (error) {
      res.status(500).json("Erro ao assinar com o JWT", error);
    }
  } catch (error) {
    res.status(500).json(error);
    throw error;
  }
});

// Rota pública - qualquer um pode ver o perfil de outro usuário
router.get("/:id", async (req, res) => {
  connectDb();

  const { id: _id } = req.params;
  
  try {
    // Não retorna informações sensíveis como senha
    const userDoc = await User.findOne({_id}).select('-password');

    if (!userDoc) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(userDoc);
  } catch (error) {
    res.status(500).json("Deu erro ao encontrar o usuário.", error);
    throw error;
  }
});

// Rota pública minimalista
router.get("/minimal/:id", async (req, res) => {
  connectDb();

  const { id: _id } = req.params;
  
  try {
    const userDoc = await User.findOne({_id}).select('name photo');

    if (!userDoc) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(userDoc);
  } catch (error) {
    res.status(500).json("Deu erro ao encontrar o usuário.", error);
    throw error;
  }
});

// Upload de foto - requer autenticação
router.post("/upload", requireAuth, uploadImage().single("files"), async (req, res) => {
  connectDb();
  
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }

  const { filename, path, mimetype } = file;

  try {
    // 1. Upload para o S3
    const fileUrl = await sendToS3(filename, path, mimetype);
    
    // 2. Usar o ID do usuário do middleware
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }
    
    // 3. Salvar no banco de dados
    await User.findByIdAndUpdate(
      req.user._id,
      { photo: fileUrl },
      { new: true }
    );
    
    // 4. Retorna apenas a URL
    res.json(fileUrl);
    
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    res.status(500).json({ error: "Erro ao fazer upload da imagem" });
  }
});

// Atualizar perfil - requer autenticação e só pode atualizar o próprio perfil
router.put("/:id", requireAuth, async (req, res) => {
  const { id: _id } = req.params;

  // Verifica se o usuário está tentando atualizar o próprio perfil
  if (req.user._id !== _id) {
    return res.status(403).json({ error: "Você só pode editar seu próprio perfil" });
  }

  const { name, email, phone, city, pronouns, photo, bio } = req.body;

  try {
    const updateUserDoc = await User.findOneAndUpdate(
      {_id}, 
      { name, email, phone, city, pronouns, photo, bio },
      { new: true } // Retorna o documento atualizado
    ).select('-password');

    res.json(updateUserDoc);
  } catch (error) {
    res.status(500).json("Deu erro ao atualizar as informações...", error);
    throw error;
  }
});

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
});

// Deletar conta - requer autenticação e só pode deletar a própria conta
router.delete("/:id", requireAuth, async (req, res) => {
  connectDb();

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