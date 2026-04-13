import categories from '../data/categories';

/**
 * Normaliza texto removendo acentos e convertendo para lowercase.
 * "Girassól" → "girassol", "ORQUÍDEA" → "orquidea"
 */
export const normalize = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

/**
 * Mapa de sinônimos/aliases para cada categoria.
 * Permite que buscas como "cacto", "suculenta" encontrem a categoria correta.
 */
const CATEGORY_KEYWORDS = {
  1: ['girassol', 'girassois', 'sunflower'],
  2: ['orquidea', 'orquideas', 'phalaenopsis', 'cymbidium', 'orchid'],
  3: ['rosa', 'rosas', 'rose'],
  4: ['suculenta', 'suculentas', 'cacto', 'cactos', 'terrario', 'cactus'],
  5: ['tulipa', 'tulipas', 'tulip'],
  6: ['lirio', 'lirios', 'lily'],
  7: ['margarida', 'margaridas', 'camomila', 'camomilas', 'daisy'],
  8: ['flores do campo', 'silvestre', 'campestre', 'pastoral', 'lavanda', 'gerbera', 'gerberas', 'calendula', 'calendulas', 'wildflower'],
  9: ['astromelia', 'astromelias', 'alstromelia', 'alstroemeria'],
  10: ['lisianthus', 'lisiantos', 'eustoma'],
  11: ['crisantemo', 'crisantemos', 'chrysanthemum', 'pompom'],
};

/**
 * Encontra a categoria que melhor corresponde ao termo de busca.
 * Retorna o ID da categoria ou null se nenhuma correspondência forte.
 */
const findMatchingCategory = (searchTerm) => {
  const term = normalize(searchTerm);

  for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      // Correspondência exata ou parcial forte do keyword
      if (keyword === term || keyword.startsWith(term) || term.startsWith(keyword)) {
        return parseInt(catId);
      }
    }
  }

  // Verificar nos nomes das categorias
  for (const cat of categories) {
    const catName = normalize(cat.name);
    if (catName === term || catName.startsWith(term) || term.startsWith(catName)) {
      return cat.id;
    }
  }

  return null;
};

/**
 * Verifica se um termo aparece como palavra completa (não como parte de outra palavra).
 * Exemplo: "rosa" em "Rosas Rosa" → true
 *          "rosa" em "prosa" → false
 */
const matchesWholeWord = (text, term) => {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|\\s|[^a-z])${escaped}`, 'i');
  return regex.test(text);
};

/**
 * Calcula o score de relevância de um produto para um termo de busca.
 *
 * Prioridades:
 * - Categoria exata: 100 pontos
 * - Nome começa com o termo: 80 pontos
 * - Palavra completa no nome: 60 pontos
 * - Substring no nome: 30 pontos
 * - Descrição contém o termo: 10 pontos
 *
 * Penalidades:
 * - Se o produto NÃO é da categoria buscada mas menciona a palavra → score reduzido
 */
const scoreProduct = (product, searchTerm) => {
  const term = normalize(searchTerm);
  if (!term) return 0;

  const normalizedName = normalize(product.name);
  const normalizedDesc = normalize(product.description || '');
  const categoryId = product.category_id || product.category;

  // Encontrar a categoria que corresponde ao termo buscado
  const matchedCategoryId = findMatchingCategory(searchTerm);

  let score = 0;

  // 1. CATEGORIA - Alta prioridade
  if (matchedCategoryId && categoryId === matchedCategoryId) {
    score += 100; // Produto é da categoria buscada
  }

  // 2. NOME - Média prioridade
  if (normalizedName === term) {
    score += 80; // Nome exato
  } else if (normalizedName.startsWith(term)) {
    score += 70; // Nome começa com o termo
  } else if (matchesWholeWord(normalizedName, term)) {
    score += 60; // Palavra completa no nome
  } else if (normalizedName.includes(term)) {
    score += 30; // Substring no nome (parcial)
  }

  // 3. DESCRIÇÃO - Baixa prioridade
  if (normalizedDesc.includes(term)) {
    score += 10;
  }

  // 4. PENALIDADE: Se a busca é claramente por uma categoria
  // e o produto NÃO é dessa categoria, mas menciona a palavra,
  // reduzir significativamente o score para evitar falsos positivos
  if (matchedCategoryId && categoryId !== matchedCategoryId) {
    // Se o produto só aparece por menção na descrição ou nome genérico,
    // reduzir o score drasticamente
    if (score > 0 && score < 100) {
      score = Math.min(score, 15); // Máximo 15 pontos para falsos positivos
    }
  }

  return score;
};

/**
 * Busca inteligente de produtos.
 *
 * @param {Array} products - Lista de produtos
 * @param {string} searchTerm - Termo de busca
 * @returns {Array} Produtos filtrados e ordenados por relevância
 */
export const searchProducts = (products, searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) {
    return products;
  }

  return products
    .map((product) => ({
      ...product,
      _score: scoreProduct(product, searchTerm),
    }))
    .filter((p) => p._score > 0)
    .sort((a, b) => {
      // Ordenar por score, depois por rating
      if (b._score !== a._score) return b._score - a._score;
      return (b.rating || b.rating_avg || 0) - (a.rating || a.rating_avg || 0);
    });
};

/**
 * Aplica filtros a uma lista de produtos.
 *
 * @param {Array} products - Lista de produtos
 * @param {Object} filters - Filtros a aplicar
 * @returns {Array} Produtos filtrados
 */
export const filterProducts = (products, filters) => {
  let result = [...products];

  // Filtro por categoria
  if (filters.categoryId) {
    const catId = parseInt(filters.categoryId);
    result = result.filter(
      (p) => (p.category_id || p.category) === catId
    );
  }

  // Filtro por preço
  if (filters.minPrice > 0) {
    result = result.filter((p) => p.price >= filters.minPrice);
  }
  if (filters.maxPrice && filters.maxPrice < 999) {
    result = result.filter((p) => p.price <= filters.maxPrice);
  }

  // Filtro por avaliação
  if (filters.minRating) {
    result = result.filter(
      (p) => (p.rating || p.rating_avg || 0) >= filters.minRating
    );
  }

  // Ordenação
  switch (filters.sortBy) {
    case 'price_asc':
      result.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      result.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      result.sort((a, b) =>
        (b.rating || b.rating_avg || 0) - (a.rating || a.rating_avg || 0)
      );
      break;
    case 'name_asc':
      result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break;
  }

  return result;
};

/**
 * Retorna o nome da categoria pelo ID.
 */
export const getCategoryName = (categoryId) => {
  const cat = categories.find((c) => c.id === categoryId);
  return cat ? cat.name : '';
};
