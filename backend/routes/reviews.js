import express from 'express';
import { getDB } from '../db/init.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /reviews - Criar avaliação
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.userId;

    if (!productId || !rating) {
      return res.status(400).json({ error: 'Produto e rating são obrigatórios' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating deve ser entre 1 e 5' });
    }

    const db = await getDB();

    db.run(
      'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [productId, userId, rating, comment || null],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Erro ao criar avaliação' });
        }

        res.status(201).json({
          message: 'Avaliação criada com sucesso',
          review: { id: this.lastID, productId, rating, comment }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// DELETE /reviews/:id - Deletar avaliação
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const db = await getDB();

    db.get('SELECT * FROM reviews WHERE id = ?', [id], (err, review) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao buscar avaliação' });
      }

      if (!review) {
        return res.status(404).json({ error: 'Avaliação não encontrada' });
      }

      if (review.user_id !== userId) {
        return res.status(403).json({ error: 'Você não pode deletar essa avaliação' });
      }

      db.run('DELETE FROM reviews WHERE id = ?', [id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Erro ao deletar avaliação' });
        }

        res.json({ message: 'Avaliação deletada com sucesso' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

export default router;
