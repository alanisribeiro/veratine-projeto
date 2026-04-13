import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/api';
import '../../styles/admin/AdminTable.css';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    code: '', type: 'percentage', value: '', min_order_value: '0',
    max_discount: '', usage_limit: '', expires_at: '', active: 1
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getCoupons();
      setCoupons(res.data.coupons);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.value) return alert('Codigo e valor sao obrigatorios');
    try {
      const data = {
        ...form,
        value: parseFloat(form.value),
        min_order_value: parseFloat(form.min_order_value) || 0,
        max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : null,
        active: form.active ? 1 : 0,
      };
      if (editId) {
        await adminAPI.updateCoupon(editId, data);
      } else {
        await adminAPI.createCoupon(data);
      }
      resetForm();
      loadCoupons();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar cupom');
    }
  };

  const handleEdit = (c) => {
    setEditId(c.id);
    setForm({
      code: c.code, type: c.type, value: c.value, min_order_value: c.min_order_value || 0,
      max_discount: c.max_discount || '', usage_limit: c.usage_limit || '',
      expires_at: c.expires_at ? c.expires_at.split('T')[0] : '', active: c.active
    });
    setShowForm(true);
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Excluir cupom "${code}"?`)) return;
    try {
      await adminAPI.deleteCoupon(id);
      loadCoupons();
    } catch (err) {
      alert('Erro ao excluir cupom');
    }
  };

  const resetForm = () => {
    setForm({ code: '', type: 'percentage', value: '', min_order_value: '0', max_discount: '', usage_limit: '', expires_at: '', active: 1 });
    setEditId(null);
    setShowForm(false);
  };

  const isExpired = (date) => date && new Date(date) < new Date();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Cupons ({coupons.length})</h2>
        <button className="admin-btn primary" onClick={() => { resetForm(); setShowForm(true); }}>+ Novo Cupom</button>
      </div>

      {showForm && (
        <form className="admin-form compact" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Codigo *</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="Ex: FLORES10" required />
            </div>
            <div className="form-group">
              <label>Tipo *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="percentage">Porcentagem (%)</option>
                <option value="fixed">Valor Fixo (R$)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Valor *</label>
              <input type="number" step="0.01" min="0" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Pedido Minimo (R$)</label>
              <input type="number" step="0.01" min="0" value={form.min_order_value} onChange={(e) => setForm({ ...form, min_order_value: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Desconto Maximo (R$)</label>
              <input type="number" step="0.01" min="0" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} placeholder="Sem limite" />
            </div>
            <div className="form-group">
              <label>Limite de Uso</label>
              <input type="number" min="0" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} placeholder="Ilimitado" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Validade</label>
              <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked ? 1 : 0 })} />
                Ativo
              </label>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="admin-btn" onClick={resetForm}>Cancelar</button>
            <button type="submit" className="admin-btn primary">{editId ? 'Salvar' : 'Criar Cupom'}</button>
          </div>
        </form>
      )}

      {loading ? <div className="admin-loading">Carregando...</div> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Codigo</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Min. Pedido</th>
                <th>Uso</th>
                <th>Validade</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr><td colSpan="8" className="empty-cell">Nenhum cupom cadastrado</td></tr>
              ) : coupons.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.code}</strong></td>
                  <td>{c.type === 'percentage' ? 'Porcentagem' : 'Fixo'}</td>
                  <td>{c.type === 'percentage' ? `${c.value}%` : `R$ ${c.value.toFixed(2)}`}</td>
                  <td>R$ {(c.min_order_value || 0).toFixed(2)}</td>
                  <td>{c.usage_count}{c.usage_limit ? `/${c.usage_limit}` : ''}</td>
                  <td className={isExpired(c.expires_at) ? 'text-danger' : ''}>
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString('pt-BR') : 'Sem limite'}
                  </td>
                  <td>
                    <span className={`status-badge ${c.active && !isExpired(c.expires_at) ? 'paid' : 'cancelled'}`}>
                      {c.active && !isExpired(c.expires_at) ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="admin-btn small" onClick={() => handleEdit(c)}>Editar</button>
                    <button className="admin-btn small danger" onClick={() => handleDelete(c.id, c.code)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
