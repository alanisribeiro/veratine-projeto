import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAppContext } from '../context/AppContext';
import { authAPI } from '../api/api';
import '../styles/AuthPages.css';

export default function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAppContext();

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) setError('');
  };

  const validatePassword = (pwd) => {
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const hasMinLength = pwd.length >= 10;

    if (!hasMinLength) {
      return 'Senha deve ter no mínimo 10 caracteres';
    }
    if (!hasUpperCase) {
      return 'Senha deve conter pelo menos uma letra maiúscula';
    }
    if (!hasSpecialChar) {
      return 'Senha deve conter pelo menos um caractere especial (!@#$%^&*)';
    }
    return null;
  };

  const validateForm = () => {
    setError('');

    if (!firstName.trim()) {
      setError('Por favor, digite seu primeiro nome');
      return false;
    }
    if (!lastName.trim()) {
      setError('Por favor, digite seu sobrenome');
      return false;
    }
    if (!email.trim()) {
      setError('Por favor, digite seu email');
      return false;
    }
    if (!email.includes('@')) {
      setError('Email inválido. Use um email válido (ex: usuario@email.com)');
      return false;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return false;
    }

    if (password !== confirmPassword) {
      setError('As senhas não conferem. Verifique e tente novamente');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccess('');

    try {
      const response = await authAPI.register(
        `${firstName} ${lastName}`,
        email,
        password,
        confirmPassword
      );
      const { token, user } = response.data;

      setSuccess('Conta criada com sucesso! Redirecionando para login...');

      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      let errorMessage = 'Erro ao cadastrar';

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('cadastrado')) {
        setError('Este email já está cadastrado. Tente fazer login ou use outro email');
      } else if (errorMessage.toLowerCase().includes('senhas') && errorMessage.toLowerCase().includes('conferem')) {
        setError('As senhas não conferem');
      } else if (errorMessage.toLowerCase().includes('obrigatório')) {
        setError('Todos os campos são obrigatórios');
      } else if (err.request && !err.response) {
        setError('Conectando ao servidor, aguarde e tente novamente em alguns segundos.');
      } else {
        setError(errorMessage);
      }

      console.error('Erro de cadastro:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUpSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { credential } = credentialResponse;
      const response = await authAPI.googleLogin(credential);
      const { token, user } = response.data;

      setSuccess('Conta criada com sucesso! Redirecionando para home...');

      setTimeout(() => {
        login(user, token);
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error('Erro de signup Google:', err);
      setError('Erro ao fazer cadastro com Google. Verifique e tente novamente');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUpError = () => {
    setError('Erro ao fazer cadastro com Google');
  };

  return (
    <div className="auth-container">
      <div className="auth-background"></div>

      <div className="auth-card">
        <h1 className="auth-title">Cadastro</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            placeholder="Primeiro nome"
            value={firstName}
            onChange={handleInputChange(setFirstName)}
            required
            className="auth-input"
            disabled={loading}
          />

          <input
            type="text"
            placeholder="Sobrenome"
            value={lastName}
            onChange={handleInputChange(setLastName)}
            required
            className="auth-input"
            disabled={loading}
          />

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
            placeholder="Senha (min 10 caracteres, 1 maiúscula, 1 especial)"
            value={password}
            onChange={handleInputChange(setPassword)}
            required
            className="auth-input"
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Confirmar Senha"
            value={confirmPassword}
            onChange={handleInputChange(setConfirmPassword)}
            required
            className="auth-input"
            disabled={loading}
          />

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Criando conta...' : 'Cadastrar'}
          </button>
        </form>

        <div className="divider">
          <span>Ou continuar com</span>
        </div>

        <div className="social-buttons" style={{ justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSignUpSuccess}
            onError={handleGoogleSignUpError}
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
          <span>Já tem uma conta? </span>
          <Link to="/login" className="auth-link">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
