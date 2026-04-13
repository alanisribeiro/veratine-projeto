// Função para normalizar texto (remover acentos e converter para lowercase)
export const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();
};

// Função para calcular score de relevância
export const calculateSearchScore = (product, searchTerm, categoryName) => {
  const normalizedTerm = normalizeText(searchTerm);
  const normalizedName = normalizeText(product.name);
  const normalizedCategory = normalizeText(categoryName);
  const normalizedDescription = normalizeText(product.description || '');

  let score = 0;

  // 1. Correspondência exata da categoria (maior prioridade)
  if (normalizedCategory.includes(normalizedTerm) || normalizedTerm.includes(normalizedCategory)) {
    score += 100;
  }

  // 2. Correspondência exata no nome
  if (normalizedName === normalizedTerm) {
    score += 80;
  }
  // 3. Nome começa com o termo
  else if (normalizedName.startsWith(normalizedTerm)) {
    score += 70;
  }
  // 4. Termo completo no nome
  else if (normalizedName.includes(` ${normalizedTerm}`) || normalizedName.includes(`${normalizedTerm} `)) {
    score += 60;
  }
  // 5. Termo parcial no nome
  else if (normalizedName.includes(normalizedTerm)) {
    score += 40;
  }

  // 6. Correspondência em tags (se existirem)
  if (product.searchTags) {
    product.searchTags.forEach((tag) => {
      const normalizedTag = normalizeText(tag);
      if (normalizedTag === normalizedTerm) {
        score += 90;
      } else if (normalizedTag.startsWith(normalizedTerm)) {
        score += 50;
      } else if (normalizedTag.includes(normalizedTerm)) {
        score += 30;
      }
    });
  }

  // 7. Correspondência na descrição (menor prioridade)
  if (normalizedDescription.includes(normalizedTerm)) {
    score += 10;
  }

  return score;
};

// Função para filtrar e ordenar produtos por relevância
export const searchProducts = (products, searchTerm, categoryMap = {}) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return products;
  }

  // Calcular score para cada produto
  const productsWithScore = products
    .map((product) => {
      const categoryName = categoryMap[product.category_id] || '';
      const score = calculateSearchScore(product, searchTerm, categoryName);
      return { ...product, relevanceScore: score };
    })
    // Filtrar apenas produtos com score > 0
    .filter((product) => product.relevanceScore > 0)
    // Ordenar por score descendente
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  return productsWithScore;
};

// Função para aplicar filtros
export const applyFilters = (products, filters) => {
  let filtered = [...products];

  // Filtro por categoria
  if (filters.categoryId && filters.categoryId > 0) {
    filtered = filtered.filter((p) => p.category_id === filters.categoryId);
  }

  // Filtro por preço mínimo
  if (filters.minPrice && filters.minPrice > 0) {
    filtered = filtered.filter((p) => p.price >= filters.minPrice);
  }

  // Filtro por preço máximo
  if (filters.maxPrice && filters.maxPrice > 0) {
    filtered = filtered.filter((p) => p.price <= filters.maxPrice);
  }

  // Filtro por rating mínimo
  if (filters.minRating && filters.minRating > 0) {
    filtered = filtered.filter((p) => (p.rating_avg || 0) >= filters.minRating);
  }

  // Ordenação
  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        break;
    }
  }

  return filtered;
};
