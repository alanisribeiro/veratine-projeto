import express from 'express';
import { getDB } from '../db/init.js';
import { authAndAdmin } from '../middleware/admin.js';
import { sendOrderStatusEmail } from '../utils/emailService.js';

const router = express.Router();

// Aplicar auth + admin em todas as rotas
router.use(authAndAdmin);

// ============ DASHBOARD ============

router.get('/dashboard', async (req, res) => {
  try {
    const db = await getDB();
    const stats = {};

    const queries = [
      { key: 'totalOrders', sql: 'SELECT COUNT(*) as value FROM orders' },
      { key: 'totalRevenue', sql: "SELECT COALESCE(SUM(total_price - COALESCE(discount_amount, 0)), 0) as value FROM orders" },
      { key: 'totalProducts', sql: 'SELECT COUNT(*) as value FROM products' },
      { key: 'totalCustomers', sql: "SELECT COUNT(*) as value FROM users WHERE role = 'customer' OR role IS NULL" },
      { key: 'lowStockProducts', sql: 'SELECT COUNT(*) as value FROM products WHERE stock > 0 AND stock < 5' },
      { key: 'outOfStockProducts', sql: 'SELECT COUNT(*) as value FROM products WHERE stock = 0' },
      { key: 'pendingOrders', sql: "SELECT COUNT(*) as value FROM orders WHERE status = 'pending'" },
    ];

    let completed = 0;
    queries.forEach(({ key, sql }) => {
      db.get(sql, [], (err, row) => {
        stats[key] = err ? 0 : (row?.value || 0);
        completed++;
        if (completed === queries.length) {
          // Buscar pedidos recentes
          db.all(
            `SELECT o.id, o.total_price, o.status, o.created_at, o.discount_amount,
                    u.name as customer_name, u.email as customer_email
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.id
             ORDER BY o.created_at DESC LIMIT 10`,
            [],
            (err, recentOrders) => {
              // Buscar produtos com estoque baixo
              db.all(
                'SELECT id, name, stock, price FROM products WHERE stock < 5 ORDER BY stock ASC LIMIT 10',
                [],
                (err, lowStockItems) => {
                  res.json({
                    stats,
                    recentOrders: recentOrders || [],
                    lowStockItems: lowStockItems || []
                  });
                }
              );
            }
          );
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar dashboard' });
  }
});

// ============ ANALYTICS ============

const dbAll = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows || []));
});
const dbGet = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});

router.get('/analytics', async (req, res) => {
  try {
    const db = await getDB();
    const { period, startDate, endDate } = req.query;

    let start, end, periodLabel;
    const now = new Date();

    if (startDate && endDate) {
      start = startDate;
      end = endDate;
      periodLabel = `${startDate} a ${endDate}`;
    } else {
      const days = parseInt(period) || 30;
      const d = new Date(now);
      d.setDate(d.getDate() - days);
      start = d.toISOString().split('T')[0] + ' 00:00:00';
      end = now.toISOString().split('T')[0] + ' 23:59:59';
      periodLabel = `Últimos ${days} dias`;
    }

    const days = parseInt(period) || Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
    const groupBy = days > 90 ? "strftime('%Y-%m', o.created_at)" : "DATE(o.created_at)";

    // Revenue time series
    const revenueTimeSeries = await dbAll(db,
      `SELECT ${groupBy} as date,
              COALESCE(SUM(total_price - COALESCE(discount_amount, 0)), 0) as revenue,
              COUNT(*) as orders
       FROM orders o
       WHERE o.created_at >= ? AND o.created_at <= ? AND o.status != 'cancelled'
       GROUP BY ${groupBy}
       ORDER BY date ASC`,
      [start, end]
    );

    // Top products
    const topProducts = await dbAll(db,
      `SELECT p.name, SUM(oi.quantity) as quantity,
              COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN products p ON oi.product_id = p.id
       WHERE o.created_at >= ? AND o.created_at <= ? AND o.status != 'cancelled'
       GROUP BY oi.product_id
       ORDER BY quantity DESC
       LIMIT 10`,
      [start, end]
    );

    // Category breakdown
    const categoryBreakdown = await dbAll(db,
      `SELECT c.name,
              COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) as revenue,
              COUNT(DISTINCT o.id) as orderCount
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN products p ON oi.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       WHERE o.created_at >= ? AND o.created_at <= ? AND o.status != 'cancelled'
       GROUP BY c.id
       ORDER BY revenue DESC`,
      [start, end]
    );

    // Conversion rate
    const totalCustomersRow = await dbGet(db,
      `SELECT COUNT(*) as total FROM users WHERE (role = 'customer' OR role IS NULL) AND created_at >= ? AND created_at <= ?`,
      [start, end]
    );
    const buyingCustomersRow = await dbGet(db,
      `SELECT COUNT(DISTINCT user_id) as buyers FROM orders WHERE created_at >= ? AND created_at <= ? AND status != 'cancelled'`,
      [start, end]
    );
    const totalCustomers = totalCustomersRow?.total || 0;
    const buyingCustomers = buyingCustomersRow?.buyers || 0;

    // Average ticket
    const avgRow = await dbGet(db,
      `SELECT AVG(total_price - COALESCE(discount_amount, 0)) as avg_ticket
       FROM orders WHERE created_at >= ? AND created_at <= ? AND status != 'cancelled'`,
      [start, end]
    );

    // New vs returning customers
    const newCustomersRow = await dbGet(db,
      `SELECT COUNT(*) as cnt FROM (
         SELECT user_id, MIN(created_at) as first_order
         FROM orders GROUP BY user_id
         HAVING first_order >= ? AND first_order <= ?
       )`,
      [start, end]
    );
    const returningCustomersRow = await dbGet(db,
      `SELECT COUNT(DISTINCT o.user_id) as cnt
       FROM orders o
       WHERE o.created_at >= ? AND o.created_at <= ? AND o.status != 'cancelled'
       AND o.user_id IN (SELECT user_id FROM orders WHERE created_at < ?)`,
      [start, end, start]
    );

    // Summary
    const summaryRow = await dbGet(db,
      `SELECT COALESCE(SUM(total_price - COALESCE(discount_amount, 0)), 0) as totalRevenue,
              COUNT(*) as totalOrders
       FROM orders WHERE created_at >= ? AND created_at <= ? AND status != 'cancelled'`,
      [start, end]
    );

    res.json({
      revenueTimeSeries,
      topProducts,
      categoryBreakdown,
      conversionRate: {
        totalCustomers,
        buyingCustomers,
        rate: totalCustomers > 0 ? Math.round((buyingCustomers / totalCustomers) * 1000) / 10 : 0
      },
      averageTicket: Math.round((avgRow?.avg_ticket || 0) * 100) / 100,
      customerSegmentation: {
        newCustomers: newCustomersRow?.cnt || 0,
        returningCustomers: returningCustomersRow?.cnt || 0
      },
      summary: {
        totalRevenue: summaryRow?.totalRevenue || 0,
        totalOrders: summaryRow?.totalOrders || 0,
        periodLabel
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Erro ao carregar analytics' });
  }
});

// ============ PRODUCTS CRUD ============

router.get('/products', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const db = await getDB();

    let where = '1=1';
    const params = [];

    if (search) {
      where += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      where += ' AND p.category_id = ?';
      params.push(category);
    }

    db.get(`SELECT COUNT(*) as total FROM products p WHERE ${where}`, params, (err, countRow) => {
      const total = countRow?.total || 0;
      db.all(
        `SELECT p.*, c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE ${where}
         ORDER BY p.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), parseInt(offset)],
        (err, products) => {
          if (err) return res.status(500).json({ error: 'Erro ao buscar produtos' });
          res.json({ products: products || [], total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

router.post('/products', async (req, res) => {
  try {
    const { name, description, price, category_id, image, stock, rating_avg } = req.body;
    if (!name || !price || !category_id) {
      return res.status(400).json({ error: 'Nome, preço e categoria são obrigatórios' });
    }
    const db = await getDB();
    db.run(
      'INSERT INTO products (name, description, price, category_id, image, stock, rating_avg) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description || '', price, category_id, image || '', stock || 0, rating_avg || 0],
      function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao criar produto' });
        res.status(201).json({ message: 'Produto criado', product: { id: this.lastID, name, price, category_id, stock: stock || 0 } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category_id, image, stock, rating_avg } = req.body;
    const db = await getDB();

    db.run(
      `UPDATE products SET name = ?, description = ?, price = ?, category_id = ?, image = ?, stock = ?, rating_avg = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [name, description, price, category_id, image, stock, rating_avg, id],
      function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar produto' });
        if (this.changes === 0) return res.status(404).json({ error: 'Produto não encontrado' });
        res.json({ message: 'Produto atualizado' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();
    db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao excluir produto' });
      if (this.changes === 0) return res.status(404).json({ error: 'Produto não encontrado' });
      res.json({ message: 'Produto excluído' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// ============ ORDERS ============

router.get('/orders', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const db = await getDB();

    let where = '1=1';
    const params = [];
    if (status) {
      where += ' AND o.status = ?';
      params.push(status);
    }

    db.get(`SELECT COUNT(*) as total FROM orders o WHERE ${where}`, params, (err, countRow) => {
      const total = countRow?.total || 0;
      db.all(
        `SELECT o.*, u.name as customer_name, u.email as customer_email,
                (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         WHERE ${where}
         ORDER BY o.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), parseInt(offset)],
        (err, orders) => {
          if (err) return res.status(500).json({ error: 'Erro ao buscar pedidos' });
          res.json({ orders: orders || [], total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();

    db.get(
      `SELECT o.*, u.name as customer_name, u.email as customer_email
       FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?`,
      [id],
      (err, order) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar pedido' });
        if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });

        db.all(
          `SELECT oi.*, p.name as product_name, p.image as product_image
           FROM order_items oi JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = ?`,
          [id],
          (err, items) => {
            res.json({ order: { ...order, items: items || [] } });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const db = await getDB();
    db.run(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id],
      function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar status' });
        if (this.changes === 0) return res.status(404).json({ error: 'Pedido não encontrado' });

        // Send status update email (non-blocking)
        db.get(
          `SELECT o.total_price, u.name, u.email
           FROM orders o JOIN users u ON o.user_id = u.id
           WHERE o.id = ?`,
          [id],
          (err, row) => {
            if (!err && row?.email) {
              sendOrderStatusEmail(row.email, row.name, id, status, row.total_price)
                .catch(e => console.error('Failed to send status email:', e));
            }
          }
        );

        res.json({ message: 'Status atualizado', status });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// ============ CUSTOMERS ============

router.get('/customers', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const db = await getDB();

    let where = "(u.role = 'customer' OR u.role IS NULL)";
    const params = [];
    if (search) {
      where += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    db.get(`SELECT COUNT(*) as total FROM users u WHERE ${where}`, params, (err, countRow) => {
      const total = countRow?.total || 0;
      db.all(
        `SELECT u.id, u.name, u.email, u.avatar, u.created_at,
                (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count,
                (SELECT COALESCE(SUM(total_price), 0) FROM orders WHERE user_id = u.id) as total_spent
         FROM users u
         WHERE ${where}
         ORDER BY u.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), parseInt(offset)],
        (err, customers) => {
          if (err) return res.status(500).json({ error: 'Erro ao buscar clientes' });
          res.json({ customers: customers || [], total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// ============ CATEGORIES ============

router.get('/categories', async (req, res) => {
  try {
    const db = await getDB();
    db.all(
      `SELECT c.*, (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
       FROM categories c ORDER BY c.name`,
      [],
      (err, categories) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar categorias' });
        res.json({ categories: categories || [] });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
    const db = await getDB();
    db.run('INSERT INTO categories (name, description, icon) VALUES (?, ?, ?)', [name, description || '', icon || ''], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Categoria já existe' });
        return res.status(500).json({ error: 'Erro ao criar categoria' });
      }
      res.status(201).json({ message: 'Categoria criada', category: { id: this.lastID, name } });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon } = req.body;
    const db = await getDB();
    db.run('UPDATE categories SET name = ?, description = ?, icon = ? WHERE id = ?', [name, description, icon, id], function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar categoria' });
      if (this.changes === 0) return res.status(404).json({ error: 'Categoria não encontrada' });
      res.json({ message: 'Categoria atualizada' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();
    db.get('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id], (err, row) => {
      if (row?.count > 0) {
        return res.status(400).json({ error: 'Não é possível excluir categoria com produtos vinculados' });
      }
      db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao excluir categoria' });
        if (this.changes === 0) return res.status(404).json({ error: 'Categoria não encontrada' });
        res.json({ message: 'Categoria excluída' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

export default router;
