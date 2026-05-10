import "dotenv/config";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { JWTSign } from "../../ultis/jwt.js";
import { upsertOAuthUser, userTokenShape } from "../../prisma/repositories/users.repository.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getGithubCredentials = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return isProduction
    ? {
        clientId: process.env.GITHUB_CLIENT_ID_PROD,
        clientSecret: process.env.GITHUB_CLIENT_SECRET_PROD,
        environment: "PRODUCAO",
      }
    : {
        clientId: process.env.GITHUB_CLIENT_ID_DEV,
        clientSecret: process.env.GITHUB_CLIENT_SECRET_DEV,
        environment: "DESENVOLVIMENTO",
      };
};

async function issueOAuthSession({ provider, providerAccountId, email, name, photo }) {
  const user = await upsertOAuthUser({ provider, providerAccountId, email, name, photo });
  const userObj = userTokenShape(user);
  const token = await JWTSign(userObj);
  return { success: true, user: userObj, token };
}

export const authenticateWithGoogle = async (tokenId) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub, email, name, picture } = ticket.getPayload();
    return issueOAuthSession({
      provider: "google",
      providerAccountId: sub,
      email,
      name,
      photo: picture,
    });
  } catch (error) {
    console.error("Erro ao autenticar com Google:", error?.response?.data || error.message);
    return { success: false, error: `Falha ao autenticar com Google: ${error.message}` };
  }
};

export const authenticateWithGoogleCode = async (code) => {
  try {
    if (!code) throw new Error("Codigo do Google nao fornecido");

    const isProduction = process.env.NODE_ENV === "production";
    const frontendUrl = isProduction
      ? process.env.PROD_DOMAIN
        ? `https://${process.env.PROD_DOMAIN}`
        : process.env.FRONTEND_URL
      : process.env.FRONTEND_URL;
    const redirectUri = `${(frontendUrl || "").replace(/\/$/, "")}/auth/google/callback`;
    const params = new URLSearchParams();
    params.append("client_id", process.env.GOOGLE_CLIENT_ID);
    params.append("client_secret", process.env.GOOGLE_CLIENT_SECRET);
    params.append("code", code);
    params.append("grant_type", "authorization_code");
    params.append("redirect_uri", redirectUri);

    const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const { access_token } = tokenResponse.data || {};
    if (!access_token) throw new Error("Google nao retornou access_token");

    const userResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const { id: googleId, email, name, picture } = userResponse.data;

    return issueOAuthSession({
      provider: "google",
      providerAccountId: googleId,
      email,
      name,
      photo: picture,
    });
  } catch (error) {
    console.error("Erro ao autenticar com Google Code:", error?.response?.data || error.message);
    return { success: false, error: `Falha ao autenticar com Google: ${error.message}` };
  }
};

export const authenticateWithGoogleAccessToken = async (accessToken) => {
  try {
    const response = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { id: googleId, email, name, picture } = response.data;
    return issueOAuthSession({
      provider: "google",
      providerAccountId: googleId,
      email,
      name,
      photo: picture,
    });
  } catch (error) {
    console.error("Erro ao autenticar com Google Access Token:", error?.response?.data || error.message);
    return { success: false, error: `Falha ao autenticar com Google: ${error.message}` };
  }
};

export const authenticateWithGithub = async (code) => {
  try {
    if (!code) throw new Error("Codigo do GitHub nao fornecido");
    const { clientId, clientSecret, environment } = getGithubCredentials();
    console.log("Autenticando com GitHub:", { clientId: Boolean(clientId), environment });

    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      { client_id: clientId, client_secret: clientSecret, code },
      { headers: { Accept: "application/json" } },
    );
    const { access_token, error } = tokenResponse.data;
    if (error || !access_token) throw new Error(error || "GitHub nao retornou access_token");

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/vnd.github+json",
      },
    });

    const { id: githubId, login, name, email: githubEmail, avatar_url: avatarUrl } = userResponse.data;
    const email = githubEmail || `${login}@github.local`;
    return issueOAuthSession({
      provider: "github",
      providerAccountId: githubId,
      email,
      name: name || login,
      photo: avatarUrl,
    });
  } catch (error) {
    console.error("Erro ao autenticar com GitHub:", error.message);
    return { success: false, error: `Falha ao autenticar com GitHub: ${error.message}` };
  }
};
