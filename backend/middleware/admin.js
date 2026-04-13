import { authMiddleware } from './auth.js';
import { getDB } from '../db/init.js';

export const adminMiddleware = async (req, res, next) => {
  try {
    const db = await getDB();
    db.get('SELECT role FROM users WHERE id = ?', [req.userId], (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao verificar permissões' });
      }
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
      }
      next();
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao verificar permissões' });
  }
};

// Combinação: auth + admin
export const authAndAdmin = [authMiddleware, adminMiddleware];
