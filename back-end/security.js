import crypto from "crypto";
import net from "net";
import { URL } from "url";

export const isProduction = process.env.NODE_ENV === "production";
export const AUTH_COOKIE_NAME = isProduction ? "prod_auth_token" : "dev_auth_token";
export const CSRF_COOKIE_NAME = isProduction ? "prod_csrf_token" : "dev_csrf_token";

export const AUTH_COOKIE_OPTIONS = isProduction ? {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
} : {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const CSRF_COOKIE_OPTIONS = {
  ...AUTH_COOKIE_OPTIONS,
  httpOnly: false,
};

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const csrfExemptPaths = [
  /^\/api\/webhooks?\//,
  /^\/api\/users\/login$/,
  /^\/api\/users$/,
  /^\/api\/users\/oauth\//,
  /^\/api\/users\/forgot-password$/,
  /^\/api\/users\/reset-password$/,
];

export const createCsrfToken = () => crypto.randomBytes(32).toString("hex");

export const setAuthCookies = (res, token) => {
  const csrfToken = createCsrfToken();
  res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
  res.cookie(CSRF_COOKIE_NAME, csrfToken, CSRF_COOKIE_OPTIONS);
  return csrfToken;
};

export const clearAuthCookies = (res) => {
  res.clearCookie(AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS);
  res.clearCookie(CSRF_COOKIE_NAME, CSRF_COOKIE_OPTIONS);
  res.clearCookie("prod_auth_token", { ...AUTH_COOKIE_OPTIONS, secure: true, sameSite: "none" });
  res.clearCookie("dev_auth_token", { ...AUTH_COOKIE_OPTIONS, secure: false, sameSite: "lax" });
  res.clearCookie("prod_csrf_token", { ...CSRF_COOKIE_OPTIONS, secure: true, sameSite: "none" });
  res.clearCookie("dev_csrf_token", { ...CSRF_COOKIE_OPTIONS, secure: false, sameSite: "lax" });
};

export const csrfProtection = (req, res, next) => {
  if (!unsafeMethods.has(req.method)) return next();
  if (csrfExemptPaths.some((pattern) => pattern.test(req.path))) return next();

  const hasAuthCookie = Boolean(req.cookies?.[AUTH_COOKIE_NAME] || req.cookies?.prod_auth_token || req.cookies?.dev_auth_token);
  if (!hasAuthCookie) return next();

  const csrfCookie = req.cookies?.[CSRF_COOKIE_NAME] || req.cookies?.prod_csrf_token || req.cookies?.dev_csrf_token;
  const csrfHeader = req.get("x-csrf-token");

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ error: "CSRF token invalido ou ausente" });
  }

  next();
};

export const basicSecurityHeaders = (req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  next();
};

export const createRateLimiter = ({ windowMs = 60_000, max = 120 } = {}) => {
  const hits = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const entry = hits.get(key) || { count: 0, resetAt: now + windowMs };

    if (entry.resetAt <= now) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }

    entry.count += 1;
    hits.set(key, entry);

    if (entry.count > max) {
      res.setHeader("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ error: "Muitas requisicoes. Tente novamente em instantes." });
    }

    next();
  };
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Permissao insuficiente" });
  }
  next();
};

export const sanitizePublicUser = (user) => {
  if (!user) return user;
  const source = typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete source.password;
  delete source.resetToken;
  delete source.resetTokenExpiry;
  delete source.__v;
  return source;
};

export const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const privateCidrs = [
  /^10\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^192\.168\./,
  /^0\./,
];

export const isSafeRemoteImageUrl = (rawUrl) => {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (!["http:", "https:"].includes(parsed.protocol)) return false;
  const hostname = parsed.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost")) return false;

  const ipVersion = net.isIP(hostname);
  if (ipVersion === 4 && privateCidrs.some((pattern) => pattern.test(hostname))) return false;
  if (ipVersion === 6 && (hostname === "::1" || hostname.startsWith("fc") || hostname.startsWith("fd"))) return false;

  return true;
};

