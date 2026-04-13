import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';
import { productsAPI } from '../api/api';
import localProducts from '../data/localProducts';
import { searchProducts, getCategoryName } from '../utils/searchEngine';
import '../styles/AllFlowers.css';

export default function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [query]);

  const loadProducts = async () => {
    if (!query.trim()) {
      setAllProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await productsAPI.getAll({ limit: 100 });
      const apiProducts = response.data.products || [];
      setAllProducts(apiProducts.length > 0 ? apiProducts : localProducts);
    } catch {
      setAllProducts(localProducts);
    } finally {
      setLoading(false);
    }
  };

  const results = query.trim() ? searchProducts(allProducts, query) : [];

  return (
    <div className="all-flowers-page">
      <Header />
      <SearchBar />

      <div className="all-flowers-content">
        <div className="all-flowers-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="all-flowers-title">Resultados de Busca</h2>
            {query && (
              <p className="all-flowers-count">
                {results.length} {results.length === 1 ? 'resultado' : 'resultados'} para "{query}"
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Buscando flores...</div>
        ) : results.length === 0 ? (
          <div className="empty-flowers-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d9d0c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p>Nenhuma flor encontrada para "{query}"</p>
            <p style={{ fontSize: '12px', color: '#c4b8ac', margin: '4px 0 0' }}>
              Tente buscar por "girassol", "rosa", "orquídea" ou outra flor
            </p>
            <button className="clear-filters-btn" onClick={() => navigate('/all-flowers')}>
              Ver todas as flores
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
