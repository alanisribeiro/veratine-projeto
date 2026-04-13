import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import '../styles/BottomNav.css';

const HomeIcon = ({ isActive }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const HeartIcon = ({ isActive }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const CartIcon = ({ isActive }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const UserIcon = ({ isActive }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useAppContext();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
  const cartCount = cart.length;

  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${isActive('/') ? 'active' : ''}`}
        onClick={() => navigate('/')}
        title="Início"
      >
        <span className="nav-icon">
          <HomeIcon isActive={isActive('/')} />
        </span>
        <span className="nav-label">Início</span>
      </button>

      <button
        className={`nav-item ${isActive('/favorites') ? 'active' : ''}`}
        onClick={() => navigate('/favorites')}
        title="Favoritos"
      >
        <span className="nav-icon">
          <HeartIcon isActive={isActive('/favorites')} />
        </span>
        <span className="nav-label">Favoritos</span>
      </button>

      <button
        className={`nav-item ${isActive('/cart') ? 'active' : ''}`}
        onClick={() => navigate('/cart')}
        title="Carrinho"
      >
        <span className="nav-icon cart-icon-wrapper">
          <CartIcon isActive={isActive('/cart')} />
          {cartCount > 0 && <span className="badge">{cartCount}</span>}
        </span>
        <span className="nav-label">Carrinho</span>
      </button>

      <button
        className={`nav-item ${isActive('/account') ? 'active' : ''}`}
        onClick={() => navigate('/account')}
        title="Conta"
      >
        <span className="nav-icon">
          <UserIcon isActive={isActive('/account')} />
        </span>
        <span className="nav-label">Conta</span>
      </button>
    </nav>
  );
}
