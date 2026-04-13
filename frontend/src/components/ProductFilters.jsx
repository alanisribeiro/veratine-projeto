import React, { useState } from 'react';
import '../styles/ProductFilters.css';

export default function ProductFilters({ categories, filters, onFilterChange }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveFilters =
    filters.categoryId ||
    filters.minPrice > 0 ||
    (filters.maxPrice && filters.maxPrice < 999) ||
    filters.sortBy ||
    filters.minRating;

  const update = (partial) => {
    onFilterChange({ ...filters, ...partial });
  };

  const resetAll = () => {
    onFilterChange({
      categoryId: null,
      minPrice: 0,
      maxPrice: 999,
      sortBy: '',
      minRating: null,
    });
  };

  return (
    <div className="pf-container">
      {/* Barra superior: toggle + ordenação + limpar */}
      <div className="pf-bar">
        <button
          className={`pf-toggle ${isExpanded ? 'active' : ''} ${hasActiveFilters ? 'has-filters' : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filtros
          {hasActiveFilters && <span className="pf-badge" />}
        </button>

        <select
          className="pf-sort"
          value={filters.sortBy || ''}
          onChange={(e) => update({ sortBy: e.target.value })}
        >
          <option value="">Relevância</option>
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
          <option value="rating">Melhor avaliação</option>
          <option value="name_asc">A-Z</option>
        </select>

        {hasActiveFilters && (
          <button className="pf-clear" onClick={resetAll}>
            Limpar
          </button>
        )}
      </div>

      {/* Painel expandível de filtros */}
      {isExpanded && (
        <div className="pf-panel">
          {/* Categoria */}
          <div className="pf-group">
            <span className="pf-label">Categoria</span>
            <div className="pf-pills">
              <button
                className={`pf-pill ${!filters.categoryId ? 'active' : ''}`}
                onClick={() => update({ categoryId: null })}
              >
                Todas
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`pf-pill ${filters.categoryId === cat.id ? 'active' : ''}`}
                  onClick={() =>
                    update({
                      categoryId: filters.categoryId === cat.id ? null : cat.id,
                    })
                  }
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Preço */}
          <div className="pf-group">
            <span className="pf-label">Preço (R$)</span>
            <div className="pf-price">
              <input
                type="number"
                min="0"
                placeholder="Mín"
                value={filters.minPrice || ''}
                onChange={(e) =>
                  update({ minPrice: e.target.value ? parseFloat(e.target.value) : 0 })
                }
                className="pf-input"
              />
              <span className="pf-sep">até</span>
              <input
                type="number"
                min="0"
                placeholder="Máx"
                value={filters.maxPrice < 999 ? filters.maxPrice : ''}
                onChange={(e) =>
                  update({ maxPrice: e.target.value ? parseFloat(e.target.value) : 999 })
                }
                className="pf-input"
              />
            </div>
          </div>

          {/* Avaliação */}
          <div className="pf-group">
            <span className="pf-label">Avaliação</span>
            <div className="pf-pills">
              <button
                className={`pf-pill ${!filters.minRating ? 'active' : ''}`}
                onClick={() => update({ minRating: null })}
              >
                Todas
              </button>
              {[4.0, 4.5, 4.8].map((r) => (
                <button
                  key={r}
                  className={`pf-pill ${filters.minRating === r ? 'active' : ''}`}
                  onClick={() =>
                    update({ minRating: filters.minRating === r ? null : r })
                  }
                >
                  {r}+
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
