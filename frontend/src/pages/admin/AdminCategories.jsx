import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/api';
import '../../styles/admin/AdminTable.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getCategories();
      setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return alert('Nome e obrigatorio');
    try {
      if (editId) {
        await adminAPI.updateCategory(editId, form);
      } else {
        await adminAPI.createCategory(form);
      }
      resetForm();
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao salvar');
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat.id);
    setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '' });
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Excluir categoria "${name}"?`)) return;
    try {
      await adminAPI.deleteCategory(id);
      loadCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao excluir');
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', icon: '' });
    setEditId(null);
    setShowForm(false);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Categorias ({categories.length})</h2>
        <button className="admin-btn primary" onClick={() => { resetForm(); setShowForm(true); }}>+ Nova Categoria</button>
      </div>

      {showForm && (
        <form className="admin-inline-form" onSubmit={handleSubmit}>
          <input placeholder="Nome *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Descricao" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input placeholder="Icone" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          <div className="inline-form-actions">
            <button type="submit" className="admin-btn primary small">{editId ? 'Salvar' : 'Criar'}</button>
            <button type="button" className="admin-btn small" onClick={resetForm}>Cancelar</button>
          </div>
        </form>
      )}

      {loading ? <div className="admin-loading">Carregando...</div> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Descricao</th>
                <th>Produtos</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.name}</td>
                  <td>{c.description}</td>
                  <td>{c.product_count}</td>
                  <td className="actions-cell">
                    <button className="admin-btn small" onClick={() => handleEdit(c)}>Editar</button>
                    <button className="admin-btn small danger" onClick={() => handleDelete(c.id, c.name)}>Excluir</button>
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

export default AdminCategories;
