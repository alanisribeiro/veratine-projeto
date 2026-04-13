import express from 'express';
import { getDB } from '../db/init.js';
import { authMiddleware } from '../middleware/auth.js';
import { authAndAdmin } from '../middleware/admin.js';

const router = express.Router();

// ============ ADMIN ENDPOINTS ============

router.get('/admin', authAndAdmin, async (req, res) => {
  try {
    const db = await getDB();
    db.all('SELECT * FROM coupons ORDER BY created_at DESC', [], (err, coupons) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar cupons' });
      res.json({ coupons: coupons || [] });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

router.post('/admin', authAndAdmin, async (req, res) => {
  try {
    const { code, type, value, min_order_value, max_discount, usage_limit, category_id, product_id, expires_at } = req.body;
    if (!code || !type || !value) {
      return res.status(400).json({ error: 'Código, tipo e valor são obrigatórios' });
    }
    if (!['percentage', 'fixed'].includes(type)) {
      return res.status(400).json({ error: 'Tipo deve ser percentage ou fixed' });
    }

    const db = await getDB();
    db.run(
      `INSERT INTO coupons (code, type, value, min_order_value, max_discount, usage_limit, category_id, product_id, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code.toUpperCase(), type, value, min_order_value || 0, max_discount || null, usage_limit || null, category_id || null, product_id || null, expires_at || null],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Código de cupom já existe' });
          return res.status(500).json({ error: 'Erro ao criar cupom' });
        }
        res.status(201).json({ message: 'Cupom criado', coupon: { id: this.lastID, code: code.toUpperCase() } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

router.put('/admin/:id', authAndAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { code, type, value, min_order_value, max_discount, usage_limit, category_id, product_id, active, expires_at } = req.body;
    const db = await getDB();

    db.run(
      `UPDATE coupons SET code = ?, type = ?, value = ?, min_order_value = ?, max_discount = ?,
       usage_limit = ?, category_id = ?, product_id = ?, active = ?, expires_at = ? WHERE id = ?`,
      [code?.toUpperCase(), type, value, min_order_value, max_discount, usage_limit, category_id, product_id, active, expires_at, id],
      function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar cupom' });
        if (this.changes === 0) return res.status(404).json({ error: 'Cupom não encontrado' });
        res.json({ message: 'Cupom atualizado' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

router.delete('/admin/:id', authAndAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();
    db.run('DELETE FROM coupons WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao excluir cupom' });
      if (this.changes === 0) return res.status(404).json({ error: 'Cupom não encontrado' });
      res.json({ message: 'Cupom excluído' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// ============ PUBLIC ENDPOINT ============

router.post('/validate', authMiddleware, async (req, res) => {
  try {
    const { code, totalPrice } = req.body;
    if (!code) return res.status(400).json({ error: 'Código do cupom é obrigatório' });

    const db = await getDB();
    db.get('SELECT * FROM coupons WHERE code = ? AND active = 1', [code.toUpperCase()], (err, coupon) => {
      if (err) return res.status(500).json({ error: 'Erro ao validar cupom' });
      if (!coupon) return res.status(404).json({ error: 'Cupom não encontrado ou inativo' });

      // Verificar expiração
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        return res.status(400).json({ error: 'Cupom expirado' });
      }

      // Verificar limite de uso
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        return res.status(400).json({ error: 'Cupom atingiu o limite de uso' });
      }

      // Verificar valor mínimo
      if (totalPrice < coupon.min_order_value) {
        return res.status(400).json({
          error: `Valor mínimo do pedido: R$ ${coupon.min_order_value.toFixed(2)}`
        });
      }

      // Calcular desconto
      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = totalPrice * (coupon.value / 100);
        if (coupon.max_discount && discount > coupon.max_discount) {
          discount = coupon.max_discount;
        }
      } else {
        discount = coupon.value;
      }

      discount = Math.min(discount, totalPrice);

      res.json({
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          discount: parseFloat(discount.toFixed(2))
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

export default router;
