import axios from 'axios';

// Em produção no Vercel, usa proxy /api-proxy para evitar CORS
// Em desenvolvimento, aponta direto para o backend local
const isProduction = import.meta.env.PROD;
const API_BASE_URL = isProduction ? '/api-proxy' : (import.meta.env.VITE_API_URL || 'http://localhost:5000');
const DIRECT_BACKEND_URL = 'https://veratine.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Warm-up: acordar o servidor assim que o site carrega
let serverReady = false;
const wakeUpServer = () => {
  if (serverReady) return;
  // Sempre pinga direto no Render para acordar o servidor
  fetch(`${DIRECT_BACKEND_URL}/health`, { mode: 'no-cors' })
    .then(() => { serverReady = true; })
    .catch(() => {});
};
wakeUpServer();

// Retry automático para erros de rede (cold start do Render)
api.interceptors.response.use(
  (response) => {
    serverReady = true;
    return response;
  },
  async (error) => {
    const config = error.config;
    const retryCount = config._retryCount || 0;
    const maxRetries = 3;

    if (retryCount < maxRetries && !error.response) {
      config._retryCount = retryCount + 1;
      const delay = (retryCount + 1) * 5000;
      await new Promise(r => setTimeout(r, delay));
      return api(config);
    }

    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(currentPath);

      if (!isAuthPage) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (name, email, password, confirmPassword) =>
    api.post('/auth/register', { name, email, password, confirmPassword }),

  login: (email, password) =>
    api.post('/auth/login', { email, password }),

  googleLogin: (token) =>
    api.post('/auth/google-login', { token }),

  logout: () =>
    api.post('/auth/logout'),

  getMe: () =>
    api.get('/auth/me'),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token, password, confirmPassword) =>
    api.post('/auth/reset-password', { token, password, confirmPassword }),

  updateProfile: (name, avatar) =>
    api.put('/auth/update-profile', { name, avatar }),

  changePassword: (currentPassword, newPassword, confirmNewPassword) =>
    api.post('/auth/change-password', { currentPassword, newPassword, confirmNewPassword })
};

export const productsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    return api.get(`/products?${params.toString()}`);
  },

  getById: (id) =>
    api.get(`/products/${id}`),

  getReviews: (productId) =>
    api.get(`/products/${productId}/reviews`)
};

export const reviewsAPI = {
  create: (productId, rating, comment) =>
    api.post('/reviews', { productId, rating, comment }),

  delete: (reviewId) =>
    api.delete(`/reviews/${reviewId}`)
};

export const favoritesAPI = {
  getAll: () =>
    api.get('/favorites'),

  add: (productId) =>
    api.post(`/favorites/${productId}`),

  remove: (productId) =>
    api.delete(`/favorites/${productId}`)
};

export const ordersAPI = {
  create: (items, totalPrice, couponCode) =>
    api.post('/orders', { items, totalPrice, couponCode }),

  getAll: () =>
    api.get('/orders'),

  getById: (orderId) =>
    api.get(`/orders/${orderId}`),

  track: (orderId) =>
    api.get(`/orders/${orderId}/track`)
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getProducts: (params) => api.get('/admin/products', { params }),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  getOrders: (params) => api.get('/admin/orders', { params }),
  getOrder: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  getCustomers: (params) => api.get('/admin/customers', { params }),
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  getCoupons: () => api.get('/coupons/admin'),
  createCoupon: (data) => api.post('/coupons/admin', data),
  updateCoupon: (id, data) => api.put(`/coupons/admin/${id}`, data),
  deleteCoupon: (id) => api.delete(`/coupons/admin/${id}`),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getSheetsStatus: () => api.get('/sheets/status'),
  updateSheetsConfig: (data) => api.put('/sheets/config', data),
  syncSheets: () => api.post('/sheets/sync'),
};

export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

export const couponsAPI = {
  validate: (code, totalPrice) =>
    api.post('/coupons/validate', { code, totalPrice }),
};

export const paymentsAPI = {
  process: (data) => api.post('/payments/process', data),
  getStatus: (orderId) => api.get(`/payments/${orderId}/status`),
  simulateApprove: (orderId) => api.post(`/payments/simulate-approve/${orderId}`),
};

export default api;
