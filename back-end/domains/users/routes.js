// ============================================
// ROUTES/USER.JS - Cookies Isolados por Ambiente
// ============================================
import "dotenv/config";
import { Router } from "express";
import User from "./model.js";
import bcrypt from "bcrypt";
import { JWTSign, JWTVerify } from "../../ultis/jwt.js";
import { sendToS3, uploadImage } from "../controller.js";

const router = Router();
const bcryptSalt = bcrypt.genSaltSync();

// ⭐ CONFIGURAÇÃO SEPARADA POR AMBIENTE
const isProduction = process.env.NODE_ENV === 'production';

// Nomes de cookies COMPLETAMENTE diferentes
const COOKIE_NAME = isProduction ? 'prod_auth_token' : 'dev_auth_token';

console.log('🔧 Ambiente detectado:', isProduction ? 'PRODUÇÃO' : 'DESENVOLVIMENTO');
console.log('📌 NODE_ENV:', process.env.NODE_ENV);

// Configurações específicas por ambiente
const COOKIE_OPTIONS = isProduction ? {
  httpOnly: true,
  secure: true,        // HTTPS obrigatório
  sameSite: 'none',    // Cross-site para produção
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  domain: process.env.PROD_DOMAIN || undefined, // Ex: '.seusite.com'
} : {
  httpOnly: true,
  secure: false,       // Permite HTTP local
  sameSite: 'lax',     // Mais permissivo para dev
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  // SEM domain - fica restrito ao localhost
};

console.log('🍪 Nome do cookie:', COOKIE_NAME);
console.log('⚙️ Opções do cookie:', COOKIE_OPTIONS);

// ⭐ Middleware opcional de autenticação
const optionalAuth = async (req, res, next) => {
  try {
    const userInfo = await JWTVerify(req, COOKIE_NAME);
    req.user = userInfo;
  } catch (error) {
    req.user = null;
  }
  next();
};

// ⭐ Middleware obrigatório de autenticação
const requireAuth = async (req, res, next) => {
  try {
    const userInfo = await JWTVerify(req, COOKIE_NAME);
    req.user = userInfo;
    next();
  } catch (error) {
    res.status(401).json({ error: "Autenticação necessária" });
  }
};

// ============================================
// ROTAS
// ============================================

router.get("/", async (req, res) => {
  try {
    const userDoc = await User.find();
    res.json(userDoc);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuários" });
  }
});

router.get("/profile", requireAuth, async (req, res) => {
  res.json(req.user);
});

// REGISTRO
router.post("/", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const encryptedPassword = bcrypt.hashSync(password, bcryptSalt);
    
    const newUserDoc = await User.create({
      name,
      email,
      password: encryptedPassword,
    });

    const { _id } = newUserDoc;
    const newUserObj = { name, email, _id };
    const token = await JWTSign(newUserObj);

    res
      .cookie(COOKIE_NAME, token, COOKIE_OPTIONS)
      .json(newUserObj);
      
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

// PERFIL PÚBLICO
router.get("/:id", async (req, res) => {
  const { id: _id } = req.params;
  
  try {
    const userDoc = await User.findOne({_id}).select('-password');

    if (!userDoc) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(userDoc);
  } catch (error) {
    res.status(500).json({ error: "Erro ao encontrar usuário" });
  }
});

// PERFIL MINIMALISTA
router.get("/minimal/:id", async (req, res) => {
  const { id: _id } = req.params;
  
  try {
    const userDoc = await User.findOne({_id}).select('name photo');

    if (!userDoc) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(userDoc);
  } catch (error) {
    res.status(500).json({ error: "Erro ao encontrar usuário" });
  }
});

// UPLOAD DE FOTO
router.post("/upload", requireAuth, uploadImage().single("files"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }

  const { filename, path, mimetype } = file;

  try {
    const fileUrl = await sendToS3(filename, path, mimetype);
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "Usuário não autenticado" });
    }
    
    await User.findByIdAndUpdate(
      req.user._id,
      { photo: fileUrl },
      { new: true }
    );
    
    res.json(fileUrl);
    
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    res.status(500).json({ error: "Erro ao fazer upload da imagem" });
  }
});

// ATUALIZAR PERFIL
router.put("/:id", requireAuth, async (req, res) => {
  const { id: _id } = req.params;

  if (req.user._id !== _id) {
    return res.status(403).json({ error: "Você só pode editar seu próprio perfil" });
  }

  const { name, email, phone, city, pronouns, photo, bio } = req.body;

  try {
    const updateUserDoc = await User.findOneAndUpdate(
      {_id}, 
      { name, email, phone, city, pronouns, photo, bio },
      { new: true }
    ).select('-password');

    res.json(updateUserDoc);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    res.status(500).json({ error: "Erro ao atualizar informações" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userDoc = await User.findOne({ email });

    if (!userDoc) {
      return res.status(400).json({ error: "Usuário não encontrado!" });
    }

    const passwordCorrect = bcrypt.compareSync(password, userDoc.password);
    
    if (!passwordCorrect) {
      return res.status(400).json({ error: "Senha inválida!" });
    }

    const { name, photo, _id } = userDoc;
    const newUserObj = { name, email, photo, _id };
    const token = await JWTSign(newUserObj);

    res
      .cookie(COOKIE_NAME, token, COOKIE_OPTIONS)
      .json(newUserObj);
  
      
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ⭐ LOGOUT - Limpa AMBOS os cookies para garantir
router.post("/logout", (req, res) => {
  // Limpa o cookie do ambiente atual
  res.clearCookie(COOKIE_OPTIONS);
  
  // Segurança extra: limpa ambos os cookies
  res.clearCookie('prod_auth_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  });
  
  res.clearCookie('dev_auth_token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/',
  });

  res.json({ message: "Deslogado com sucesso!" });
});

// DELETAR CONTA
router.delete("/:id", requireAuth, async (req, res) => {
  const { id: _id } = req.params;

  if (req.user._id !== _id) {
    return res.status(403).json({ error: "Você só pode deletar sua própria conta" });
  }

  try {
    const deleteAccount = await User.findOneAndDelete({ _id });

    if (!deleteAccount) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Limpa todos os cookies
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
    res.clearCookie('prod_auth_token', { httpOnly: true, secure: true, sameSite: 'none', path: '/' });
    res.clearCookie('dev_auth_token', { httpOnly: true, secure: false, sameSite: 'lax', path: '/' });
    
    res.json({ message: "Usuário deletado com sucesso!", deleteAccount });
      
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    res.status(500).json({ error: "Erro ao deletar usuário" });
  }
});

export default router;