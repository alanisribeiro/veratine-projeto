import express from 'express';
import cron from 'node-cron';
import { authAndAdmin } from '../middleware/admin.js';
import { syncToGoogleSheets, hasCredentials, getServiceAccountEmail } from '../services/googleSheets.js';

const router = express.Router();
router.use(authAndAdmin);

// In-memory config (persisted via .env or could use DB)
let sheetsConfig = {
  spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || '',
  autoSync: process.env.GOOGLE_SHEETS_AUTO_SYNC === 'true',
  cronSchedule: process.env.GOOGLE_SHEETS_CRON || '0 6 * * *', // 6h da manhã
  syncVendas: true,
  syncEstoque: true,
  syncClientes: true,
};

let lastSyncResult = null;
let lastSyncTime = null;
let syncInProgress = false;
let cronJob = null;

// Start cron if auto-sync is enabled
function startCron() {
  stopCron();
  if (sheetsConfig.autoSync && sheetsConfig.spreadsheetId && hasCredentials()) {
    cronJob = cron.schedule(sheetsConfig.cronSchedule, async () => {
      console.log('⏰ Google Sheets: sincronização automática iniciada');
      try {
        syncInProgress = true;
        lastSyncResult = await syncToGoogleSheets(sheetsConfig.spreadsheetId, {
          vendas: sheetsConfig.syncVendas,
          estoque: sheetsConfig.syncEstoque,
          clientes: sheetsConfig.syncClientes,
        });
        lastSyncTime = new Date().toISOString();
        console.log('✅ Google Sheets: sincronização automática concluída');
      } catch (err) {
        console.error('❌ Google Sheets auto-sync error:', err.message);
        lastSyncResult = { error: err.message };
        lastSyncTime = new Date().toISOString();
      } finally {
        syncInProgress = false;
      }
    });
    console.log(`📊 Google Sheets: agendamento ativo (${sheetsConfig.cronSchedule})`);
  }
}

function stopCron() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
  }
}

// Initialize cron on startup
if (sheetsConfig.autoSync) {
  startCron();
}

// GET /sheets/status - Get config and status
router.get('/status', (req, res) => {
  res.json({
    configured: hasCredentials(),
    serviceAccountEmail: getServiceAccountEmail(),
    spreadsheetId: sheetsConfig.spreadsheetId,
    autoSync: sheetsConfig.autoSync,
    cronSchedule: sheetsConfig.cronSchedule,
    syncVendas: sheetsConfig.syncVendas,
    syncEstoque: sheetsConfig.syncEstoque,
    syncClientes: sheetsConfig.syncClientes,
    lastSyncTime,
    lastSyncResult,
    syncInProgress,
  });
});

// PUT /sheets/config - Update config
router.put('/config', (req, res) => {
  const { spreadsheetId, autoSync, cronSchedule, syncVendas, syncEstoque, syncClientes } = req.body;

  if (spreadsheetId !== undefined) sheetsConfig.spreadsheetId = spreadsheetId;
  if (autoSync !== undefined) sheetsConfig.autoSync = autoSync;
  if (cronSchedule !== undefined && cron.validate(cronSchedule)) {
    sheetsConfig.cronSchedule = cronSchedule;
  }
  if (syncVendas !== undefined) sheetsConfig.syncVendas = syncVendas;
  if (syncEstoque !== undefined) sheetsConfig.syncEstoque = syncEstoque;
  if (syncClientes !== undefined) sheetsConfig.syncClientes = syncClientes;

  // Restart cron with new config
  if (sheetsConfig.autoSync) {
    startCron();
  } else {
    stopCron();
  }

  res.json({ message: 'Configuração atualizada', config: sheetsConfig });
});

// POST /sheets/sync - Manual sync
router.post('/sync', async (req, res) => {
  if (syncInProgress) {
    return res.status(409).json({ error: 'Sincronização já em andamento' });
  }

  if (!hasCredentials()) {
    return res.status(400).json({ error: 'Credenciais do Google não configuradas. Coloque o arquivo google-credentials.json na pasta backend/' });
  }

  if (!sheetsConfig.spreadsheetId) {
    return res.status(400).json({ error: 'ID da planilha não configurado' });
  }

  syncInProgress = true;
  try {
    const result = await syncToGoogleSheets(sheetsConfig.spreadsheetId, {
      vendas: sheetsConfig.syncVendas,
      estoque: sheetsConfig.syncEstoque,
      clientes: sheetsConfig.syncClientes,
    });
    lastSyncResult = result;
    lastSyncTime = new Date().toISOString();
    syncInProgress = false;
    res.json({ message: 'Sincronização concluída com sucesso', result, syncTime: lastSyncTime });
  } catch (err) {
    syncInProgress = false;
    lastSyncResult = { error: err.message };
    lastSyncTime = new Date().toISOString();
    console.error('Sheets sync error:', err);
    res.status(500).json({ error: `Erro na sincronização: ${err.message}` });
  }
});

export default router;
