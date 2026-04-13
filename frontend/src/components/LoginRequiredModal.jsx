import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginRequiredModal.css';

export default function LoginRequiredModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div className="login-modal-overlay" onClick={handleOverlayClick}>
      <div className="login-modal-content">
        <button className="login-modal-close" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className="login-modal-icon">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 4C16 4 12 8 12 12C12 14.2 13.8 16 16 16C18.2 16 20 14.2 20 12C20 8 16 4 16 4Z" fill="currentColor" opacity="0.6"/>
            <path d="M10 8C10 8 6 10 6 14C6 16.2 7.8 18 10 18C12.2 18 14 16.2 14 14C14 10 10 8 10 8Z" fill="currentColor" opacity="0.4"/>
            <path d="M22 8C22 8 26 10 26 14C26 16.2 24.2 18 22 18C19.8 18 18 16.2 18 14C18 10 22 8 22 8Z" fill="currentColor" opacity="0.4"/>
            <path d="M16 16C16 16 16 28 16 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        <h3 className="login-modal-title">Login necessário</h3>
        <p className="login-modal-message">
          Você precisa fazer login para continuar.
        </p>

        <button className="login-modal-btn" onClick={handleLogin}>
          Fazer Login
        </button>
      </div>
    </div>,
    document.body
  );
}
