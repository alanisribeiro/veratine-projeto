import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB } from './db/init.js';
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import reviewsRoutes from './routes/reviews.js';
import favoritesRoutes from './routes/favorites.js';
import ordersRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import couponsRoutes from './routes/coupons.js';
import uploadRoutes from './routes/upload.js';
import paymentsRoutes from './routes/payments.js';
import sheetsRoutes from './routes/sheets.js';
import { cleanupExpiredOrders } from './utils/stockHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Inicializar banco de dados
await initDB().catch((err) => {
  console.error('Erro ao inicializar banco de dados:', err);
  process.exit(1);
});

// Middlewares
const allowedOrigins = [
  'http://localhost:3000',
  'https://dist-seven-delta-48.vercel.app'
];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Servir arquivos de upload
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Bem-vindo ao Backend First Site! 🚀',
    status: 'Servidor rodando',
    endpoints: {
      test: '/api/test',
      health: '/health'
    }
  });
});

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor rodando perfeitamente! ✅' });
});

// Rota para healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Rotas de autenticação
app.use('/auth', authRoutes);

// Rotas de API
app.use('/products', productsRoutes);
app.use('/reviews', reviewsRoutes);
app.use('/favorites', favoritesRoutes);
app.use('/orders', ordersRoutes);
app.use('/admin', adminRoutes);
app.use('/coupons', couponsRoutes);
app.use('/upload', uploadRoutes);
app.use('/payments', paymentsRoutes);
app.use('/sheets', sheetsRoutes);

// Cleanup expired pending orders every 10 minutes
setInterval(() => {
  cleanupExpiredOrders().catch(e => console.error('Cleanup error:', e));
}, 10 * 60 * 1000);

// Run cleanup on startup
cleanupExpiredOrders()
  .then(n => n > 0 && console.log(`🧹 ${n} pedido(s) expirado(s) limpo(s) no startup`))
  .catch(e => console.error('Startup cleanup error:', e));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
