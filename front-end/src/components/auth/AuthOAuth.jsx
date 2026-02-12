import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const AuthOAuth = ({ onSuccess, variant = 'login' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ========== LOGIN GOOGLE ==========
  const googleLogin = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      setLoading(true);
      setError('');

      try {
        // credentialResponse.code vem do authorization_code flow
        const response = await axios.post(
          `${API_URL}/users/oauth/google`,
          { code: credentialResponse.code },
          { withCredentials: true }
        );

        if (response.data) {
          console.log('✅ Login Google bem-sucedido:', response.data);
          if (onSuccess) onSuccess(response.data);
          navigate('/');
        }
      } catch (err) {
        console.error('❌ Erro ao fazer login com Google:', err);
        setError(err.response?.data?.error || 'Erro ao fazer login com Google');
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error('❌ Erro Google OAuth:', error);
      setError('Erro ao conectar com Google');
      setLoading(false);
    },
    flow: 'auth-code'
  });

  // ========== LOGIN GITHUB ==========
  const handleGithubLogin = () => {
    setLoading(true);
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    
    if (!clientId) {
      setError('GitHub Client ID não configurado');
      setLoading(false);
      return;
    }

    // Determinar redirect URI baseado no host
    let redirectUri = `${window.location.origin}/auth/github/callback`;
    
    // Se estiver em localhost, pode ter porta diferente, então tenta as duas principais
    if (window.location.hostname === 'localhost') {
      console.log('🔗 DEV: GitHub redirect URI:', redirectUri);
    } else {
      console.log('🔗 PROD: GitHub redirect URI:', redirectUri);
    }
    
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;
  };

  return (
    <div className="auth-oauth">
      <div className="divider">OU</div>

      <div className="oauth-buttons">
        <button
          onClick={() => googleLogin()}
          disabled={loading}
          className="oauth-btn google-btn"
          title="Login com Google"
        >
          {loading ? '⏳ Conectando...' : '🔵 Google'}
        </button>

        <button
          onClick={handleGithubLogin}
          disabled={loading}
          className="oauth-btn github-btn"
          title="Login com GitHub"
        >
          {loading ? '⏳ Conectando...' : '⚫ GitHub'}
        </button>
      </div>

      {error && <div className="auth-error">{error}</div>}

      <style jsx>{`
        .auth-oauth {
          width: 100%;
          margin-top: 1.5rem;
        }

        .divider {
          text-align: center;
          color: #999;
          margin: 1.5rem 0 1rem 0;
          position: relative;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #ddd;
          z-index: 0;
        }

        .divider::after {
          content: attr(data-text);
          position: relative;
          z-index: 1;
          background: white;
          padding: 0 0.5rem;
        }

        .oauth-buttons {
          display: flex;
          gap: 1rem;
          width: 100%;
        }

        .oauth-btn {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid #ddd;
          border-radius: 0.5rem;
          background: white;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.3s ease;

          &:hover:not(:disabled) {
            border-color: #999;
            background: #f9f9f9;
          }

          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        }

        .google-btn {
          border-color: #ddd;
          color: #333;

          &:hover:not(:disabled) {
            background: #f8f8f8;
            border-color: #4285f4;
          }
        }

        .github-btn {
          border-color: #ddd;
          color: #333;

          &:hover:not(:disabled) {
            background: #f8f8f8;
            border-color: #24292e;
          }
        }

        .auth-error {
          color: #d32f2f;
          font-size: 0.875rem;
          margin-top: 1rem;
          padding: 0.75rem;
          background: #ffebee;
          border-radius: 0.5rem;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default AuthOAuth;
