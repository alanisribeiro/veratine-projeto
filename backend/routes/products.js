import express from 'express';
import { getDB } from '../db/init.js';
import { authMiddleware } from '../middleware/auth.js';
import { normalizeText, calculateSearchScore, applyFilters } from '../utils/searchUtils.js';

const router = express.Router();

// Função auxiliar para busca inteligente
const performIntelligentSearch = (products, searchTerm, categories) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return products;
  }

  // Criar mapa de categoria
  const categoryMap = {};
  categories.forEach((cat) => {
    categoryMap[cat.id] = cat.name;
  });

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

// GET /products - Listar produtos com filtros e busca inteligente
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, limit = 100, offset = 0 } = req.query;

    const db = await getDB();

    // Buscar todas as categorias
    db.all('SELECT id, name FROM categories', [], (err, categories) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar categorias' });
      }

      let query = `SELECT p.* FROM products p WHERE 1=1`;
      const params = [];

      // Filtro por categoria
      if (category) {
        query += ' AND p.category_id = ?';
        params.push(category);
      }

      // Filtro por preço mínimo
      if (minPrice) {
        query += ' AND p.price >= ?';
        params.push(minPrice);
      }

      // Filtro por preço máximo
      if (maxPrice) {
        query += ' AND p.price <= ?';
        params.push(maxPrice);
      }

      db.all(query, params, (err, products) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao buscar produtos' });
        }

        // Aplicar busca inteligente se houver termo de busca
        let filteredProducts = products;
        if (search) {
          filteredProducts = performIntelligentSearch(products, search, categories);
        }

        // Aplicar ordenação
        if (sort === 'price_asc') {
          filteredProducts.sort((a, b) => a.price - b.price);
        } else if (sort === 'price_desc') {
          filteredProducts.sort((a, b) => b.price - a.price);
        } else if (sort === 'rating') {
          filteredProducts.sort((a, b) => (b.rating_avg || 0) - (a.rating_avg || 0));
        } else if (sort === 'newest') {
          filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }

        // Aplicar paginação
        const paginatedProducts = filteredProducts.slice(offset, offset + limit);

        res.json({
          products: paginatedProducts,
          total: filteredProducts.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// GET /products/:id - Detalhe do produto
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const db = await getDB();

    db.get(
      `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id],
      (err, product) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao buscar produto' });
        }

        if (!product) {
          return res.status(404).json({ error: 'Produto não encontrado' });
        }

        res.json({ product });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// GET /products/:id/reviews - Avaliações do produto
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params;

    const db = await getDB();

    db.all(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [id],
      (err, reviews) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao buscar avaliações' });
        }

        res.json({ reviews });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

export default router;
