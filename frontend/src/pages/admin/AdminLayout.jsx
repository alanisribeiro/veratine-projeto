import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import ThemeToggle from '../../components/ThemeToggle';
import '../../styles/admin/AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin', icon: '/images/admin/dashboard.png', label: 'Dashboard', end: true },
    { path: '/admin/products', icon: '/images/admin/flower.png', label: 'Produtos' },
    { path: '/admin/orders', icon: '/images/admin/pedidos.png', label: 'Pedidos' },
    { path: '/admin/customers', icon: '/images/admin/clients.png', label: 'Clientes' },
    { path: '/admin/categories', icon: '/images/admin/category.png', label: 'Categorias' },
    { path: '/admin/coupons', icon: '/images/admin/cupom.png', label: 'Cupons' },
    { path: '/admin/analytics', icon: '/images/admin/analytics.svg', label: 'Analytics' },
    { path: '/admin/google-sheets', icon: '/images/admin/analytics.svg', label: 'Google Sheets' },
  ];

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <h2>Veratine</h2>
          <span className="admin-badge">Admin</span>
          <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <img className="admin-nav-icon" src={item.icon} alt={item.label} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <span className="admin-user-name">{user?.name || 'Admin'}</span>
            <span className="admin-user-email">{user?.email}</span>
          </div>
          <button className="admin-nav-item" onClick={() => navigate('/')}>
            <img className="admin-nav-icon" src="/images/admin/home.png" alt="Home" />
            <span>Voltar ao Site</span>
          </button>
          <button className="admin-nav-item logout" onClick={handleLogout}>
            <img className="admin-nav-icon logout-icon" src="/images/admin/exit.png" alt="Sair" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <div className="admin-overlay" onClick={() => setSidebarOpen(false)} style={{ display: sidebarOpen ? 'block' : 'none' }} />

      <main className="admin-main">
        <header className="admin-header">
          <button className="admin-menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
          <h1 className="admin-header-title">Painel Administrativo</h1>
          <ThemeToggle />
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
