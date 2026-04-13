import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/api';
import '../../styles/admin/AdminDashboard.css';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await adminAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-loading">Carregando...</div>;
  if (!data) return <div className="admin-loading">Erro ao carregar dados</div>;

  const { stats, recentOrders, lowStockItems } = data;

  const statusLabels = {
    pending: 'Pendente',
    paid: 'Pago',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado'
  };

  return (
    <div className="admin-dashboard">
      <h2 className="admin-page-title">Dashboard</h2>

      <div className="dashboard-stats">
        <div className="stat-card" onClick={() => navigate('/admin/orders')}>
          <div className="stat-icon revenue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">R$ {(stats.totalRevenue || 0).toFixed(2)}</span>
            <span className="stat-label">Faturamento Total</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/admin/orders')}>
          <div className="stat-icon orders">
            <img src="/images/admin/pedidos.png" alt="Pedidos" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalOrders}</span>
            <span className="stat-label">Pedidos</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/admin/products')}>
          <div className="stat-icon products">
            <img src="/images/admin/flower.png" alt="Produtos" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalProducts}</span>
            <span className="stat-label">Produtos</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => navigate('/admin/customers')}>
          <div className="stat-icon customers">
            <img src="/images/admin/clients.png" alt="Clientes" />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalCustomers}</span>
            <span className="stat-label">Clientes</span>
          </div>
        </div>
      </div>

      {stats.pendingOrders > 0 && (
        <div className="dashboard-alert warning">
          <span>{stats.pendingOrders} pedido(s) pendente(s) aguardando processamento</span>
          <button onClick={() => navigate('/admin/orders?status=pending')}>Ver pedidos</button>
        </div>
      )}

      {(stats.lowStockProducts > 0 || stats.outOfStockProducts > 0) && (
        <div className="dashboard-alert danger">
          <span>{stats.outOfStockProducts} produto(s) sem estoque | {stats.lowStockProducts} com estoque baixo</span>
          <button onClick={() => navigate('/admin/products')}>Gerenciar</button>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h3>Pedidos Recentes</h3>
          {recentOrders.length === 0 ? (
            <p className="empty-text">Nenhum pedido ainda</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} onClick={() => navigate(`/admin/orders/${order.id}`)} className="clickable">
                    <td>{order.id}</td>
                    <td>{order.customer_name || 'N/A'}</td>
                    <td>R$ {(order.total_price || 0).toFixed(2)}</td>
                    <td><span className={`status-badge ${order.status}`}>{statusLabels[order.status]}</span></td>
                    <td>{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="dashboard-section">
          <h3>Estoque Baixo</h3>
          {lowStockItems.length === 0 ? (
            <p className="empty-text">Estoque saudavel</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Estoque</th>
                  <th>Preco</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td><span className={`stock-badge ${item.stock === 0 ? 'out' : 'low'}`}>{item.stock}</span></td>
                    <td>R$ {item.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
