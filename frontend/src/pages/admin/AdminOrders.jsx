import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { adminAPI } from '../../api/api';
import '../../styles/admin/AdminTable.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, [page, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const res = await adminAPI.getOrders(params);
      setOrders(res.data.orders);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (err) {
      alert('Erro ao atualizar status');
    }
  };

  const statusLabels = {
    pending: 'Pendente',
    paid: 'Pago',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado'
  };

  const tabs = [
    { value: '', label: 'Todos' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'paid', label: 'Pagos' },
    { value: 'shipped', label: 'Enviados' },
    { value: 'delivered', label: 'Entregues' },
    { value: 'cancelled', label: 'Cancelados' },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Pedidos ({total})</h2>
      </div>

      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={`admin-tab ${statusFilter === tab.value ? 'active' : ''}`}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? <div className="admin-loading">Carregando...</div> : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Itens</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="7" className="empty-cell">Nenhum pedido encontrado</td></tr>
                ) : orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>
                      <div>{o.customer_name || 'N/A'}</div>
                      <small className="text-muted">{o.customer_email}</small>
                    </td>
                    <td>{o.item_count}</td>
                    <td>
                      R$ {(o.total_price || 0).toFixed(2)}
                      {o.discount_amount > 0 && <small className="discount-info"> (-R$ {o.discount_amount.toFixed(2)})</small>}
                    </td>
                    <td><span className={`status-badge ${o.status}`}>{statusLabels[o.status]}</span></td>
                    <td>{new Date(o.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="actions-cell">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        className="status-select"
                      >
                        {Object.entries(statusLabels).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                      <button className="admin-btn small" onClick={() => navigate(`/admin/orders/${o.id}`)}>Ver</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</button>
              <span>Pagina {page} de {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Proxima</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminOrders;
