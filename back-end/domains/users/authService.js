import "dotenv/config";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import User from "./model.js";
import bcrypt from "bcrypt";
import { JWTSign } from "../../ultis/jwt.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const DEFAULT_PHOTO_URL = `https://${process.env.BUCKET}.s3.us-east-2.amazonaws.com/user__default.png`;
const DEFAULT_BANNER_URL = `https://${process.env.BUCKET}.s3.us-east-2.amazonaws.com/banner__default2.jpg`;

// ========== GOOGLE OAUTH ==========
export const authenticateWithGoogle = async (tokenId) => {
  try {
    // Validar token com Google
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    // Verificar se usuário existe pelo Google ID
    let user = await User.findOne({ googleId: sub });

    if (!user) {
      // Verificar se email já existe (caso de vinculação)
      user = await User.findOne({ email });

      if (user) {
        // Usuário existe com outro método - vincular Google
        if (!user.googleId) {
          user.googleId = sub;
          user.authMethod = 'google'; // Atualiza método principal
          await user.save();
        }
      } else {
        // Criar novo usuário
        const bcryptSalt = bcrypt.genSaltSync();
        user = await User.create({
          name: name || email.split('@')[0],
          email,
          googleId: sub,
          photo: picture || DEFAULT_PHOTO_URL,
          banner: DEFAULT_BANNER_URL,
          authMethod: 'google',
          password: bcrypt.hashSync(Math.random().toString(), bcryptSalt) // Senha aleatória
        });
      }
    }

    // Criar JWT com dados do usuário
    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      authMethod: user.authMethod
    };

    const token = await JWTSign(userObj);

    return {
      success: true,
      user: userObj,
      token
    };
  } catch (error) {
    console.error('❌ Erro ao autenticar com Google:', error.message);
    return {
      success: false,
      error: `Falha ao autenticar com Google: ${error.message}`
    };
  }
};

// ========== GOOGLE OAUTH COM CODE (Authorization Code Flow) ==========
export const authenticateWithGoogleCode = async (code) => {
  try {
    if (!code) {
      throw new Error('Código do Google não fornecido');
    }

    // 1. Trocar código por access token com Google
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/google/callback`
      }
    );

    const { access_token, error } = tokenResponse.data;

    if (error || !access_token) {
      throw new Error('Falha ao obter token do Google');
    }

    // 2. Obter dados do usuário usando o access_token
    const userResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    );

    const { id: googleId, email, name, picture } = userResponse.data;

    // Verificar se usuário existe pelo Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Verificar se email já existe (caso de vinculação)
      user = await User.findOne({ email });

      if (user) {
        // Usuário existe com outro método - vincular Google
        if (!user.googleId) {
          user.googleId = googleId;
          user.authMethod = 'google';
          await user.save();
        }
      } else {
        // Criar novo usuário
        const bcryptSalt = bcrypt.genSaltSync();
        user = await User.create({
          name: name || email.split('@')[0],
          email,
          googleId,
          photo: picture || DEFAULT_PHOTO_URL,
          banner: DEFAULT_BANNER_URL,
          authMethod: 'google',
          password: bcrypt.hashSync(Math.random().toString(), bcryptSalt)
        });
      }
    }

    // Criar JWT com dados do usuário
    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      authMethod: user.authMethod
    };

    const token = await JWTSign(userObj);

    return {
      success: true,
      user: userObj,
      token
    };
  } catch (error) {
    console.error('❌ Erro ao autenticar com Google (Code):', error.message);
    return {
      success: false,
      error: `Falha ao autenticar com Google: ${error.message}`
    };
  }
};

// ========== GOOGLE OAUTH COM ACCESS TOKEN ==========
export const authenticateWithGoogleAccessToken = async (accessToken) => {
  try {
    // Obter informações do usuário usando o access_token
    const response = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const { id: googleId, email, name, picture } = response.data;

    // Verificar se usuário existe pelo Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Verificar se email já existe (caso de vinculação)
      user = await User.findOne({ email });

      if (user) {
        // Usuário existe com outro método - vincular Google
        if (!user.googleId) {
          user.googleId = googleId;
          user.authMethod = 'google';
          await user.save();
        }
      } else {
        // Criar novo usuário
        const bcryptSalt = bcrypt.genSaltSync();
        user = await User.create({
          name: name || email.split('@')[0],
          email,
          googleId,
          photo: picture || DEFAULT_PHOTO_URL,
          banner: DEFAULT_BANNER_URL,
          authMethod: 'google',
          password: bcrypt.hashSync(Math.random().toString(), bcryptSalt)
        });
      }
    }

    // Criar JWT com dados do usuário
    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      authMethod: user.authMethod
    };

    const token = await JWTSign(userObj);

    return {
      success: true,
      user: userObj,
      token
    };
  } catch (error) {
    console.error('❌ Erro ao autenticar com Google (Access Token):', error.message);
    return {
      success: false,
      error: `Falha ao autenticar com Google: ${error.message}`
    };
  }
};

// ========== GITHUB OAUTH ==========
export const authenticateWithGithub = async (code) => {
  try {
    if (!code) {
      throw new Error('Código do GitHub não fornecido');
    }

    // 1. Trocar código por access token com GitHub
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      {
        headers: { Accept: 'application/json' }
      }
    );

    const { access_token, error } = tokenResponse.data;

    if (error || !access_token) {
      throw new Error('Falha ao obter token do GitHub');
    }

    // 2. Obter dados do usuário GitHub
    const userResponse = await axios.get(
      'https://api.github.com/user',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          Accept: 'application/vnd.github+json'
        }
      }
    );

    const { id: githubId, login, name: githubName, email: githubEmail, avatar_url } = userResponse.data;

    // GitHub pode não retornar email público, então temos que verificar
    let email = githubEmail;
    if (!email) {
      // Se não houver email público, usar login@github.local
      email = `${login}@github.local`;
    }

    // Verificar se usuário existe
    let user = await User.findOne({ githubId });

    if (!user) {
      // Verificar se email já existe
      if (githubEmail) {
        user = await User.findOne({ email: githubEmail });
      }

      if (user) {
        // Usuário existe - vincular GitHub
        if (!user.githubId) {
          user.githubId = githubId;
          user.authMethod = 'github';
          await user.save();
        }
      } else {
        // Criar novo usuário
        const bcryptSalt = bcrypt.genSaltSync();
        user = await User.create({
          name: githubName || login,
          email,
          githubId,
          photo: avatar_url || DEFAULT_PHOTO_URL,
          banner: DEFAULT_BANNER_URL,
          authMethod: 'github',
          password: bcrypt.hashSync(Math.random().toString(), bcryptSalt)
        });
      }
    }

    // Criar JWT com dados do usuário
    const userObj = {
      _id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo,
      authMethod: user.authMethod
    };

    const token = await JWTSign(userObj);

    return {
      success: true,
      user: userObj,
      token
    };
  } catch (error) {
    console.error('❌ Erro ao autenticar com GitHub:', error.message);
    return {
      success: false,
      error: `Falha ao autenticar com GitHub: ${error.message}`
    };
  }
};
