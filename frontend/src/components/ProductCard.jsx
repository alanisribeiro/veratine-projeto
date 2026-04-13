import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import LoginRequiredModal from './LoginRequiredModal';
import '../styles/ProductCard.css';

const categorySlugMap = {
  1: 'girassois',
  2: 'orquideas',
  3: 'rosas',
  4: 'suculentas',
  5: 'tulipas',
  6: 'lirios',
  7: 'margaridas',
  8: 'flores-do-campo',
  9: 'astromelias',
  10: 'lisianthus',
  11: 'crisantemos',
};

export default function ProductCard({ product }) {
  const { addToCart, removeFromCart, cart, isGuest, token, toggleFavorite, isFavorite } = useAppContext();
  const navigate = useNavigate();
  const favorited = isFavorite(product.id);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const isAuthenticated = !isGuest && !!token;
  const inCart = cart.some(item => item.id === product.id);
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock < 5;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (inCart) {
      removeFromCart(product.id);
    } else {
      addToCart(product, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

  const handleBuy = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    navigate('/cart');
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    toggleFavorite(product);
  };

  const handleProductClick = () => {
    const catId = product.category || product.category_id;
    const slug = categorySlugMap[catId];
    if (slug) {
      navigate(`/flower/${slug}`);
    } else {
      navigate(`/flower/${catId || product.id}`);
    }
  };

  return (
    <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`} onClick={handleProductClick}>
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
        />
        {isOutOfStock && (
          <div className="stock-overlay">
            <span>Esgotado</span>
          </div>
        )}
        {isLowStock && (
          <div className="low-stock-badge">Ultimas {product.stock} un.</div>
        )}
        {product.discount && !isOutOfStock && (
          <div className="discount-badge">{product.discount}% OFF</div>
        )}
        <button
          className={`favorite-btn ${favorited ? 'favorited' : ''}`}
          onClick={handleToggleFavorite}
          aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={favorited ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        {inCart && (
          <div className={`in-cart-badge ${justAdded ? 'just-added' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>

        {product.description && (
          <p className="product-description">{product.description}</p>
        )}

        {product.rating_avg > 0 && (
          <div className="product-rating">
            {product.rating_avg} ({product.reviewCount || 0})
          </div>
        )}

        <div className="product-price">
          R$ {product.price.toFixed(2)}
        </div>

        <div className="product-actions">
          {isOutOfStock ? (
            <button className="btn btn-disabled" disabled>
              Indisponivel
            </button>
          ) : (
            <>
              <button
                className={`btn btn-cart ${inCart ? 'in-cart' : ''}`}
                onClick={handleAddToCart}
              >
                {inCart ? '✓ No carrinho' : 'Carrinho'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleBuy}
              >
                Comprar
              </button>
            </>
          )}
        </div>
      </div>
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
