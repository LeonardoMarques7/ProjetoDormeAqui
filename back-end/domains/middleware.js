import "dotenv/config";
import { JWTVerify } from "../ultis/jwt.js";

const isProduction = process.env.NODE_ENV === 'production';
const COOKIE_NAME = isProduction ? 'prod_auth_token' : 'dev_auth_token';

/**
 * ⭐ Middleware obrigatório de autenticação
 * Verifica se o usuário está autenticado via JWT
 * Se não estiver, retorna 401 Unauthorized
 * Se estiver, adiciona req.user com dados do usuário
 */
export const requireAuth = async (req, res, next) => {
  try {
    const userInfo = await JWTVerify(req, COOKIE_NAME);
    req.user = userInfo;
    next();
  } catch (error) {
    res.status(401).json({ error: "Autenticação necessária" });
  }
};

/**
 * ⭐ Middleware de autenticação opcional
 * Tenta verificar JWT, mas não impede acesso se não encontrar
 * Se autenticado, adiciona req.user com dados do usuário
 * Se não autenticado, deixa req.user como null
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const userInfo = await JWTVerify(req, COOKIE_NAME);
    req.user = userInfo;
  } catch (error) {
    req.user = null;
  }
  next();
};

/**
 * ⭐ Middleware para verificar propriedade de recurso
 * Usado depois de requireAuth
 * Verifica se req.user._id === resourceOwner
 * Se não, retorna 403 Forbidden
 * 
 * Uso: router.put("/:id", requireAuth, verifyOwnership("owner"), handler)
 */
export const verifyOwnership = (ownerField = "owner") => {
  return async (req, res, next) => {
    try {
      const resource = req.resource;
      if (!resource) {
        return res.status(400).json({ error: "Recurso não encontrado na requisição" });
      }

      const resourceOwnerId = resource[ownerField]?.toString();
      const userId = req.user._id.toString();

      if (resourceOwnerId !== userId) {
        return res.status(403).json({ error: "Você não tem permissão para modificar este recurso" });
      }

      next();
    } catch (error) {
      console.error("Erro ao verificar propriedade:", error);
      res.status(500).json({ error: "Erro ao verificar permissões" });
    }
  };
};

export { COOKIE_NAME };
