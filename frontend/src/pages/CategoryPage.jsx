import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import BottomNav from '../components/BottomNav';
import { productsAPI } from '../api/api';
import categories from '../data/categories';
import localProducts from '../data/localProducts';
import '../styles/CategoryPage.css';

export default function CategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categoryId = parseInt(id);
  const category = categories.find((c) => c.id === categoryId);
  const categoryName = category ? category.name : 'Categoria';

  useEffect(() => {
    loadProducts();
  }, [id]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await productsAPI.getAll({ category: categoryId, limit: 100 });
      const apiProducts = response.data.products || [];
      setProducts(apiProducts.length > 0 ? apiProducts : localProducts.filter((p) => p.category === categoryId));
    } catch (err) {
      const local = localProducts.filter((p) => p.category === categoryId);
      if (local.length > 0) {
        setProducts(local);
      } else {
        setError('Erro ao carregar produtos');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-page">
      <Header />
      <SearchBar />

      <div className="category-page-content">
        <div className="category-page-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="category-page-title">{categoryName}</h2>
        </div>

        {category && category.image && (
          <div className="category-page-banner">
            <img src={category.image} alt={categoryName} className="category-banner-image" />
            <div className="category-banner-overlay">
              <h3>{categoryName}</h3>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading-state">Carregando produtos...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : products.length === 0 ? (
          <div className="empty-state">Nenhum produto encontrado nesta categoria.</div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
