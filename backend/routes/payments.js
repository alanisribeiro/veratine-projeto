import express from 'express';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { v4 as uuidv4 } from 'uuid';
import { getDB } from '../db/init.js';
import { authMiddleware } from '../middleware/auth.js';
import { releaseOrderStock } from '../utils/stockHelper.js';
import { sendOrderStatusEmail } from '../utils/emailService.js';

const router = express.Router();

// Initialize Mercado Pago client
const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
let paymentClient = null;

if (mpAccessToken) {
  const client = new MercadoPagoConfig({ accessToken: mpAccessToken });
  paymentClient = new Payment(client);
  console.log('✅ Mercado Pago configurado');
} else {
  console.log('⚠️  MERCADOPAGO_ACCESS_TOKEN não configurado - pagamentos em modo simulação');
}

// Helper: update order payment info
const updateOrderPayment = (db, orderId, fields) => {
  const sets = Object.keys(fields).map(k => `${k} = ?`).join(', ');
  const values = Object.values(fields);
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE orders SET ${sets}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, orderId],
      (err) => err ? reject(err) : resolve()
    );
  });
};

// Helper: get order by id
const getOrder = (db, orderId) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
      err ? reject(err) : resolve(row);
    });
  });
};

// Helper: get user by id
const getUser = (db, userId) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, name, email FROM users WHERE id = ?', [userId], (err, row) => {
      err ? reject(err) : resolve(row);
    });
  });
};

// ============================================
// POST /payments/process - Process payment
// ============================================
router.post('/process', authMiddleware, async (req, res) => {
  try {
    const { orderId, payment_method } = req.body;
    const userId = req.userId;
    const db = await getDB();

    // Validate order belongs to user
    const order = await getOrder(db, orderId);
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
    if (order.user_id !== userId) return res.status(403).json({ error: 'Acesso negado' });
    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Este pedido já foi processado' });
    }

    const user = await getUser(db, userId);

    // ---- SIMULATION MODE (no MP credentials) ----
    if (!paymentClient) {
      const simulatedPaymentId = `SIM-${Date.now()}`;

      if (payment_method === 'pix') {
        await updateOrderPayment(db, orderId, {
          payment_method: 'pix',
          payment_id: simulatedPaymentId,
          payment_status: 'pending',
          pix_qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          pix_qr_code_text: '00020126580014br.gov.bcb.pix0136sim-veratine-pix-' + orderId,
          pix_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        });

        return res.json({
          status: 'pending',
          payment_method: 'pix',
          payment_id: simulatedPaymentId,
          pix_qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          pix_qr_code_text: '00020126580014br.gov.bcb.pix0136sim-veratine-pix-' + orderId,
          pix_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          mode: 'simulation',
        });
      }

      // Credit card simulation - auto-approve
      await updateOrderPayment(db, orderId, {
        payment_method: 'credit_card',
        payment_id: simulatedPaymentId,
        payment_status: 'approved',
        installments: req.body.installments || 1,
        stock_reserved: 0,
      });
      await new Promise((resolve, reject) => {
        db.run("UPDATE orders SET status = 'paid', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [orderId], (err) => err ? reject(err) : resolve());
      });

      // Send confirmation email
      if (user) {
        sendOrderStatusEmail(user.email, user.name, orderId, 'paid', order.total_price)
          .catch(e => console.error('Email error:', e));
      }

      return res.json({
        status: 'approved',
        payment_method: 'credit_card',
        payment_id: simulatedPaymentId,
        installments: req.body.installments || 1,
        mode: 'simulation',
      });
    }

    // ---- MERCADO PAGO REAL MODE ----
    if (payment_method === 'pix') {
      const result = await paymentClient.create({
        body: {
          transaction_amount: order.total_price,
          description: `Veratine - Pedido #${orderId}`,
          payment_method_id: 'pix',
          payer: {
            email: user.email,
            first_name: user.name.split(' ')[0],
            last_name: user.name.split(' ').slice(1).join(' ') || user.name,
          },
          external_reference: String(orderId),
          notification_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/payments/webhook`,
        },
        requestOptions: { idempotencyKey: uuidv4() },
      });

      const txData = result.point_of_interaction?.transaction_data;

      await updateOrderPayment(db, orderId, {
        payment_method: 'pix',
        payment_id: String(result.id),
        payment_status: result.status,
        payment_detail: JSON.stringify({ id: result.id, status: result.status }),
        pix_qr_code: txData?.qr_code_base64 ? `data:image/png;base64,${txData.qr_code_base64}` : null,
        pix_qr_code_text: txData?.qr_code || null,
        pix_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      });

      return res.json({
        status: result.status,
        payment_method: 'pix',
        payment_id: result.id,
        pix_qr_code: txData?.qr_code_base64 ? `data:image/png;base64,${txData.qr_code_base64}` : null,
        pix_qr_code_text: txData?.qr_code || null,
        pix_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      });
    }

    // Credit card
    if (payment_method === 'credit_card') {
      const { token, payment_method_id, installments, issuer_id, identificationType, identificationNumber } = req.body;

      if (!token) return res.status(400).json({ error: 'Token do cartão é obrigatório' });

      const result = await paymentClient.create({
        body: {
          transaction_amount: order.total_price,
          token,
          description: `Veratine - Pedido #${orderId}`,
          installments: installments || 1,
          payment_method_id,
          issuer_id,
          payer: {
            email: user.email,
            identification: {
              type: identificationType || 'CPF',
              number: identificationNumber,
            },
          },
          external_reference: String(orderId),
          notification_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/payments/webhook`,
        },
        requestOptions: { idempotencyKey: uuidv4() },
      });

      const updates = {
        payment_method: 'credit_card',
        payment_id: String(result.id),
        payment_status: result.status,
        payment_detail: JSON.stringify({ id: result.id, status: result.status, status_detail: result.status_detail }),
        installments: installments || 1,
      };

      if (result.status === 'approved') {
        updates.stock_reserved = 0;
        await new Promise((resolve, reject) => {
          db.run("UPDATE orders SET status = 'paid', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [orderId], (err) => err ? reject(err) : resolve());
        });
        if (user) {
          sendOrderStatusEmail(user.email, user.name, orderId, 'paid', order.total_price)
            .catch(e => console.error('Email error:', e));
        }
      } else if (result.status === 'rejected') {
        await releaseOrderStock(orderId);
        await new Promise((resolve, reject) => {
          db.run("UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [orderId], (err) => err ? reject(err) : resolve());
        });
      }

      await updateOrderPayment(db, orderId, updates);

      return res.json({
        status: result.status,
        status_detail: result.status_detail,
        payment_method: 'credit_card',
        payment_id: result.id,
        installments: installments || 1,
      });
    }

    return res.status(400).json({ error: 'Método de pagamento inválido' });
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
});

// ============================================
// POST /payments/webhook - MP webhook
// ============================================
router.post('/webhook', async (req, res) => {
  // Always respond 200 immediately
  res.sendStatus(200);

  try {
    const { action, data, type } = req.body;

    // MP sends notifications for payment.created and payment.updated
    if ((type === 'payment' || action === 'payment.updated' || action === 'payment.created') && data?.id) {
      if (!paymentClient) {
        console.log('Webhook recebido (modo simulação), payment_id:', data.id);
        return;
      }

      const payment = await paymentClient.get({ id: data.id });
      const orderId = parseInt(payment.external_reference);
      if (!orderId) return;

      const db = await getDB();
      const order = await getOrder(db, orderId);
      if (!order) return;

      // Validate amount matches
      if (Math.abs(payment.transaction_amount - order.total_price) > 0.01) {
        console.error(`⚠️ Webhook: valor divergente! Pedido #${orderId}: esperado ${order.total_price}, recebido ${payment.transaction_amount}`);
        return;
      }

      await updateOrderPayment(db, orderId, {
        payment_status: payment.status,
        payment_detail: JSON.stringify({ id: payment.id, status: payment.status, status_detail: payment.status_detail }),
      });

      if (payment.status === 'approved' && order.status === 'pending') {
        await new Promise((resolve, reject) => {
          db.run("UPDATE orders SET status = 'paid', stock_reserved = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [orderId], (err) => err ? reject(err) : resolve());
        });

        // Send payment confirmation email
        const user = await getUser(db, order.user_id);
        if (user) {
          sendOrderStatusEmail(user.email, user.name, orderId, 'paid', order.total_price)
            .catch(e => console.error('Email error:', e));
        }
        console.log(`✅ Pedido #${orderId} pago via webhook`);
      } else if (['rejected', 'cancelled', 'refunded'].includes(payment.status)) {
        if (order.stock_reserved === 1) {
          await releaseOrderStock(orderId);
        }
        await new Promise((resolve, reject) => {
          db.run("UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [orderId], (err) => err ? reject(err) : resolve());
        });
        console.log(`❌ Pedido #${orderId} cancelado via webhook (${payment.status})`);
      }
    }
  } catch (error) {
    console.error('Erro no webhook:', error);
  }
});

// ============================================
// GET /payments/:orderId/status - Check payment status
// ============================================
router.get('/:orderId/status', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;
    const db = await getDB();

    const order = await getOrder(db, orderId);
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
    if (order.user_id !== userId) return res.status(403).json({ error: 'Acesso negado' });

    res.json({
      status: order.status,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      pix_qr_code: order.pix_qr_code,
      pix_qr_code_text: order.pix_qr_code_text,
      pix_expiration: order.pix_expiration,
    });
  } catch (error) {
    console.error('Erro ao consultar status:', error);
    res.status(500).json({ error: 'Erro ao consultar status do pagamento' });
  }
});

// ============================================
// POST /payments/simulate-approve/:orderId - DEV ONLY
// Simulates PIX payment approval for testing
// ============================================
router.post('/simulate-approve/:orderId', authMiddleware, async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Indisponível em produção' });
  }

  try {
    const { orderId } = req.params;
    const db = await getDB();
    const order = await getOrder(db, orderId);

    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
    if (order.status !== 'pending') return res.status(400).json({ error: 'Pedido não está pendente' });

    await updateOrderPayment(db, orderId, {
      payment_status: 'approved',
      stock_reserved: 0,
    });

    await new Promise((resolve, reject) => {
      db.run("UPDATE orders SET status = 'paid', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [orderId], (err) => err ? reject(err) : resolve());
    });

    const user = await getUser(db, order.user_id);
    if (user) {
      sendOrderStatusEmail(user.email, user.name, orderId, 'paid', order.total_price)
        .catch(e => console.error('Email error:', e));
    }

    console.log(`✅ [SIMULAÇÃO] Pedido #${orderId} aprovado`);
    res.json({ status: 'approved', message: 'Pagamento simulado como aprovado' });
  } catch (error) {
    console.error('Erro na simulação:', error);
    res.status(500).json({ error: 'Erro na simulação' });
  }
});

export default router;
