import "dotenv/config";
import jwt from "jsonwebtoken";

// Lê segredo dinamicamente e fornece fallback em dev
const getSecret = () => {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('JWT_SECRET_KEY está ausente no ambiente de produção.');
      throw new Error('JWT_SECRET_KEY missing');
    }
    console.warn('JWT_SECRET_KEY não definido — usando segredo de desenvolvimento. Não use em produção.');
    return 'dev_jwt_secret';
  }
  return secret;
};

// ⭐ Atualizado para aceitar o nome do cookie como parâmetro
// Lê o token do cookie OU do header Authorization: Bearer <token>
export const JWTVerify = (req, cookieName = 'token') => {
  const cookieToken = req.cookies && req.cookies[cookieName];
  const authHeader = req.headers && req.headers['authorization'];
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const token = cookieToken || bearerToken;

  if (token) {
    return new Promise((resolve, reject) => {
      try {
        const secret = getSecret();
        jwt.verify(token, secret, {}, (error, userInfo) => {
          if (error) {
            console.error("Erro ao verificar JWT:", error);
            return reject(error);
          }
          resolve(userInfo);
        });
      } catch (err) {
        console.error('Erro de configuração em JWTVerify:', err);
        return reject(err);
      }
    });
  } else {
    return Promise.reject(new Error("Token não encontrado"));
  }
};

export const JWTSign = (newUserObj) => {
  return new Promise((resolve, reject) => {
    try {
      const secret = getSecret();
      jwt.sign(newUserObj, secret, { expiresIn: '7d' }, (error, token) => {
        if (error) {
          console.error("Erro ao assinar JWT:", error);
          return reject(error);
        }
        resolve(token);
      });
    } catch (err) {
      console.error('Erro de configuração em JWTSign:', err);
      reject(err);
    }
  });
};
