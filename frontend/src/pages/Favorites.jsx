import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import ProductCard from '../components/ProductCard';
import { useAppContext } from '../context/AppContext';
import '../styles/Favorites.css';

export default function Favorites() {
  const { favorites } = useAppContext();
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="favorites-container">
        <div className="favorites-header">
          <h1 className="favorites-title">Meus Favoritos</h1>
          {favorites.length > 0 && (
            <span className="favorites-count">{favorites.length} {favorites.length === 1 ? 'item' : 'itens'}</span>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className="favorites-empty">
            <svg className="favorites-empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h2 className="favorites-empty-title">Nenhum favorito ainda</h2>
            <p className="favorites-empty-text">
              Explore nossos produtos e toque no coração para salvar seus favoritos.
            </p>
            <button className="favorites-empty-btn" onClick={() => navigate('/')}>
              Explorar Produtos
            </button>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </>
  );
}
