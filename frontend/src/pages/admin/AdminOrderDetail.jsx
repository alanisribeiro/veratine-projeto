import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI } from '../../api/api';
import '../../styles/admin/AdminForm.css';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const res = await adminAPI.getOrder(id);
      setOrder(res.data.order);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await adminAPI.updateOrderStatus(id, newStatus);
      loadOrder();
    } catch (err) {
      alert('Erro ao atualizar status');
    }
  };

  const statusLabels = {
    pending: 'Pendente', paid: 'Pago', shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado'
  };

  if (loading) return <div className="admin-loading">Carregando...</div>;
  if (!order) return <div className="admin-loading">Pedido nao encontrado</div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Pedido #{order.id}</h2>
        <button className="admin-btn" onClick={() => navigate('/admin/orders')}>Voltar</button>
      </div>

      <div className="order-detail-grid">
        <div className="order-detail-card">
          <h3>Informacoes do Pedido</h3>
          <div className="detail-row">
            <span>Status:</span>
            <select value={order.status} onChange={(e) => handleStatusChange(e.target.value)} className="status-select">
              {Object.entries(statusLabels).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <div className="detail-row">
            <span>Data:</span>
            <strong>{new Date(order.created_at).toLocaleString('pt-BR')}</strong>
          </div>
          <div className="detail-row">
            <span>Subtotal:</span>
            <strong>R$ {(order.total_price || 0).toFixed(2)}</strong>
          </div>
          {order.discount_amount > 0 && (
            <div className="detail-row discount">
              <span>Desconto:</span>
              <strong>- R$ {order.discount_amount.toFixed(2)}</strong>
            </div>
          )}
          <div className="detail-row total">
            <span>Total:</span>
            <strong>R$ {((order.total_price || 0) - (order.discount_amount || 0)).toFixed(2)}</strong>
          </div>
        </div>

        <div className="order-detail-card">
          <h3>Cliente</h3>
          <div className="detail-row">
            <span>Nome:</span>
            <strong>{order.customer_name || 'N/A'}</strong>
          </div>
          <div className="detail-row">
            <span>Email:</span>
            <strong>{order.customer_email || 'N/A'}</strong>
          </div>
        </div>
      </div>

      <div className="order-detail-card">
        <h3>Itens do Pedido</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Qtd</th>
              <th>Preco Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((item) => (
              <tr key={item.id}>
                <td className="product-name-cell">
                  {item.product_image && <img src={item.product_image} alt="" className="admin-thumb" />}
                  <span>{item.product_name}</span>
                </td>
                <td>{item.quantity}</td>
                <td>R$ {(item.price_at_purchase || 0).toFixed(2)}</td>
                <td>R$ {((item.price_at_purchase || 0) * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrderDetail;
