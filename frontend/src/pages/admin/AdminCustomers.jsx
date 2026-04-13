import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/api';
import '../../styles/admin/AdminTable.css';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, [page, search]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getCustomers({ page, search, limit: 15 });
      setCustomers(res.data.customers);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Clientes ({total})</h2>
      </div>

      <div className="admin-toolbar">
        <input
          type="text"
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="admin-search"
        />
      </div>

      {loading ? <div className="admin-loading">Carregando...</div> : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Pedidos</th>
                  <th>Total Gasto</th>
                  <th>Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan="6" className="empty-cell">Nenhum cliente encontrado</td></tr>
                ) : customers.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.order_count}</td>
                    <td>R$ {(c.total_spent || 0).toFixed(2)}</td>
                    <td>{new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
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

export default AdminCustomers;
