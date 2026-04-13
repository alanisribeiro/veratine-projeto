import express from 'express';
import { getDB } from '../db/init.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /favorites - Listar favoritos do usuário
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const db = await getDB();

    db.all(
      `SELECT p.id, p.name, p.price, p.image, p.rating_avg, p.category_id
       FROM products p
       JOIN favorites f ON p.id = f.product_id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId],
      (err, favorites) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao buscar favoritos' });
        }

        res.json({ favorites });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// POST /favorites/:productId - Adicionar favorito
router.post('/:productId', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userId;

    const db = await getDB();

    db.run(
      'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)',
      [userId, productId],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Produto já está nos favoritos' });
          }
          return res.status(500).json({ error: 'Erro ao adicionar favorito' });
        }

        res.status(201).json({ message: 'Produto adicionado aos favoritos' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// DELETE /favorites/:productId - Remover favorito
router.delete('/:productId', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.userId;

    const db = await getDB();

    db.run(
      'DELETE FROM favorites WHERE user_id = ? AND product_id = ?',
      [userId, productId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Erro ao remover favorito' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Favorito não encontrado' });
        }

        res.json({ message: 'Produto removido dos favoritos' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

export default router;
