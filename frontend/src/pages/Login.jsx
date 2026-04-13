import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAppContext } from '../context/AppContext';
import { authAPI } from '../api/api';
import '../styles/AuthPages.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAppContext();

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError('');
  };

  const validateForm = () => {
    if (!email.trim()) {
      setError('Por favor, digite seu email');
      return false;
    }
    if (!email.includes('@')) {
      setError('Email invalido. Use um email valido (ex: usuario@email.com)');
      return false;
    }
    if (!password) {
      setError('Por favor, digite sua senha');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      login(user, token);
      navigate('/');
    } catch (err) {
      let errorMessage = 'Erro ao fazer login';

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('senha') || errorMessage.toLowerCase().includes('invalido')) {
        setError('Email ou senha invalidos. Verifique seus dados e tente novamente');
      } else if (errorMessage.toLowerCase().includes('nao encontrado')) {
        setError('Usuario nao encontrado. Verifique o email ou faca cadastro');
      } else if (errorMessage.toLowerCase().includes('obrigatorio')) {
        setError('Email e senha sao obrigatorios');
      } else if (err.request && !err.response) {
        setError('Conectando ao servidor, aguarde e tente novamente em alguns segundos.');
      } else {
        setError(errorMessage);
      }

      console.error('Erro de login:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');

    try {
      const { credential } = credentialResponse;
      const response = await authAPI.googleLogin(credential);
      const { token, user } = response.data;

      login(user, token);
      navigate('/');
    } catch (err) {
      console.error('Erro de login Google:', err);
      if (err.request && !err.response) {
        setError('Conectando ao servidor, aguarde e tente novamente em alguns segundos.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Erro ao fazer login com Google. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    setError('Erro ao fazer login com Google');
  };

  return (
    <div className="auth-container">
      <div className="auth-background"></div>

      <div className="auth-card">
        <div className="auth-logo">
          <svg className="auth-logo-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 4C16 4 12 8 12 12C12 14.2 13.8 16 16 16C18.2 16 20 14.2 20 12C20 8 16 4 16 4Z" fill="currentColor" opacity="0.6"/>
            <path d="M10 8C10 8 6 10 6 14C6 16.2 7.8 18 10 18C12.2 18 14 16.2 14 14C14 10 10 8 10 8Z" fill="currentColor" opacity="0.4"/>
            <path d="M22 8C22 8 26 10 26 14C26 16.2 24.2 18 22 18C19.8 18 18 16.2 18 14C18 10 22 8 22 8Z" fill="currentColor" opacity="0.4"/>
            <path d="M16 16C16 16 16 28 16 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M16 20C13 20 11 18 11 18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
            <path d="M16 22C19 22 21 20 21 20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
          </svg>
          <div className="auth-logo-text">
            <span className="auth-logo-name">Veratine</span>
            <span className="auth-logo-tagline">FLORES & PRESENTES</span>
          </div>
        </div>

        <h1 className="auth-title">Entrar</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleInputChange(setEmail)}
            required
            className="auth-input"
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={handleInputChange(setPassword)}
            required
            className="auth-input"
            disabled={loading}
          />

          <div className="forgot-password">
            <span>Esqueceu a senha? </span>
            <Link to="/forgot-password">Clique aqui</Link>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="divider">
          <span>Ou continuar com</span>
        </div>

        <div className="social-buttons" style={{ justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
            width="200"
          />
        </div>

        <div className="divider">
          <span>OU</span>
        </div>

        <button
          type="button"
          className="guest-button"
          disabled={loading}
          onClick={() => {
            login({ name: 'Visitante' }, null, true);
            navigate('/');
          }}
        >
          Continuar como visitante
        </button>

        <div className="auth-footer">
          <span>Não tem uma conta? </span>
          <Link to="/signup" className="auth-link">
            Cadastrar
          </Link>
        </div>
      </div>
    </div>
  );
}
