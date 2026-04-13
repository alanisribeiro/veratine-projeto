import express from 'express';
import { getDB } from '../db/init.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendOrderConfirmationEmail } from '../utils/emailService.js';

const router = express.Router();

// POST /orders - Criar pedido
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, totalPrice } = req.body;
    const userId = req.userId;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }

    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).json({ error: 'Preço total inválido' });
    }

    const db = await getDB();

    // Verificar estoque de todos os itens antes de criar o pedido
    const stockChecks = await new Promise((resolve, reject) => {
      let checked = 0;
      const outOfStock = [];

      items.forEach((item) => {
        db.get('SELECT id, name, stock FROM products WHERE id = ?', [item.productId], (err, product) => {
          checked++;
          if (err || !product) {
            outOfStock.push({ productId: item.productId, reason: 'Produto não encontrado' });
          } else if (product.stock < item.quantity) {
            outOfStock.push({
              productId: item.productId,
              name: product.name,
              available: product.stock,
              requested: item.quantity
            });
          }
          if (checked === items.length) resolve(outOfStock);
        });
      });
    });

    if (stockChecks.length > 0) {
      const msgs = stockChecks.map(p =>
        p.available === 0
          ? `"${p.name}" está esgotado`
          : `"${p.name}" tem apenas ${p.available} unidade(s) disponível(eis)`
      );
      return res.status(400).json({ error: 'Estoque insuficiente', details: msgs });
    }

    // Criar pedido
    db.run(
      'INSERT INTO orders (user_id, total_price, status, stock_reserved) VALUES (?, ?, ?, ?)',
      [userId, totalPrice, 'pending', 1],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Erro ao criar pedido' });
        }

        const orderId = this.lastID;

        // Adicionar itens do pedido e decrementar estoque
        let itemCount = 0;
        items.forEach((item) => {
          db.run(
            'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)',
            [orderId, item.productId, item.quantity, item.price],
            (err) => {
              if (err) {
                console.error('Erro ao adicionar item:', err);
              }

              // Decrementar estoque do produto
              db.run(
                'UPDATE products SET stock = MAX(stock - ?, 0), updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [item.quantity, item.productId],
                (err) => {
                  if (err) console.error('Erro ao decrementar estoque:', err);
                }
              );

              itemCount++;

              if (itemCount === items.length) {
                // Send order confirmation email (non-blocking)
                db.get('SELECT name, email FROM users WHERE id = ?', [userId], (err, user) => {
                  if (!err && user) {
                    db.all(
                      `SELECT oi.quantity, oi.price_at_purchase, p.name as product_name
                       FROM order_items oi JOIN products p ON oi.product_id = p.id
                       WHERE oi.order_id = ?`,
                      [orderId],
                      (err, orderItems) => {
                        if (!err && orderItems) {
                          sendOrderConfirmationEmail(
                            user.email,
                            user.name,
                            { id: orderId, total_price: totalPrice },
                            orderItems
                          ).catch(e => console.error('Failed to send order email:', e));
                        }
                      }
                    );
                  }
                });

                res.status(201).json({
                  message: 'Pedido criado com sucesso',
                  order: { id: orderId, status: 'pending', totalPrice }
                });
              }
            }
          );
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// GET /orders - Listar pedidos do usuário
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    const db = await getDB();

    db.all(
      `SELECT id, total_price, status, created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId],
      (err, orders) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao buscar pedidos' });
        }

        res.json({ orders });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// GET /orders/:id - Detalhe do pedido
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const db = await getDB();

    db.get(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId],
      (err, order) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao buscar pedido' });
        }

        if (!order) {
          return res.status(404).json({ error: 'Pedido não encontrado' });
        }

        // Buscar itens do pedido
        db.all(
          `SELECT oi.id, oi.product_id, p.name, p.image, oi.quantity, oi.price_at_purchase
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [id],
          (err, items) => {
            if (err) {
              return res.status(500).json({ error: 'Erro ao buscar itens do pedido' });
            }

            res.json({ order: { ...order, items } });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// GET /orders/:id/track - Rastrear pedido
router.get('/:id/track', async (req, res) => {
  try {
    const { id } = req.params;

    const db = await getDB();

    db.get(
      'SELECT id, total_price, status, created_at, updated_at FROM orders WHERE id = ?',
      [id],
      (err, order) => {
        if (err) {
          return res.status(500).json({ error: 'Erro ao buscar pedido' });
        }

        if (!order) {
          return res.status(404).json({ error: 'Pedido não encontrado' });
        }

        // Simular timeline de rastreamento
        const timeline = {
          pending: { status: 'Pendente', date: order.created_at, completed: true },
          paid: { status: 'Pago', date: null, completed: order.status !== 'pending' },
          shipped: { status: 'Enviado', date: null, completed: ['shipped', 'delivered'].includes(order.status) },
          delivered: { status: 'Entregue', date: null, completed: order.status === 'delivered' }
        };

        res.json({
          order: {
            id: order.id,
            status: order.status,
            totalPrice: order.total_price,
            timeline
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

export default router;
