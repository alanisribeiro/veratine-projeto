import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getFlowerBySlug, getFlowerByCategoryId } from '../data/flowerData';
import localProducts from '../data/localProducts';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';
import LoginRequiredModal from '../components/LoginRequiredModal';
import '../styles/FlowerDetail.css';

export default function FlowerDetail() {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isGuest, token } = useAppContext();
  const [activeTab, setActiveTab] = useState('about');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Support both /flower/:slug and /product/:id routes
  const param = slug || id;
  let flower = null;
  if (param) {
    // First try by slug name
    flower = getFlowerBySlug(param);
    // If not found and param looks numeric, try by category ID
    if (!flower && !isNaN(param)) {
      flower = getFlowerByCategoryId(parseInt(param));
    }
    // If still not found, try to find via product's category
    if (!flower) {
      const product = localProducts.find(p => String(p.id) === String(param));
      if (product) {
        flower = getFlowerByCategoryId(product.category);
      }
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 200);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!flower) {
    return (
      <div className="fd-not-found">
        <div className="fd-not-found-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d9d0c7" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 15s1.5-2 4-2 4 2 4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </div>
        <h2>Flor não encontrada</h2>
        <p>A flor que você procura não existe no nosso catálogo.</p>
        <button className="fd-back-home-btn" onClick={() => navigate('/')}>
          Voltar ao início
        </button>
      </div>
    );
  }

  const isAuthenticated = !isGuest && !!token;
  const relatedProducts = localProducts.filter(p => p.category === flower.id);

  const handleAddBouquet = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    const bouquetProduct = relatedProducts[0] || {
      id: `bouquet-${flower.slug}`,
      name: `Buquê de ${flower.namePlural}`,
      price: flower.priceRange.min,
      image: flower.heroImage,
    };
    addToCart(bouquetProduct, 1);
  };

  const difficultyColor = {
    'Fácil': '#4a9e6e',
    'Intermediário': '#c4932a',
    'Avançado': '#c45a3a',
  };

  const tabs = [
    { id: 'about', label: 'Sobre', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'care', label: 'Cuidados', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707' },
    { id: 'meaning', label: 'Significado', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  ];

  return (
    <div className="fd-page">
      {/* Sticky Header */}
      <header className={`fd-header ${scrolled ? 'fd-header-scrolled' : ''}`}>
        <button className="fd-header-btn" onClick={() => navigate(-1)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <span className={`fd-header-title ${scrolled ? 'visible' : ''}`}>{flower.name}</span>
        <button className="fd-header-btn" onClick={() => navigate('/cart')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
          </svg>
        </button>
      </header>

      {/* Hero Image */}
      <section className="fd-hero">
        <img src={flower.heroImage} alt={flower.name} className="fd-hero-img" />
        <div className="fd-hero-overlay" />
        <div className="fd-hero-content">
          <span className="fd-hero-badge">{flower.difficulty}</span>
          <h1 className="fd-hero-title">{flower.namePlural}</h1>
          <p className="fd-hero-subtitle">
            {flower.seasons.join(' · ')} · {flower.lifespan}
          </p>
        </div>
      </section>

      {/* Price & Action */}
      <section className="fd-price-section">
        <div className="fd-price-info">
          <span className="fd-price-label">A partir de</span>
          <span className="fd-price-value">R$ {flower.priceRange.min.toFixed(2)}</span>
          <span className="fd-price-range">até R$ {flower.priceRange.max.toFixed(2)}</span>
        </div>
        <button className="fd-buy-btn" onClick={handleAddBouquet}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
          </svg>
          Adicionar ao carrinho
        </button>
      </section>

      {/* Quick Stats */}
      <section className="fd-stats">
        <div className="fd-stat-card">
          <div className="fd-stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b5b4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className="fd-stat-label">Dificuldade</span>
          <span className="fd-stat-value" style={{ color: difficultyColor[flower.difficulty] }}>{flower.difficulty}</span>
        </div>
        <div className="fd-stat-card">
          <div className="fd-stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b5b4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <span className="fd-stat-label">Duração</span>
          <span className="fd-stat-value">{flower.lifespan}</span>
        </div>
        <div className="fd-stat-card">
          <div className="fd-stat-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b5b4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.5 19H9a7 7 0 110-14h11" />
            </svg>
          </div>
          <span className="fd-stat-label">Época</span>
          <span className="fd-stat-value">{flower.seasons[0]}</span>
        </div>
      </section>

      {/* Tab Navigation */}
      <nav className="fd-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`fd-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d={tab.icon} />
            </svg>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <section className="fd-tab-content">
        {activeTab === 'about' && (
          <div className="fd-about animate-in">
            <div className="fd-info-card">
              <div className="fd-info-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b5b4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="10" r="3" />
                  <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 00-16 0c0 3 2.7 7 8 11.7z" />
                </svg>
                <h3>Origem</h3>
              </div>
              <p>{flower.description.origin}</p>
            </div>
            <div className="fd-info-card">
              <div className="fd-info-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b5b4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <h3>Características</h3>
              </div>
              <p>{flower.description.characteristics}</p>
            </div>
            <div className="fd-info-card fd-curiosity-card">
              <div className="fd-info-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b5b4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <h3>Curiosidades</h3>
              </div>
              <p>{flower.description.curiosities}</p>
            </div>
          </div>
        )}

        {activeTab === 'care' && (
          <div className="fd-care animate-in">
            <div className="fd-care-item">
              <div className="fd-care-icon water">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
                </svg>
              </div>
              <div className="fd-care-text">
                <h4>Rega</h4>
                <p>{flower.care.water}</p>
              </div>
            </div>
            <div className="fd-care-item">
              <div className="fd-care-icon light">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              </div>
              <div className="fd-care-text">
                <h4>Luminosidade</h4>
                <p>{flower.care.light}</p>
              </div>
            </div>
            <div className="fd-care-item">
              <div className="fd-care-icon soil">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 22h20" />
                  <path d="M12 2a5 5 0 015 5c0 4-5 7-5 11" />
                  <path d="M12 18a5 5 0 01-5-5c0-4 5-7 5-11" />
                </svg>
              </div>
              <div className="fd-care-text">
                <h4>Solo</h4>
                <p>{flower.care.soil}</p>
              </div>
            </div>
            <div className="fd-care-item">
              <div className="fd-care-icon climate">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" />
                </svg>
              </div>
              <div className="fd-care-text">
                <h4>Clima Ideal</h4>
                <p>{flower.care.climate}</p>
              </div>
            </div>
            {flower.care.extraTips && (
              <div className="fd-care-tip">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b5b4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p><strong>Dica extra:</strong> {flower.care.extraTips}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'meaning' && (
          <div className="fd-meaning animate-in">
            <div className="fd-meaning-card">
              <div className="fd-meaning-quote">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#e8dfd7" stroke="none">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="fd-meaning-text">{flower.symbolism}</p>
              </div>
            </div>
            <div className="fd-meaning-seasons">
              <h4>Melhor época para presentear</h4>
              <div className="fd-season-tags">
                {flower.seasons.map(season => (
                  <span key={season} className="fd-season-tag">{season}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="fd-related">
          <h2 className="fd-related-title">
            Produtos com {flower.namePlural}
          </h2>
          <div className="fd-related-grid">
            {relatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Bottom Spacing */}
      <div className="fd-bottom-spacer" />

      <BottomNav />
      <LoginRequiredModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
