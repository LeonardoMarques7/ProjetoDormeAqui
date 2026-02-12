import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserContext } from '@/components/contexts/UserContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');

        if (!code) {
          setError('Código de autorização não encontrado');
          setLoading(false);
          return;
        }

        console.log('🔄 Processando callback do Google...');

        // Enviar código para o backend
        const response = await axios.post(
          `${API_URL}/users/oauth/google`,
          { code },
          { withCredentials: true }
        );

        if (response.data) {
          console.log('✅ Login Google bem-sucedido:', response.data);

          // Salvar token em localStorage (se fornecido)
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
          }

          // Salvar usuário no contexto e localStorage
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));

          // Redirecionar para home ou dashboard
          navigate('/', { replace: true });
        }
      } catch (err) {
        console.error('❌ Erro ao processar callback do Google:', err);
        console.error('   Status:', err.response?.status);
        console.error('   Dados:', err.response?.data);
        console.error('   API URL:', API_URL);
        setError(err.response?.data?.error || 'Erro ao fazer login com Google: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, setUser]);

  if (loading) {
    return (
      <div className="callback-container">
        <div className="callback-content">
          <div className="spinner"></div>
          <p>Autenticando com Google...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="callback-container">
        <div className="callback-content error">
          <h2>Erro na Autenticação</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/login')}>
            Voltar para Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default GoogleCallback;

const styles = `
  .callback-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .callback-content {
    background: white;
    padding: 3rem;
    border-radius: 1rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    text-align: center;
  }

  .callback-content.error {
    background: #fff3cd;
    border: 2px solid #ffc107;
  }

  .spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1.5rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .callback-content p {
    font-size: 1.1rem;
    color: #666;
    margin: 0;
  }

  .callback-content button {
    margin-top: 1.5rem;
    padding: 0.75rem 2rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    transition: background 0.3s ease;
  }

  .callback-content button:hover {
    background: #764ba2;
  }
`;
