import { getDB } from '../db/init.js';

/**
 * Libera o estoque reservado de um pedido (restaura os itens ao estoque)
 */
export const releaseOrderStock = async (orderId) => {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    db.all('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [orderId], (err, items) => {
      if (err) return reject(err);
      if (!items || items.length === 0) return resolve();

      let done = 0;
      items.forEach(item => {
        db.run(
          'UPDATE products SET stock = stock + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [item.quantity, item.product_id],
          (err) => {
            if (err) console.error(`Erro ao restaurar estoque do produto ${item.product_id}:`, err);
            done++;
            if (done === items.length) {
              db.run(
                "UPDATE orders SET stock_reserved = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [orderId],
                (err) => err ? reject(err) : resolve()
              );
            }
          }
        );
      });
    });
  });
};

/**
 * Cancela pedidos pendentes expirados (>30min) e libera estoque
 */
export const cleanupExpiredOrders = async () => {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id FROM orders
       WHERE status = 'pending'
       AND stock_reserved = 1
       AND created_at < datetime('now', '-30 minutes')`,
      [],
      async (err, orders) => {
        if (err) return reject(err);
        if (!orders || orders.length === 0) return resolve(0);

        let released = 0;
        for (const order of orders) {
          try {
            await releaseOrderStock(order.id);
            await new Promise((res, rej) => {
              db.run(
                "UPDATE orders SET status = 'cancelled', payment_status = 'expired', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [order.id],
                (err) => err ? rej(err) : res()
              );
            });
            released++;
            console.log(`🧹 Pedido #${order.id} expirado - estoque liberado`);
          } catch (e) {
            console.error(`Erro ao limpar pedido #${order.id}:`, e);
          }
        }
        resolve(released);
      }
    );
  });
};
