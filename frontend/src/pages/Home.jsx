import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';
import { productsAPI } from '../api/api';
import categories from '../data/categories';
import localProducts from '../data/localProducts';
import '../styles/Home.css';
import offerImage1 from '../assets/offer-1.jpg';
import offerImage2 from '../assets/offer-2.jpg';
import offerImage3 from '../assets/offer-3.jpg';

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [catStep, setCatStep] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentOfferIndex((prev) => (prev + 1) % specialOffers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll({ limit: 100 });
      const apiProducts = response.data.products || [];
      const allProducts = apiProducts.length > 0 ? apiProducts : localProducts;

      // Distribute products evenly across categories (50 products, 10 rows × 5)
      const byCategory = {};
      allProducts.forEach(p => {
        const catId = p.category || p.category_id;
        if (!byCategory[catId]) byCategory[catId] = [];
        byCategory[catId].push(p);
      });

      const distributed = [];
      const maxPerCategory = 5;
      let totalAdded = 0;
      const targetTotal = 50;

      // Round-robin distribution
      while (totalAdded < targetTotal && Object.keys(byCategory).length > 0) {
        for (const catId of Object.keys(byCategory)) {
          if (byCategory[catId].length > 0 && totalAdded < targetTotal) {
            const categoryAdded = distributed.filter(p => (p.category || p.category_id) === parseInt(catId)).length;
            if (categoryAdded < maxPerCategory) {
              distributed.push(byCategory[catId].shift());
              totalAdded++;
            }
          }
        }
      }

      setProducts(distributed.length > 0 ? distributed : allProducts);
    } catch (err) {
      setProducts(localProducts);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const SLOT = 144;
  const STEP_ITEMS = 2;
  const VISIBLE = 7;
  const maxSteps = Math.max(0, Math.ceil((categories.length - VISIBLE) / STEP_ITEMS));

  const scrollCategories = (direction) => {
    setCatStep((prev) => {
      if (direction === 'right') return Math.min(prev + 1, maxSteps);
      return Math.max(prev - 1, 0);
    });
  };


  const specialOffers = [
    { id: 3, title: 'Combo Especial', discount: '40% OFF', image: offerImage3 },
    { id: 1, title: 'Flores Frescas', discount: '30% OFF', image: offerImage1 },
    { id: 2, title: 'Plantas Raras', discount: '50% OFF', image: offerImage2 },
  ];

  return (
    <>
      <Header />
      <SearchBar />

      <div className="home-container">
        {error && (
          <div className="error-state">
            {error}
          </div>
        )}

        <div className="home-section offers-section">
          <h2 className="section-title">Ofertas Especiais</h2>
          <div className="carousel-container">
            <div className="carousel-wrapper">
              <div
                className="carousel-track"
                style={{ transform: `translateX(-${currentOfferIndex * 100}%)` }}
              >
                {specialOffers.map((offer) => (
                  <div
                    key={offer.id}
                    className="carousel-slide"
                    style={{ backgroundImage: `url(${offer.image})` }}
                    onClick={() => navigate('/offers')}
                  >
                    <div className="carousel-overlay">
                      <div className="offer-content">
                        <div className="offer-discount">{offer.discount}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="carousel-dots">
                {specialOffers.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${index === currentOfferIndex ? 'active' : ''}`}
                    onClick={() => setCurrentOfferIndex(index)}
                    aria-label={`Ir para oferta ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="home-section">
          <h2 className="section-title">Categorias</h2>
          <div className="categories-carousel-wrapper">
            <button
              className="carousel-arrow carousel-arrow-left"
              onClick={() => scrollCategories('left')}
              aria-label="Mover categorias para esquerda"
              disabled={catStep === 0}
            >
              ‹
            </button>
            <div className="categories-carousel-viewport">
              <div
                className="categories-carousel-track"
                style={{ transform: `translateX(-${catStep * STEP_ITEMS * SLOT}px)` }}
              >
                {categories.map((category) => (
                  <Link to={`/category/${category.id}`} key={category.id} className="category-link">
                    <div className="category-item">
                      <div className="category-image-wrapper">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="category-image"
                        />
                      </div>
                      <div className="category-name">{category.name}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <button
              className="carousel-arrow carousel-arrow-right"
              onClick={() => scrollCategories('right')}
              aria-label="Mover categorias para direita"
              disabled={catStep === maxSteps}
            >
              ›
            </button>
          </div>
        </div>

        <div className="home-section">
          <h2 className="section-title">Produtos em Tendência</h2>

          {loading ? (
            <div className="loading-state">Carregando produtos...</div>
          ) : products.length === 0 ? (
            <div className="empty-state">Nenhum produto encontrado</div>
          ) : (
            <div className="products-grid">
              {(isMobile ? products.slice(0, 16) : products).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        <div className="home-section see-all-section">
          <button className="see-all-btn" onClick={() => navigate('/all-flowers')}>
            <span className="see-all-text">Ver todas as flores</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="home-section">
          <h2 className="section-title">Próximos Eventos</h2>
          <div className="offer-banner" style={{ minHeight: '120px' }}>
            <div>
              <div className="offer-title">Dia das Flores</div>
              <div className="offer-text" style={{ marginTop: '8px', fontSize: '13px' }}>
                Em breve: 15 de Março
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </>
  );
}
