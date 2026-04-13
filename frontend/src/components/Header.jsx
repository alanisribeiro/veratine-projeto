import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ThemeToggle from './ThemeToggle';
import '../styles/Header.css';

export default function Header() {
  const { user, isGuest, logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left" onClick={handleLogoClick}>
          <h1 className="logo">Veratine</h1>
          <p className="tagline">FLORES & PRESENTES</p>
        </div>

        <div className="header-right">
          <ThemeToggle />
          {user && !isGuest ? (
            <div className="user-section">
              <span className="user-name">Bem-vindo, {user.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                Sair
              </button>
            </div>
          ) : isGuest ? (
            <div className="user-section">
              <button onClick={handleLoginClick} className="login-btn">
                Entrar
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {isGuest && (
        <div className="guest-banner">
          Você está navegando como visitante. Faça login para finalizar compras!
        </div>
      )}
    </header>
  );
}
