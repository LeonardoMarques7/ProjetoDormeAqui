// ============================================
// ROUTES/USER.JS - Cookies Isolados por Ambiente
// ============================================
import "dotenv/config";
import { Router } from "express";
import User from "./model.js";
import Place from "../places/model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { JWTSign, JWTVerify } from "../../ultis/jwt.js";
import { sendToS3, uploadImage } from "../controller.js";
import { authenticateWithGoogle, authenticateWithGoogleCode, authenticateWithGoogleAccessToken, authenticateWithGithub } from "./authService.js";

const router = Router();
const bcryptSalt = bcrypt.genSaltSync();

// URLs padrão para foto e banner
const DEFAULT_PHOTO_URL = `https://${process.env.BUCKET}.s3.us-east-2.amazonaws.com/user__default.png`;
const DEFAULT_BANNER_URL = `https://${process.env.BUCKET}.s3.us-east-2.amazonaws.com/banner__default2.jpg`;

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
  try {
    const userDoc = await User.findById(req.user._id).select('-password');
    if (!userDoc) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    res.json(userDoc);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar perfil" });
  }
});

// REGISTRO
router.post("/", async (req, res) => {
  const { name, email, password, photo } = req.body;

  try {
    const encryptedPassword = bcrypt.hashSync(password, bcryptSalt);

    const newUserDoc = await User.create({
      name,
      email,
      photo: photo || DEFAULT_PHOTO_URL,
      banner: DEFAULT_BANNER_URL,
      password: encryptedPassword,
      authMethod: 'local'
    });

    const { _id } = newUserDoc;
    const newUserObj = { name, email, photo: photo || DEFAULT_PHOTO_URL, banner: DEFAULT_BANNER_URL, _id };
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

// UPLOAD DE BANNER
router.post("/upload-banner", requireAuth, uploadImage().single("files"), async (req, res) => {
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
      { banner: fileUrl },
      { new: true }
    );

    res.json(fileUrl);

  } catch (error) {
    console.error("Erro ao fazer upload do banner:", error);
    res.status(500).json({ error: "Erro ao fazer upload do banner" });
  }
});

// ATUALIZAR PERFIL
router.put("/:id", requireAuth, async (req, res) => {
  const { id: _id } = req.params;

  if (req.user._id !== _id) {
    return res.status(403).json({ error: "Você só pode editar seu próprio perfil" });
  }

  const { name, email, phone, city, pronouns, photo, banner, bio, occupation } = req.body;

  try {
    // Construir objeto de atualização apenas com campos fornecidos
    const updateFields = {};

    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (phone !== undefined) updateFields.phone = phone;
    if (city !== undefined) updateFields.city = city;
    if (pronouns !== undefined) updateFields.pronouns = pronouns;
    if (photo !== undefined) updateFields.photo = photo || DEFAULT_PHOTO_URL;
    if (banner !== undefined) updateFields.banner = banner || DEFAULT_BANNER_URL;
    if (bio !== undefined) updateFields.bio = bio;
    if (occupation !== undefined) updateFields.occupation = occupation;

    const updateUserDoc = await User.findOneAndUpdate(
      {_id},
      updateFields,
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

// ============================================
// ⭐ ROTAS OAUTH2 ⭐
// ============================================

// LOGIN/REGISTRO COM GOOGLE
router.post("/oauth/google", async (req, res) => {
  try {
    const { tokenId, accessToken, code } = req.body;

    let result;
    
    // Suportar os 3 métodos: code (authorization_code flow), accessToken (implicit flow), tokenId (legacy)
    if (code) {
      result = await authenticateWithGoogleCode(code);
    } else if (accessToken) {
      result = await authenticateWithGoogleAccessToken(accessToken);
    } else if (tokenId) {
      result = await authenticateWithGoogle(tokenId);
    } else {
      return res.status(400).json({ error: "Token do Google não fornecido" });
    }

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    const { user, token } = result;

    res
      .cookie(COOKIE_NAME, token, COOKIE_OPTIONS)
      .json({ ...user, token }); // Retornar token junto com usuário

  } catch (error) {
    console.error("❌ Erro em /oauth/google:", error);
    res.status(500).json({ error: "Erro ao autenticar com Google" });
  }
});

// LOGIN/REGISTRO COM GITHUB
router.post("/oauth/github", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Código do GitHub não fornecido" });
    }

    const result = await authenticateWithGithub(code);

    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }

    const { user, token } = result;

    res
      .cookie(COOKIE_NAME, token, COOKIE_OPTIONS)
      .json({ ...user, token }); // Retornar token junto com usuário

  } catch (error) {
    console.error("❌ Erro em /oauth/github:", error);
    res.status(500).json({ error: "Erro ao autenticar com GitHub" });
  }
});

// ============================================

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const userDoc = await User.findOne({ email });

    if (!userDoc) {
      return res.status(400).json({ error: "Email não encontrado!" });
    }

    // Gera token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hora

    // Salva token no banco
    await User.findByIdAndUpdate(userDoc._id, {
      resetToken,
      resetTokenExpiry
    });

    // Configura transporte de email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Verifica se as credenciais SMTP estão configuradas
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('⚠️ Credenciais SMTP não configuradas. Email não será enviado.');
      return res.json({ message: "Solicitação de recuperação processada. Configure SMTP para enviar emails." });
    }

    // URL de reset (ajuste conforme necessário)
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    // Envia email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Recuperação de Senha - DormeAqui',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Recuperação de Senha</h2>
          <p>Olá ${userDoc.name},</p>
          <p>Recebemos uma solicitação para redefinir sua senha.</p>
          <p>Clique no link abaixo para criar uma nova senha:</p>
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Redefinir Senha</a>
          <p>Este link expira em 1 hora.</p>
          <p>Se você não solicitou esta alteração, ignore este email.</p>
          <p>Atenciosamente,<br>Equipe DormeAqui</p>
        </div>
      `
    });

    res.json({ message: "Email de recuperação enviado com sucesso!" });

  } catch (error) {
    console.error("Erro no forgot password:", error);
    res.status(500).json({ error: "Erro ao enviar email de recuperação" });
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const userDoc = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!userDoc) {
      return res.status(400).json({ error: "Token inválido ou expirado!" });
    }

    // Valida nova senha
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres!" });
    }

    // Hash da nova senha
    const encryptedPassword = bcrypt.hashSync(newPassword, bcryptSalt);

    // Atualiza senha e limpa tokens
    await User.findByIdAndUpdate(userDoc._id, {
      password: encryptedPassword,
      resetToken: undefined,
      resetTokenExpiry: undefined
    });

    res.json({ message: "Senha redefinida com sucesso!" });

  } catch (error) {
    console.error("Erro no reset password:", error);
    res.status(500).json({ error: "Erro ao redefinir senha" });
  }
});

// ⭐ LOGOUT - Limpa AMBOS os cookies para garantir
// ⭐ LOGOUT - Versão mais robusta
router.post("/logout", (req, res) => {
  try {
    // Validação adicional
    if (!COOKIE_NAME) {
      console.error('❌ COOKIE_NAME está indefinido');
      return res.status(500).json({ error: "Erro de configuração do servidor" });
    }

    console.log('🔄 Tentando limpar cookie:', COOKIE_NAME);
    
    // Limpa o cookie do ambiente atual
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
      
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

    console.log('✅ Cookies limpos com sucesso');
    res.json({ message: "Deslogado com sucesso!" });
    
  } catch (error) {
    console.error('❌ Erro no logout:', error);
    res.status(500).json({ error: "Erro ao fazer logout" });
  }
});
// DELETAR CONTA (AGORA DESATIVA CONTA)
router.delete("/:id", requireAuth, async (req, res) => {
  const { id: _id } = req.params;

  if (req.user._id !== _id) {
    return res.status(403).json({ error: "Você só pode deletar sua própria conta" });
  }

  try {
    // Primeiro, deletar todos os places do usuário
    await Place.deleteMany({ owner: _id });

    // Depois, desativar a conta do usuário (não deletar)
    const deactivatedUser = await User.findByIdAndUpdate(
      _id,
      { deactivated: true },
      { new: true }
    );

    if (!deactivatedUser) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Limpa todos os cookies
    res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
    res.clearCookie('prod_auth_token', { httpOnly: true, secure: true, sameSite: 'none', path: '/' });
    res.clearCookie('dev_auth_token', { httpOnly: true, secure: false, sameSite: 'lax', path: '/' });

    res.json({ message: "Conta desativada com sucesso! Suas reservas e avaliações foram preservadas.", deactivatedUser });

  } catch (error) {
    console.error("Erro ao desativar usuário:", error);
    res.status(500).json({ error: "Erro ao desativar usuário" });
  }
});

export default router;
