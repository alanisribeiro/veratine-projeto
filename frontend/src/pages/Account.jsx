import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useAppContext } from '../context/AppContext';
import { authAPI, ordersAPI } from '../api/api';
import '../styles/Account.css';

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const UserEditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const PackageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" />
    <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z" />
  </svg>
);

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const FlowerIcon = () => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 12C32 12 26 18 26 24C26 27.3 28.7 30 32 30C35.3 30 38 27.3 38 24C38 18 32 12 32 12Z" fill="currentColor" opacity="0.6"/>
    <path d="M22 18C22 18 16 21 16 27C16 30.3 18.7 33 22 33C25.3 33 28 30.3 28 27C28 21 22 18 22 18Z" fill="currentColor" opacity="0.4"/>
    <path d="M42 18C42 18 48 21 48 27C48 30.3 45.3 33 42 33C38.7 33 36 30.3 36 27C36 21 42 18 42 18Z" fill="currentColor" opacity="0.4"/>
    <path d="M32 30V52" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M32 38C28 38 25 35 25 35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    <path d="M32 42C36 42 39 39 39 39" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

function AccountSection({ icon: Icon, title, subtitle, expanded, onClick, children }) {
  return (
    <div className="account-section">
      <button className="account-section-header" onClick={onClick}>
        <div className="account-section-icon">
          <Icon />
        </div>
        <div className="account-section-info">
          <p className="account-section-title">{title}</p>
          <p className="account-section-subtitle">{subtitle}</p>
        </div>
        <div className={`account-section-chevron ${expanded ? 'expanded' : ''}`}>
          <ChevronIcon />
        </div>
      </button>
      <div className={`account-section-content ${expanded ? 'expanded' : ''}`}>
        <div className="account-section-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Account() {
  const { user, setUser, isGuest, isAdmin, logout } = useAppContext();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState(null);
  const [editName, setEditName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [addresses, setAddresses] = useState(() => {
    const saved = localStorage.getItem('veratine_addresses');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Casa',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('veratine_notifications');
    return saved ? JSON.parse(saved) : {
      emailPromotions: true,
      orderUpdates: true,
      newArrivals: true
    };
  });

  useEffect(() => {
    localStorage.setItem('veratine_addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('veratine_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
    }
  }, [user]);

  const toggleSection = (section) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
      setMessage({ type: '', text: '' });

      if (section === 'orders' && orders.length === 0) {
        loadOrders();
      }
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data.orders || response.data || []);
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setMessage({ type: 'error', text: 'Nome é obrigatório' });
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.updateProfile(editName.trim());
      setUser(response.data.user);
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao atualizar perfil. Verifique sua conexão.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setMessage({ type: 'error', text: 'Todos os campos são obrigatórios' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Nova senha deve ter no mínimo 6 caracteres' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'As senhas não conferem' });
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword, confirmNewPassword);
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Erro ao alterar senha. Verifique sua conexão.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      label: 'Casa',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    });
    setEditingAddress(null);
    setShowAddressForm(false);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!addressForm.street.trim() || !addressForm.number.trim() || !addressForm.city.trim() || !addressForm.state.trim()) {
      setMessage({ type: 'error', text: 'Preencha os campos obrigatórios' });
      return;
    }

    if (editingAddress !== null) {
      setAddresses(prev => prev.map((addr, i) =>
        i === editingAddress ? { ...addressForm } : addr
      ));
    } else {
      if (addresses.length >= 5) {
        setMessage({ type: 'error', text: 'Limite de 5 endereços atingido' });
        return;
      }
      setAddresses(prev => [...prev, { ...addressForm }]);
    }

    resetAddressForm();
    setMessage({ type: 'success', text: 'Endereço salvo com sucesso!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleEditAddress = (index) => {
    setAddressForm({ ...addresses[index] });
    setEditingAddress(index);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = (index) => {
    setAddresses(prev => prev.filter((_, i) => i !== index));
  };

  const handleToggleNotification = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getStatusLabel = (status) => {
    const map = {
      pending: 'Pendente',
      paid: 'Pago',
      shipped: 'Enviado',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return map[status] || status;
  };

  if (isGuest || !user) {
    return (
      <>
        <Header />
        <div className="account-container">
          <div className="account-guest">
            <div className="account-guest-icon">
              <FlowerIcon />
            </div>
            <h2 className="account-guest-title">Crie sua conta</h2>
            <p className="account-guest-text">
              Faça login ou cadastre-se para acessar seu perfil, acompanhar pedidos e muito mais.
            </p>
            <div className="account-guest-buttons">
              <button className="account-guest-btn-primary" onClick={() => navigate('/login')}>
                Entrar
              </button>
              <button className="account-guest-btn-secondary" onClick={() => navigate('/signup')}>
                Criar Conta
              </button>
            </div>
          </div>
        </div>
        <BottomNav />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="account-container">
        <div className="account-profile-header">
          <div className="account-avatar-wrapper">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="account-avatar" />
            ) : (
              <div className="account-avatar-initials">
                {getInitials(user.name)}
              </div>
            )}
          </div>
          <h2 className="account-user-name">{user.name}</h2>
          <p className="account-user-email">{user.email}</p>
        </div>

        <div className="account-sections">
          {/* Editar Perfil */}
          <AccountSection
            icon={UserEditIcon}
            title="Editar Perfil"
            subtitle="Altere seu nome"
            expanded={activeSection === 'editProfile'}
            onClick={() => toggleSection('editProfile')}
          >
            {activeSection === 'editProfile' && (
              <form className="account-form" onSubmit={handleUpdateProfile}>
                {message.text && activeSection === 'editProfile' && (
                  <div className={message.type === 'success' ? 'account-success' : 'account-error'}>
                    {message.text}
                  </div>
                )}
                <div className="account-form-group">
                  <label className="account-form-label">Nome</label>
                  <input
                    type="text"
                    className="account-input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Seu nome"
                    disabled={loading}
                  />
                </div>
                <div className="account-form-group">
                  <label className="account-form-label">Email</label>
                  <input
                    type="email"
                    className="account-input-readonly"
                    value={user.email || ''}
                    readOnly
                  />
                </div>
                <button type="submit" className="account-save-btn" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </form>
            )}
          </AccountSection>

          {/* Alterar Senha */}
          <AccountSection
            icon={LockIcon}
            title="Alterar Senha"
            subtitle="Atualize sua senha de acesso"
            expanded={activeSection === 'changePassword'}
            onClick={() => toggleSection('changePassword')}
          >
            {activeSection === 'changePassword' && (
              <form className="account-form" onSubmit={handleChangePassword}>
                {message.text && activeSection === 'changePassword' && (
                  <div className={message.type === 'success' ? 'account-success' : 'account-error'}>
                    {message.text}
                  </div>
                )}
                <div className="account-form-group">
                  <label className="account-form-label">Senha Atual</label>
                  <input
                    type="password"
                    className="account-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                    disabled={loading}
                  />
                </div>
                <div className="account-form-group">
                  <label className="account-form-label">Nova Senha</label>
                  <input
                    type="password"
                    className="account-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    disabled={loading}
                  />
                </div>
                <div className="account-form-group">
                  <label className="account-form-label">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    className="account-input"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    disabled={loading}
                  />
                </div>
                <button type="submit" className="account-save-btn" disabled={loading}>
                  {loading ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </form>
            )}
          </AccountSection>

          {/* Histórico de Pedidos */}
          <AccountSection
            icon={PackageIcon}
            title="Histórico de Pedidos"
            subtitle="Acompanhe seus pedidos"
            expanded={activeSection === 'orders'}
            onClick={() => toggleSection('orders')}
          >
            {activeSection === 'orders' && (
              <div className="account-orders-list">
                {ordersLoading ? (
                  <div className="account-empty-state">
                    <p className="account-empty-text">Carregando pedidos...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="account-empty-state">
                    <div className="account-empty-icon">
                      <PackageIcon />
                    </div>
                    <p className="account-empty-title">Nenhum pedido ainda</p>
                    <p className="account-empty-text">Seus pedidos aparecerão aqui</p>
                  </div>
                ) : (
                  orders.map((order, index) => (
                    <div key={order.id || index} className="account-order-card">
                      <div className="account-order-info">
                        <span className="account-order-id">Pedido #{order.id}</span>
                        <span className="account-order-date">{formatDate(order.created_at)}</span>
                      </div>
                      <div className="account-order-right">
                        <span className="account-order-total">{formatCurrency(order.total_price)}</span>
                        <span className={`account-order-status ${order.status || 'pending'}`}>
                          {getStatusLabel(order.status || 'pending')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </AccountSection>

          {/* Gerenciar Endereços */}
          <AccountSection
            icon={MapPinIcon}
            title="Gerenciar Endereços"
            subtitle="Adicione ou edite seus endereços"
            expanded={activeSection === 'addresses'}
            onClick={() => toggleSection('addresses')}
          >
            {activeSection === 'addresses' && (
              <div className="account-addresses-list">
                {message.text && activeSection === 'addresses' && (
                  <div className={message.type === 'success' ? 'account-success' : 'account-error'}>
                    {message.text}
                  </div>
                )}

                {addresses.map((addr, index) => (
                  <div key={index} className="account-address-card">
                    <div className="account-address-info">
                      <span className="account-address-label">{addr.label}</span>
                      <p className="account-address-text">
                        {addr.street}, {addr.number}
                        {addr.complement ? ` - ${addr.complement}` : ''}
                        <br />
                        {addr.neighborhood}{addr.neighborhood ? ' - ' : ''}{addr.city}/{addr.state}
                        {addr.zipCode ? ` - CEP: ${addr.zipCode}` : ''}
                      </p>
                    </div>
                    <div className="account-address-actions">
                      <button
                        className="account-address-action-btn"
                        onClick={() => handleEditAddress(index)}
                        title="Editar"
                      >
                        <EditIcon />
                      </button>
                      <button
                        className="account-address-action-btn delete"
                        onClick={() => handleDeleteAddress(index)}
                        title="Excluir"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}

                {addresses.length === 0 && !showAddressForm && (
                  <div className="account-empty-state">
                    <div className="account-empty-icon">
                      <MapPinIcon />
                    </div>
                    <p className="account-empty-title">Nenhum endereço salvo</p>
                    <p className="account-empty-text">Adicione um endereço para entregas</p>
                  </div>
                )}

                {showAddressForm ? (
                  <form className="account-address-form" onSubmit={handleSaveAddress}>
                    <div className="account-form-group">
                      <label className="account-form-label">Tipo</label>
                      <select
                        className="account-input"
                        value={addressForm.label}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, label: e.target.value }))}
                      >
                        <option value="Casa">Casa</option>
                        <option value="Trabalho">Trabalho</option>
                        <option value="Outro">Outro</option>
                      </select>
                    </div>
                    <div className="account-form-group">
                      <label className="account-form-label">Rua *</label>
                      <input
                        type="text"
                        className="account-input"
                        value={addressForm.street}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, street: e.target.value }))}
                        placeholder="Nome da rua"
                      />
                    </div>
                    <div className="account-address-row">
                      <div className="account-form-group small">
                        <label className="account-form-label">Número *</label>
                        <input
                          type="text"
                          className="account-input"
                          value={addressForm.number}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, number: e.target.value }))}
                          placeholder="Nº"
                        />
                      </div>
                      <div className="account-form-group">
                        <label className="account-form-label">Complemento</label>
                        <input
                          type="text"
                          className="account-input"
                          value={addressForm.complement}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, complement: e.target.value }))}
                          placeholder="Apto, bloco..."
                        />
                      </div>
                    </div>
                    <div className="account-form-group">
                      <label className="account-form-label">Bairro</label>
                      <input
                        type="text"
                        className="account-input"
                        value={addressForm.neighborhood}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, neighborhood: e.target.value }))}
                        placeholder="Bairro"
                      />
                    </div>
                    <div className="account-address-row">
                      <div className="account-form-group">
                        <label className="account-form-label">Cidade *</label>
                        <input
                          type="text"
                          className="account-input"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Cidade"
                        />
                      </div>
                      <div className="account-form-group small">
                        <label className="account-form-label">Estado *</label>
                        <input
                          type="text"
                          className="account-input"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="UF"
                          maxLength={2}
                        />
                      </div>
                    </div>
                    <div className="account-form-group">
                      <label className="account-form-label">CEP</label>
                      <input
                        type="text"
                        className="account-input"
                        value={addressForm.zipCode}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, zipCode: e.target.value }))}
                        placeholder="00000-000"
                        maxLength={9}
                      />
                    </div>
                    <div className="account-address-row">
                      <button type="submit" className="account-save-btn">
                        {editingAddress !== null ? 'Atualizar' : 'Salvar'}
                      </button>
                      <button type="button" className="account-add-btn" onClick={resetAddressForm} style={{ marginTop: 0 }}>
                        Cancelar
                      </button>
                    </div>
                  </form>
                ) : (
                  addresses.length < 5 && (
                    <button className="account-add-btn" onClick={() => setShowAddressForm(true)}>
                      <PlusIcon />
                      Adicionar Endereço
                    </button>
                  )
                )}
              </div>
            )}
          </AccountSection>

          {/* Notificações */}
          <AccountSection
            icon={BellIcon}
            title="Notificações"
            subtitle="Preferências de comunicação"
            expanded={activeSection === 'notifications'}
            onClick={() => toggleSection('notifications')}
          >
            {activeSection === 'notifications' && (
              <div className="account-notifications">
                <div className="account-notification-row">
                  <div className="account-notification-info">
                    <p className="account-notification-title">Promoções por email</p>
                    <p className="account-notification-desc">Receba ofertas exclusivas e descontos</p>
                  </div>
                  <label className="account-toggle">
                    <input
                      type="checkbox"
                      checked={notifications.emailPromotions}
                      onChange={() => handleToggleNotification('emailPromotions')}
                    />
                    <span className="account-toggle-slider" />
                  </label>
                </div>
                <div className="account-notification-row">
                  <div className="account-notification-info">
                    <p className="account-notification-title">Atualizações de pedidos</p>
                    <p className="account-notification-desc">Status de entrega e confirmações</p>
                  </div>
                  <label className="account-toggle">
                    <input
                      type="checkbox"
                      checked={notifications.orderUpdates}
                      onChange={() => handleToggleNotification('orderUpdates')}
                    />
                    <span className="account-toggle-slider" />
                  </label>
                </div>
                <div className="account-notification-row">
                  <div className="account-notification-info">
                    <p className="account-notification-title">Novidades</p>
                    <p className="account-notification-desc">Novos produtos e coleções</p>
                  </div>
                  <label className="account-toggle">
                    <input
                      type="checkbox"
                      checked={notifications.newArrivals}
                      onChange={() => handleToggleNotification('newArrivals')}
                    />
                    <span className="account-toggle-slider" />
                  </label>
                </div>
              </div>
            )}
          </AccountSection>
        </div>

        {isAdmin && (
          <button className="account-admin-btn" onClick={() => navigate('/admin')}>
            Painel Administrativo
          </button>
        )}

        <button className="account-logout-btn" onClick={handleLogout}>
          <LogoutIcon />
          Sair da Conta
        </button>
      </div>
      <BottomNav />
    </>
  );
}
