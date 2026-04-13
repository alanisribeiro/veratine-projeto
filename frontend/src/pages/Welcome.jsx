import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Welcome.css';

export default function Welcome() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/login');
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="welcome-logo">
          <svg className="welcome-logo-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 4C16 4 12 8 12 12C12 14.2 13.8 16 16 16C18.2 16 20 14.2 20 12C20 8 16 4 16 4Z" fill="currentColor" opacity="0.6"/>
            <path d="M10 8C10 8 6 10 6 14C6 16.2 7.8 18 10 18C12.2 18 14 16.2 14 14C14 10 10 8 10 8Z" fill="currentColor" opacity="0.4"/>
            <path d="M22 8C22 8 26 10 26 14C26 16.2 24.2 18 22 18C19.8 18 18 16.2 18 14C18 10 22 8 22 8Z" fill="currentColor" opacity="0.4"/>
            <path d="M16 16C16 16 16 28 16 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M16 20C13 20 11 18 11 18" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
            <path d="M16 22C19 22 21 20 21 20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
          </svg>
        </div>

        <h1 className="welcome-subtitle">Bem-vindo a</h1>
        <h2 className="welcome-title">Veratine</h2>

        <button className="welcome-btn" onClick={handleContinue}>
          Continuar
        </button>

        <p className="welcome-footer">
          Sua loja online de flores e plantas
        </p>
      </div>
    </div>
  );
}
