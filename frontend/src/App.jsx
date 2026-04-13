import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider, useAppContext } from './context/AppContext';

import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Favorites from './pages/Favorites';
import Cart from './pages/Cart';
import AllFlowers from './pages/AllFlowers';
import SearchResults from './pages/SearchResults';
import CategoryPage from './pages/CategoryPage';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Account from './pages/Account';
import FlowerDetail from './pages/FlowerDetail';
import Checkout from './pages/Checkout';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOrderDetail from './pages/admin/AdminOrderDetail';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminGoogleSheets from './pages/admin/AdminGoogleSheets';

import './App.css';

const ProtectedRoute = ({ children }) => {
  const { token, isGuest, authLoading } = useAppContext();

  if (authLoading) {
    return null;
  }

  if (!token && !isGuest) {
    return <Navigate to="/welcome" />;
  }

  return children;
};

const ConditionalFooter = () => {
  const location = useLocation();
  const hideFooterRoutes = ['/welcome', '/login', '/signup', '/forgot-password', '/reset-password', '/favorites', '/cart', '/checkout', '/all-flowers', '/search', '/account'];
  const hideFooterPrefixes = ['/category/', '/flower/', '/admin'];

  const shouldHide = hideFooterRoutes.includes(location.pathname) ||
    hideFooterPrefixes.some(prefix => location.pathname.startsWith(prefix));

  if (shouldHide) {
    return null;
  }

  return <Footer />;
};

function AppContent() {
  const { token, isGuest } = useAppContext();

  return (
    <Router>
      <Routes>
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/all-flowers" element={<ProtectedRoute><AllFlowers /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
        <Route path="/category/:id" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
        <Route path="/shop" element={<Navigate to="/" />} />
        <Route path="/filter" element={<Navigate to="/" />} />
        <Route path="/flower/:slug" element={<ProtectedRoute><FlowerDetail /></ProtectedRoute>} />
        <Route path="/product/:id" element={<ProtectedRoute><FlowerDetail /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<AdminOrderDetail />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="google-sheets" element={<AdminGoogleSheets />} />
        </Route>
        <Route path="/orders" element={<Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ConditionalFooter />
    </Router>
  );
}

function App() {
  const GOOGLE_CLIENT_ID = '285803763173-fc3lqb4e2ev7kld0nao3571cenfje407.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
