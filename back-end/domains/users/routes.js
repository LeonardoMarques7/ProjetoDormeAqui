import "dotenv/config";
import { Router } from "express";
import nodemailer from "nodemailer";
import { JWTSign, JWTVerify } from "../../ultis/jwt.js";
import { sendToSupabase, uploadImage } from "../controller.js";
import {
  authenticateWithGithub,
  authenticateWithGoogle,
  authenticateWithGoogleAccessToken,
  authenticateWithGoogleCode,
} from "./authService.js";
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  clearAuthCookies,
  createRateLimiter,
  sanitizePublicUser,
  setAuthCookies,
} from "../../security.js";
import {
  createLocalUser,
  deactivateUser,
  findUserByEmail,
  getPublicUserById,
  listUsers,
  publicUserShape,
  resetPassword,
  setPasswordResetToken,
  updateUserBanner,
  updateUserPhoto,
  updateUserProfile,
  userTokenShape,
  verifyLocalCredentials,
} from "../../prisma/repositories/users.repository.js";

const router = Router();
const authRateLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 40 });

const DEFAULT_PHOTO_URL = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/user__default.png`;
const DEFAULT_BANNER_URL = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/banner__default2.jpg`;
const COOKIE_NAME = AUTH_COOKIE_NAME;
const COOKIE_OPTIONS = AUTH_COOKIE_OPTIONS;

console.log("Cookie de autenticacao:", COOKIE_NAME, COOKIE_OPTIONS);

const requireAuth = async (req, res, next) => {
  try {
    req.user = await JWTVerify(req, COOKIE_NAME);
    next();
  } catch {
    res.status(401).json({ error: "Autenticacao necessaria" });
  }
};

router.get("/", requireAuth, async (req, res) => {
  try {
    if (!["admin", "moderator"].includes(req.user.role)) {
      return res.status(403).json({ error: "Permissao insuficiente" });
    }
    res.json(await listUsers());
  } catch (error) {
    console.error("Erro ao buscar usuarios:", error);
    res.status(500).json({ error: "Erro ao buscar usuarios" });
  }
});

router.get("/profile", requireAuth, async (req, res) => {
  try {
    const userDoc = await getPublicUserById(req.user._id);
    if (!userDoc) return res.status(404).json({ error: "Usuario nao encontrado" });
    res.json(userDoc);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ error: "Erro ao buscar perfil" });
  }
});

router.post("/", async (req, res) => {
  const { name, email, password, photo } = req.body;

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) return res.status(409).json({ error: "Este email ja esta cadastrado" });

    const newUserDoc = await createLocalUser({
      name,
      email,
      password,
      photo: photo || DEFAULT_PHOTO_URL,
      banner: DEFAULT_BANNER_URL,
    });
    const newUserObj = userTokenShape(newUserDoc);
    const token = await JWTSign(newUserObj);

    setAuthCookies(res, token);
    res.json(newUserObj);
  } catch (error) {
    console.error("Erro ao criar usuario:", error);
    res.status(500).json({ error: "Erro ao criar usuario" });
  }
});

router.get("/minimal/:id", async (req, res) => {
  try {
    const userDoc = await getPublicUserById(req.params.id);
    if (!userDoc) return res.status(404).json({ error: "Usuario nao encontrado" });
    res.json({ _id: userDoc._id, id: userDoc.id, name: userDoc.name, photo: userDoc.photo });
  } catch (error) {
    console.error("Erro ao encontrar usuario minimal:", error);
    res.status(500).json({ error: "Erro ao encontrar usuario" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userDoc = await getPublicUserById(req.params.id);
    if (!userDoc) return res.status(404).json({ error: "Usuario nao encontrado" });
    res.json(userDoc);
  } catch (error) {
    console.error("Erro ao encontrar usuario:", error);
    res.status(500).json({ error: "Erro ao encontrar usuario" });
  }
});

router.post("/upload", requireAuth, uploadImage().single("files"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });

  try {
    const fileUrl = await sendToSupabase(req.file.filename, req.file.path, req.file.mimetype);
    await updateUserPhoto(req.user._id, fileUrl);
    res.json(fileUrl);
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    res.status(500).json({ error: "Erro ao fazer upload da imagem" });
  }
});

router.post("/upload-banner", requireAuth, uploadImage().single("files"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });

  try {
    const fileUrl = await sendToSupabase(req.file.filename, req.file.path, req.file.mimetype);
    await updateUserBanner(req.user._id, fileUrl);
    res.json(fileUrl);
  } catch (error) {
    console.error("Erro ao fazer upload do banner:", error);
    res.status(500).json({ error: "Erro ao fazer upload do banner" });
  }
});

router.put("/:id", requireAuth, async (req, res) => {
  if (req.user._id !== req.params.id && req.user.id !== req.params.id) {
    return res.status(403).json({ error: "Voce so pode editar seu proprio perfil" });
  }

  try {
    const updateUserDoc = await updateUserProfile(req.params.id, {
      ...req.body,
      ...(req.body.photo !== undefined ? { photo: req.body.photo || DEFAULT_PHOTO_URL } : {}),
      ...(req.body.banner !== undefined ? { banner: req.body.banner || DEFAULT_BANNER_URL } : {}),
    });
    res.json(publicUserShape(updateUserDoc));
  } catch (error) {
    console.error("Erro ao atualizar usuario:", error);
    res.status(500).json({ error: "Erro ao atualizar informacoes" });
  }
});

router.post("/login", authRateLimit, async (req, res) => {
  const { email, password } = req.body;

  try {
    const userDoc = await verifyLocalCredentials(email, password);
    if (!userDoc) return res.status(400).json({ error: "Email ou senha invalidos!" });

    const newUserObj = userTokenShape(userDoc);
    const token = await JWTSign(newUserObj);

    setAuthCookies(res, token);
    res.json(newUserObj);
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

router.post("/oauth/google", async (req, res) => {
  try {
    const { tokenId, accessToken, code } = req.body;
    let result;
    if (code) result = await authenticateWithGoogleCode(code);
    else if (accessToken) result = await authenticateWithGoogleAccessToken(accessToken);
    else if (tokenId) result = await authenticateWithGoogle(tokenId);
    else return res.status(400).json({ error: "Token do Google nao fornecido" });

    if (!result.success) return res.status(401).json({ error: result.error });
    setAuthCookies(res, result.token);
    res.json(result.user);
  } catch (error) {
    console.error("Erro em /oauth/google:", error.message);
    res.status(500).json({ error: `Erro ao autenticar com Google: ${error.message}` });
  }
});

router.post("/oauth/github", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: "Codigo do GitHub nao fornecido" });
    const result = await authenticateWithGithub(code);
    if (!result.success) return res.status(401).json({ error: result.error });
    setAuthCookies(res, result.token);
    res.json(result.user);
  } catch (error) {
    console.error("Erro em /oauth/github:", error.message);
    res.status(500).json({ error: `Erro ao autenticar com GitHub: ${error.message}` });
  }
});

router.post("/forgot-password", authRateLimit, async (req, res) => {
  const { email } = req.body;

  try {
    const reset = await setPasswordResetToken(email);
    if (!reset) {
      return res.json({ message: "Se o email existir, enviaremos instrucoes de recuperacao." });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("Credenciais SMTP nao configuradas. Email nao sera enviado.");
      return res.json({ message: "Solicitacao de recuperacao processada. Configure SMTP para enviar emails." });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${reset.resetToken}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Recuperacao de Senha - DormeAqui",
      html: `<p>Ola ${reset.user.name},</p><p>Clique no link para redefinir sua senha:</p><p><a href="${resetUrl}">Redefinir senha</a></p>`,
    });

    res.json({ message: "Email de recuperacao enviado com sucesso!" });
  } catch (error) {
    console.error("Erro no forgot password:", error);
    res.status(500).json({ error: "Erro ao enviar email de recuperacao" });
  }
});

router.post("/reset-password", authRateLimit, async (req, res) => {
  const { token, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres!" });
  }

  try {
    const userDoc = await resetPassword(token, newPassword);
    if (!userDoc) return res.status(400).json({ error: "Token invalido ou expirado!" });
    res.json({ message: "Senha redefinida com sucesso!" });
  } catch (error) {
    console.error("Erro no reset password:", error);
    res.status(500).json({ error: "Erro ao redefinir senha" });
  }
});

router.post("/logout", (req, res) => {
  try {
    clearAuthCookies(res);
    res.json({ message: "Deslogado com sucesso!" });
  } catch (error) {
    console.error("Erro no logout:", error);
    res.status(500).json({ error: "Erro ao fazer logout" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  if (req.user._id !== req.params.id && req.user.id !== req.params.id) {
    return res.status(403).json({ error: "Voce so pode deletar sua propria conta" });
  }

  try {
    const deactivatedUser = await deactivateUser(req.params.id);
    if (!deactivatedUser) return res.status(404).json({ error: "Usuario nao encontrado" });
    clearAuthCookies(res);
    res.json({
      message: "Conta desativada com sucesso! Suas reservas e avaliacoes foram preservadas.",
      deactivatedUser: sanitizePublicUser(publicUserShape(deactivatedUser)),
    });
  } catch (error) {
    console.error("Erro ao desativar usuario:", error);
    res.status(500).json({ error: "Erro ao desativar usuario" });
  }
});

export default router;
