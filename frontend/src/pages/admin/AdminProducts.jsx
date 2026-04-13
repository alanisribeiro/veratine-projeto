import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/api';
import '../../styles/admin/AdminTable.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, [page, search]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getProducts({ page, search, limit: 15 });
      setProducts(res.data.products);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Excluir "${name}"?`)) return;
    try {
      await adminAPI.deleteProduct(id);
      loadProducts();
    } catch (err) {
      alert('Erro ao excluir produto');
    }
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return <span className="stock-badge out">Sem estoque</span>;
    if (stock < 5) return <span className="stock-badge low">{stock} un.</span>;
    return <span className="stock-badge ok">{stock} un.</span>;
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h2 className="admin-page-title">Produtos ({total})</h2>
        <button className="admin-btn primary" onClick={() => navigate('/admin/products/new')}>+ Novo Produto</button>
      </div>

      <div className="admin-toolbar">
        <input
          type="text"
          placeholder="Buscar produtos..."
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
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Preco</th>
                  <th>Estoque</th>
                  <th>Rating</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td className="product-name-cell">
                      {p.image && <img src={p.image} alt="" className="admin-thumb" />}
                      <span>{p.name}</span>
                    </td>
                    <td>{p.category_name}</td>
                    <td>R$ {p.price.toFixed(2)}</td>
                    <td>{getStockBadge(p.stock)}</td>
                    <td>{p.rating_avg?.toFixed(1) || '-'}</td>
                    <td className="actions-cell">
                      <button className="admin-btn small" onClick={() => navigate(`/admin/products/${p.id}/edit`)}>Editar</button>
                      <button className="admin-btn small danger" onClick={() => handleDelete(p.id, p.name)}>Excluir</button>
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

export default AdminProducts;
