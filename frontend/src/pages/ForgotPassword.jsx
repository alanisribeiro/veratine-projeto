import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api';
import '../styles/AuthPages.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Por favor, digite seu email');
      return;
    }

    if (!email.includes('@')) {
      setError('Email inválido');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.forgotPassword(email);
      setSuccess(response.data.message);

      if (response.data.resetToken) {
        setTimeout(() => {
          navigate(`/reset-password?token=${response.data.resetToken}`);
        }, 2000);
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.request && !err.response) {
        setError('Conectando ao servidor, aguarde e tente novamente em alguns segundos.');
      } else {
        setError('Erro ao solicitar redefinição de senha');
      }
    } finally {
      setLoading(false);
    }
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

        <h1 className="auth-title">Recuperar Senha</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Digite seu email cadastrado"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) setError(''); }}
            required
            className="auth-input"
            disabled={loading}
          />

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar link de redefinição'}
          </button>
        </form>

        <div className="auth-footer">
          <span>Lembrou sua senha? </span>
          <Link to="/login" className="auth-link">
            Voltar ao login
          </Link>
        </div>
      </div>
    </div>
  );
}
