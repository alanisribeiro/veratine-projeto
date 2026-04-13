import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';
import BottomNav from '../components/BottomNav';
import { productsAPI } from '../api/api';
import localProducts from '../data/localProducts';
import categories from '../data/categories';
import { searchProducts, filterProducts } from '../utils/searchEngine';
import '../styles/AllFlowers.css';

export default function AllFlowers() {
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    categoryId: null,
    minPrice: 0,
    maxPrice: 999,
    sortBy: '',
    minRating: null,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
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

  // Pipeline: busca inteligente → filtros
  const getResults = () => {
    let result = [...allProducts];

    // 1. Busca inteligente (se houver termo)
    if (searchQuery.trim()) {
      result = searchProducts(result, searchQuery);
    }

    // 2. Filtros
    result = filterProducts(result, filters);

    return result;
  };

  const results = getResults();

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
            <h2 className="all-flowers-title">Todas as Flores</h2>
            <p className="all-flowers-count">
              {results.length} {results.length === 1 ? 'produto' : 'produtos'}
            </p>
          </div>
        </div>

        {/* Busca inline */}
        <div className="search-advanced">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome, tipo de flor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-advanced-input"
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Filtros */}
        <ProductFilters
          categories={categories}
          filters={filters}
          onFilterChange={setFilters}
        />

        {/* Resultados */}
        {loading ? (
          <div className="loading-state">Carregando produtos...</div>
        ) : results.length === 0 ? (
          <div className="empty-flowers-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d9d0c7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p>
              {searchQuery
                ? `Nenhuma flor encontrada para "${searchQuery}"`
                : 'Nenhuma flor encontrada com esses filtros'}
            </p>
            <p style={{ fontSize: '12px', color: '#c4b8ac', margin: '4px 0 0' }}>
              Tente outro termo ou ajuste os filtros
            </p>
            <button
              className="clear-filters-btn"
              onClick={() => {
                setSearchQuery('');
                setFilters({
                  categoryId: null,
                  minPrice: 0,
                  maxPrice: 999,
                  sortBy: '',
                  minRating: null,
                });
              }}
            >
              Limpar tudo
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
