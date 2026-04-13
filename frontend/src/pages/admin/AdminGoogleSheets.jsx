import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../api/api';
import '../../styles/admin/AdminGoogleSheets.css';

const AdminGoogleSheets = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Form state
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [autoSync, setAutoSync] = useState(false);
  const [cronSchedule, setCronSchedule] = useState('0 6 * * *');
  const [syncVendas, setSyncVendas] = useState(true);
  const [syncEstoque, setSyncEstoque] = useState(true);
  const [syncClientes, setSyncClientes] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await adminAPI.getSheetsStatus();
      setStatus(res.data);
      setSpreadsheetId(res.data.spreadsheetId || '');
      setAutoSync(res.data.autoSync || false);
      setCronSchedule(res.data.cronSchedule || '0 6 * * *');
      setSyncVendas(res.data.syncVendas !== false);
      setSyncEstoque(res.data.syncEstoque !== false);
      setSyncClientes(res.data.syncClientes !== false);
    } catch (err) {
      console.error('Erro ao carregar status:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.updateSheetsConfig({
        spreadsheetId,
        autoSync,
        cronSchedule,
        syncVendas,
        syncEstoque,
        syncClientes,
      });
      showMessage('Configuração salva com sucesso!');
      fetchStatus();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Erro ao salvar configuração', 'error');
    }
    setSaving(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await adminAPI.syncSheets();
      showMessage(`Sincronização concluída! ${formatSyncResult(res.data.result)}`);
      fetchStatus();
    } catch (err) {
      showMessage(err.response?.data?.error || 'Erro na sincronização', 'error');
    }
    setSyncing(false);
  };

  const formatSyncResult = (result) => {
    if (!result) return '';
    const parts = [];
    if (result.vendas) parts.push(`${result.vendas.rows} vendas`);
    if (result.estoque) parts.push(`${result.estoque.rows} produtos`);
    if (result.clientes) parts.push(`${result.clientes.rows} clientes`);
    return parts.join(', ');
  };

  const formatLastSync = (time) => {
    if (!time) return 'Nunca';
    const d = new Date(time);
    return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const cronLabels = {
    '0 6 * * *': 'Diário às 06:00',
    '0 8 * * *': 'Diário às 08:00',
    '0 12 * * *': 'Diário às 12:00',
    '0 18 * * *': 'Diário às 18:00',
    '0 6 * * 1': 'Semanal (Segunda 06:00)',
    '0 6 1 * *': 'Mensal (Dia 1 às 06:00)',
  };

  const extractSpreadsheetId = (value) => {
    // Support both raw ID and full URL
    const match = value.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : value;
  };

  if (loading) {
    return (
      <div className="gsheets-page">
        <h2 className="admin-page-title">Google Sheets</h2>
        <div className="gsheets-loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="gsheets-page">
      <div className="gsheets-header">
        <h2 className="admin-page-title">Google Sheets</h2>
        <button
          className="gsheets-sync-btn"
          onClick={handleSync}
          disabled={syncing || !status?.configured || !spreadsheetId}
        >
          {syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
        </button>
      </div>

      {message && (
        <div className={`gsheets-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Status Cards */}
      <div className="gsheets-status-cards">
        <div className={`gsheets-status-card ${status?.configured ? 'ok' : 'warning'}`}>
          <span className="gsheets-status-icon">{status?.configured ? '✓' : '!'}</span>
          <div>
            <strong>Credenciais Google</strong>
            <span>{status?.configured ? 'Configuradas' : 'Não encontradas'}</span>
          </div>
        </div>
        <div className={`gsheets-status-card ${spreadsheetId ? 'ok' : 'warning'}`}>
          <span className="gsheets-status-icon">{spreadsheetId ? '✓' : '!'}</span>
          <div>
            <strong>Planilha</strong>
            <span>{spreadsheetId ? 'Configurada' : 'Não configurada'}</span>
          </div>
        </div>
        <div className={`gsheets-status-card ${autoSync ? 'ok' : 'neutral'}`}>
          <span className="gsheets-status-icon">{autoSync ? '✓' : '○'}</span>
          <div>
            <strong>Auto-Sync</strong>
            <span>{autoSync ? cronLabels[cronSchedule] || cronSchedule : 'Desativado'}</span>
          </div>
        </div>
        <div className="gsheets-status-card neutral">
          <span className="gsheets-status-icon">↻</span>
          <div>
            <strong>Última Sincronização</strong>
            <span>{formatLastSync(status?.lastSyncTime)}</span>
          </div>
        </div>
      </div>

      {/* Setup Guide */}
      {!status?.configured && (
        <div className="gsheets-card gsheets-setup">
          <h3>Como Configurar</h3>
          <ol className="gsheets-steps">
            <li>
              Acesse o <strong>Google Cloud Console</strong> e crie um projeto
            </li>
            <li>
              Ative a <strong>Google Sheets API</strong> no projeto
            </li>
            <li>
              Crie uma <strong>Conta de Serviço</strong> (Service Account) e baixe o JSON de credenciais
            </li>
            <li>
              Renomeie o arquivo para <code>google-credentials.json</code> e coloque na pasta <code>backend/</code>
            </li>
            <li>
              Crie uma planilha no Google Sheets e compartilhe com o email da conta de serviço
            </li>
          </ol>
        </div>
      )}

      {/* Configuration */}
      <div className="gsheets-card">
        <h3>Configuração</h3>

        {status?.serviceAccountEmail && (
          <div className="gsheets-field">
            <label>Email da Conta de Serviço</label>
            <div className="gsheets-service-email">
              <code>{status.serviceAccountEmail}</code>
              <small>Compartilhe sua planilha com este email (permissão de Editor)</small>
            </div>
          </div>
        )}

        <div className="gsheets-field">
          <label htmlFor="spreadsheetId">ID ou URL da Planilha</label>
          <input
            id="spreadsheetId"
            type="text"
            value={spreadsheetId}
            onChange={(e) => setSpreadsheetId(extractSpreadsheetId(e.target.value))}
            placeholder="Cole a URL ou ID da planilha do Google Sheets"
            className="gsheets-input"
          />
          <small>Você pode colar a URL completa da planilha</small>
        </div>

        <div className="gsheets-field">
          <label>Dados para Sincronizar</label>
          <div className="gsheets-checkboxes">
            <label className="gsheets-checkbox">
              <input type="checkbox" checked={syncVendas} onChange={(e) => setSyncVendas(e.target.checked)} />
              <span>Vendas</span>
              <small>Histórico completo de pedidos</small>
            </label>
            <label className="gsheets-checkbox">
              <input type="checkbox" checked={syncEstoque} onChange={(e) => setSyncEstoque(e.target.checked)} />
              <span>Estoque</span>
              <small>Produtos, preços e quantidades</small>
            </label>
            <label className="gsheets-checkbox">
              <input type="checkbox" checked={syncClientes} onChange={(e) => setSyncClientes(e.target.checked)} />
              <span>Clientes</span>
              <small>Base de clientes e histórico</small>
            </label>
          </div>
        </div>

        <div className="gsheets-field">
          <label>Sincronização Automática</label>
          <div className="gsheets-toggle-row">
            <label className="gsheets-toggle">
              <input type="checkbox" checked={autoSync} onChange={(e) => setAutoSync(e.target.checked)} />
              <span className="gsheets-toggle-slider"></span>
            </label>
            <span>{autoSync ? 'Ativada' : 'Desativada'}</span>
          </div>
        </div>

        {autoSync && (
          <div className="gsheets-field">
            <label htmlFor="cronSchedule">Frequência</label>
            <select
              id="cronSchedule"
              value={cronSchedule}
              onChange={(e) => setCronSchedule(e.target.value)}
              className="gsheets-select"
            >
              {Object.entries(cronLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        )}

        <button className="gsheets-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Configuração'}
        </button>
      </div>

      {/* Last Sync Result */}
      {status?.lastSyncResult && !status.lastSyncResult.error && (
        <div className="gsheets-card">
          <h3>Último Resultado</h3>
          <div className="gsheets-result-grid">
            {status.lastSyncResult.vendas && (
              <div className="gsheets-result-item">
                <strong>Vendas</strong>
                <span>{status.lastSyncResult.vendas.rows} registros exportados</span>
              </div>
            )}
            {status.lastSyncResult.estoque && (
              <div className="gsheets-result-item">
                <strong>Estoque</strong>
                <span>{status.lastSyncResult.estoque.rows} produtos exportados</span>
              </div>
            )}
            {status.lastSyncResult.clientes && (
              <div className="gsheets-result-item">
                <strong>Clientes</strong>
                <span>{status.lastSyncResult.clientes.rows} clientes exportados</span>
              </div>
            )}
          </div>
          <small className="gsheets-sync-time">Sincronizado em {formatLastSync(status.lastSyncTime)}</small>
        </div>
      )}

      {status?.lastSyncResult?.error && (
        <div className="gsheets-card gsheets-error-card">
          <h3>Erro na Última Sincronização</h3>
          <p>{status.lastSyncResult.error}</p>
          <small>{formatLastSync(status.lastSyncTime)}</small>
        </div>
      )}
    </div>
  );
};

export default AdminGoogleSheets;
