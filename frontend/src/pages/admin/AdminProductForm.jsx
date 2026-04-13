import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI, productsAPI, uploadAPI } from '../../api/api';
import '../../styles/admin/AdminForm.css';

const AdminProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '', description: '', price: '', category_id: '', image: '', stock: '50', rating_avg: '0'
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [imageMode, setImageMode] = useState('upload'); // 'upload' | 'url'

  useEffect(() => {
    loadCategories();
    if (isEdit) loadProduct();
  }, [id]);

  const loadCategories = async () => {
    try {
      const res = await adminAPI.getCategories();
      setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await productsAPI.getById(id);
      const p = res.data.product;
      setForm({
        name: p.name, description: p.description || '', price: p.price,
        category_id: p.category_id, image: p.image || '', stock: p.stock, rating_avg: p.rating_avg || 0
      });
    } catch (err) {
      alert('Produto nao encontrado');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // === UPLOAD HANDLERS ===

  const handleFileUpload = async (file) => {
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('Imagem muito grande. Maximo 5MB.');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!validTypes.includes(file.type)) {
      alert('Formato nao suportado. Use JPG, PNG, WebP ou GIF.');
      return;
    }

    setUploading(true);
    setUploadProgress('Enviando imagem...');

    try {
      const res = await uploadAPI.uploadImage(file);
      setForm((prev) => ({ ...prev, image: res.data.url }));
      setUploadProgress('Imagem enviada!');
      setTimeout(() => setUploadProgress(''), 2000);
    } catch (err) {
      const msg = err.response?.data?.error || 'Erro ao enviar imagem';
      alert(msg);
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = '';
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) handleFileUpload(file);
        break;
      }
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, image: '' }));
  };

  // === SUBMIT ===

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category_id) {
      alert('Preencha nome, preco e categoria');
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        category_id: parseInt(form.category_id),
        stock: parseInt(form.stock) || 0,
        rating_avg: parseFloat(form.rating_avg) || 0
      };
      if (isEdit) {
        await adminAPI.updateProduct(id, data);
      } else {
        await adminAPI.createProduct(data);
      }
      navigate('/admin/products');
    } catch (err) {
      alert('Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">Carregando...</div>;

  return (
    <div className="admin-page" onPaste={handlePaste}>
      <div className="admin-page-header">
        <h2 className="admin-page-title">{isEdit ? 'Editar Produto' : 'Novo Produto'}</h2>
        <button className="admin-btn" onClick={() => navigate('/admin/products')}>Voltar</button>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome *</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Descricao</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Preco (R$) *</label>
            <input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Categoria *</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} required>
              <option value="">Selecione...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Estoque</label>
            <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Rating</label>
            <input name="rating_avg" type="number" step="0.1" min="0" max="5" value={form.rating_avg} onChange={handleChange} />
          </div>
        </div>

        {/* === IMAGE UPLOAD SECTION === */}
        <div className="form-group">
          <label>Imagem do Produto</label>

          <div className="image-mode-tabs">
            <button type="button" className={`image-mode-tab ${imageMode === 'upload' ? 'active' : ''}`} onClick={() => setImageMode('upload')}>
              Fazer Upload
            </button>
            <button type="button" className={`image-mode-tab ${imageMode === 'url' ? 'active' : ''}`} onClick={() => setImageMode('url')}>
              Colar URL
            </button>
          </div>

          {imageMode === 'upload' ? (
            <div
              className={`image-dropzone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {uploading ? (
                <div className="dropzone-uploading">
                  <div className="upload-spinner" />
                  <span>{uploadProgress}</span>
                </div>
              ) : (
                <div className="dropzone-content">
                  <div className="dropzone-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <p className="dropzone-text">
                    <strong>Clique para selecionar</strong> ou arraste uma imagem aqui
                  </p>
                  <p className="dropzone-hint">
                    JPG, PNG, WebP ou GIF (max. 5MB) — Ctrl+V para colar
                  </p>
                </div>
              )}
            </div>
          ) : (
            <input
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://exemplo.com/imagem.jpg ou /images/products/nome.jpg"
              className="image-url-input"
            />
          )}
        </div>

        {/* IMAGE PREVIEW */}
        {form.image && (
          <div className="image-preview-card">
            <img
              src={form.image.startsWith('/uploads') ? `http://localhost:5000${form.image}` : form.image}
              alt="Preview"
              onError={(e) => { e.target.src = ''; e.target.alt = 'Erro ao carregar imagem'; }}
            />
            <div className="image-preview-info">
              <span className="image-preview-url" title={form.image}>{form.image}</span>
              <button type="button" className="image-preview-remove" onClick={handleRemoveImage}>
                Remover imagem
              </button>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="admin-btn" onClick={() => navigate('/admin/products')}>Cancelar</button>
          <button type="submit" className="admin-btn primary" disabled={saving || uploading}>
            {saving ? 'Salvando...' : (isEdit ? 'Salvar Alteracoes' : 'Criar Produto')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;
