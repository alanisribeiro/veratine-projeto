import { google } from 'googleapis';
import { getDB } from '../db/init.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CREDENTIALS_PATH = path.join(__dirname, '..', 'google-credentials.json');

// Promisify db calls
const dbAll = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows || []));
});
const dbGet = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
});

function getAuth() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error('Arquivo google-credentials.json não encontrado. Coloque-o na pasta backend/.');
  }
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return auth;
}

function getSheets() {
  const auth = getAuth();
  return google.sheets({ version: 'v4', auth });
}

// ============ HELPERS ============

function formatCurrency(value) {
  return `R$ ${(value || 0).toFixed(2).replace('.', ',')}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Color helpers (0-1 range for Google Sheets API)
const COLORS = {
  headerBg:    { red: 0.176, green: 0.541, blue: 0.482 },  // #2D8A7B
  headerText:  { red: 1, green: 1, blue: 1 },               // white
  altRow:      { red: 0.910, green: 0.957, blue: 0.949 },   // #E8F4F2
  white:       { red: 1, green: 1, blue: 1 },
  summaryBg:   { red: 0.96, green: 0.94, blue: 0.90 },     // warm beige
  summaryText: { red: 0.176, green: 0.541, blue: 0.482 },
  dangerBg:    { red: 1, green: 0.90, blue: 0.90 },
  dangerText:  { red: 0.8, green: 0.15, blue: 0.15 },
  warningBg:   { red: 1, green: 0.96, blue: 0.88 },
  warningText: { red: 0.7, green: 0.5, blue: 0.1 },
  okText:      { red: 0.176, green: 0.541, blue: 0.482 },
};

async function getSheetId(sheets, spreadsheetId, sheetName) {
  const res = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = res.data.sheets.find(s => s.properties.title === sheetName);
  return sheet ? sheet.properties.sheetId : null;
}

async function ensureSheet(sheets, spreadsheetId, title) {
  try {
    const res = await sheets.spreadsheets.get({ spreadsheetId });
    const existing = res.data.sheets.find(s => s.properties.title === title);
    if (!existing) {
      const addRes = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title } } }]
        }
      });
      return addRes.data.replies[0].addSheet.properties.sheetId;
    }
    return existing.properties.sheetId;
  } catch (err) {
    throw new Error(`Erro ao acessar planilha: ${err.message}`);
  }
}

async function clearAndWrite(sheets, spreadsheetId, sheetName, data) {
  const range = `${sheetName}!A1`;
  try {
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });
  } catch (e) { /* sheet may be empty */ }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: data },
  });
}

// ============ FORMATTING ============

function buildFormatRequests(sheetId, numCols, numDataRows, summaryRowIndex, options = {}) {
  const requests = [];
  const { statusColIndex, colWidths } = options;

  // 1. Header row - green bg, white bold text, centered
  requests.push({
    repeatCell: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: numCols },
      cell: {
        userEnteredFormat: {
          backgroundColor: COLORS.headerBg,
          textFormat: { foregroundColor: COLORS.headerText, bold: true, fontSize: 11 },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
          padding: { top: 6, bottom: 6, left: 8, right: 8 },
        }
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,padding)',
    }
  });

  // 2. Freeze header row
  requests.push({
    updateSheetProperties: {
      properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
      fields: 'gridProperties.frozenRowCount',
    }
  });

  // 3. Alternating row colors (zebra stripes)
  if (numDataRows > 0) {
    for (let i = 0; i < numDataRows; i++) {
      const rowIndex = i + 1; // skip header
      if (i % 2 === 1) {
        requests.push({
          repeatCell: {
            range: { sheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: 0, endColumnIndex: numCols },
            cell: {
              userEnteredFormat: { backgroundColor: COLORS.altRow }
            },
            fields: 'userEnteredFormat.backgroundColor',
          }
        });
      }
    }
  }

  // 4. Data rows text formatting
  if (numDataRows > 0) {
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 1, endRowIndex: numDataRows + 1, startColumnIndex: 0, endColumnIndex: numCols },
        cell: {
          userEnteredFormat: {
            textFormat: { fontSize: 10 },
            verticalAlignment: 'MIDDLE',
            padding: { top: 4, bottom: 4, left: 6, right: 6 },
          }
        },
        fields: 'userEnteredFormat(textFormat.fontSize,verticalAlignment,padding)',
      }
    });
  }

  // 5. Summary row styling
  if (summaryRowIndex >= 0) {
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: summaryRowIndex, endRowIndex: summaryRowIndex + 1, startColumnIndex: 0, endColumnIndex: numCols },
        cell: {
          userEnteredFormat: {
            backgroundColor: COLORS.summaryBg,
            textFormat: { bold: true, fontSize: 11, foregroundColor: COLORS.summaryText },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
            padding: { top: 8, bottom: 8 },
          }
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,padding)',
      }
    });
  }

  // 6. Top border under header
  requests.push({
    updateBorders: {
      range: { sheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: numCols },
      bottom: { style: 'SOLID_MEDIUM', color: COLORS.headerBg },
    }
  });

  // 7. Border above summary
  if (summaryRowIndex >= 0) {
    requests.push({
      updateBorders: {
        range: { sheetId, startRowIndex: summaryRowIndex, endRowIndex: summaryRowIndex + 1, startColumnIndex: 0, endColumnIndex: numCols },
        top: { style: 'SOLID_MEDIUM', color: COLORS.headerBg },
      }
    });
  }

  // 8. Column widths
  if (colWidths) {
    colWidths.forEach((width, i) => {
      requests.push({
        updateDimensionProperties: {
          range: { sheetId, dimension: 'COLUMNS', startIndex: i, endIndex: i + 1 },
          properties: { pixelSize: width },
          fields: 'pixelSize',
        }
      });
    });
  }

  // 9. Row height for header
  requests.push({
    updateDimensionProperties: {
      range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 },
      properties: { pixelSize: 40 },
      fields: 'pixelSize',
    }
  });

  return requests;
}

function buildStatusFormatRequests(sheetId, statusColIndex, dataRows, startRow = 1) {
  const requests = [];
  dataRows.forEach((row, i) => {
    const status = row[statusColIndex];
    if (!status) return;
    const rowIndex = startRow + i;
    let bgColor, textColor;

    if (typeof status === 'string') {
      if (status.includes('Sem Estoque') || status === 'Cancelado') {
        bgColor = COLORS.dangerBg;
        textColor = COLORS.dangerText;
      } else if (status.includes('Estoque Baixo') || status === 'Pendente') {
        bgColor = COLORS.warningBg;
        textColor = COLORS.warningText;
      } else if (status === 'OK' || status === 'Entregue' || status === 'Pago') {
        bgColor = { red: 0.90, green: 0.96, blue: 0.92 };
        textColor = COLORS.okText;
      }
    }

    if (bgColor) {
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: statusColIndex, endColumnIndex: statusColIndex + 1 },
          cell: {
            userEnteredFormat: {
              backgroundColor: bgColor,
              textFormat: { bold: true, foregroundColor: textColor },
              horizontalAlignment: 'CENTER',
            }
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
        }
      });
    }
  });
  return requests;
}

// ============ EXPORT FUNCTIONS ============

async function exportVendas(sheets, spreadsheetId) {
  const db = await getDB();
  const orders = await dbAll(db,
    `SELECT o.id, o.total_price, o.status, o.created_at, o.discount_amount,
            c.code as coupon_code, u.name as customer_name, u.email as customer_email
     FROM orders o
     LEFT JOIN users u ON o.user_id = u.id
     LEFT JOIN coupons c ON o.coupon_id = c.id
     ORDER BY o.created_at DESC`
  );

  const header = ['ID', 'Cliente', 'Email', 'Total', 'Desconto', 'Cupom', 'Status', 'Data'];
  const statusMap = {
    'pending': 'Pendente',
    'paid': 'Pago',
    'preparing': 'Preparando',
    'shipped': 'Enviado',
    'delivered': 'Entregue',
    'cancelled': 'Cancelado'
  };

  const rows = orders.map(o => [
    o.id,
    o.customer_name || 'N/A',
    o.customer_email || 'N/A',
    formatCurrency(o.total_price - (o.discount_amount || 0)),
    formatCurrency(o.discount_amount || 0),
    o.coupon_code || '-',
    statusMap[o.status] || o.status,
    formatDate(o.created_at),
  ]);

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total_price - (o.discount_amount || 0)), 0);

  rows.push([]);
  rows.push(['', '', 'TOTAL FATURAMENTO:', formatCurrency(totalRevenue), '', '', `${orders.length} pedidos`, '']);

  const sheetName = 'Vendas';
  const sheetId = await ensureSheet(sheets, spreadsheetId, sheetName);
  await clearAndWrite(sheets, spreadsheetId, sheetName, [header, ...rows]);

  // Apply formatting
  const summaryRowIndex = orders.length + 2; // header + data + empty row
  const formatRequests = [
    ...buildFormatRequests(sheetId, 8, orders.length, summaryRowIndex, {
      colWidths: [60, 180, 220, 120, 100, 100, 120, 160],
    }),
    ...buildStatusFormatRequests(sheetId, 6, rows.slice(0, orders.length)),
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: formatRequests },
  });

  return { sheet: sheetName, rows: orders.length };
}

async function exportEstoque(sheets, spreadsheetId) {
  const db = await getDB();
  const products = await dbAll(db,
    `SELECT p.id, p.name, p.price, p.stock,
            c.name as category_name
     FROM products p
     LEFT JOIN categories c ON p.category_id = c.id
     ORDER BY p.stock ASC`
  );

  const header = ['ID', 'Produto', 'Categoria', 'Preco', 'Estoque', 'Status'];

  const rows = products.map(p => {
    let status = 'OK';
    if (p.stock === 0) status = 'Sem Estoque';
    else if (p.stock < 5) status = 'Estoque Baixo';
    return [
      p.id,
      p.name,
      p.category_name || 'Sem categoria',
      formatCurrency(p.price),
      p.stock,
      status,
    ];
  });

  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock < 5).length;

  rows.push([]);
  rows.push([`${products.length} produtos`, '', '', '', `${outOfStock} sem estoque`, `${lowStock} estoque baixo`]);

  const sheetName = 'Estoque';
  const sheetId = await ensureSheet(sheets, spreadsheetId, sheetName);
  await clearAndWrite(sheets, spreadsheetId, sheetName, [header, ...rows]);

  const summaryRowIndex = products.length + 2;
  const formatRequests = [
    ...buildFormatRequests(sheetId, 6, products.length, summaryRowIndex, {
      colWidths: [60, 280, 160, 120, 90, 140],
    }),
    ...buildStatusFormatRequests(sheetId, 5, rows.slice(0, products.length)),
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: formatRequests },
  });

  return { sheet: sheetName, rows: products.length };
}

async function exportClientes(sheets, spreadsheetId) {
  const db = await getDB();
  const customers = await dbAll(db,
    `SELECT u.id, u.name, u.email, u.created_at,
            COUNT(o.id) as total_orders,
            COALESCE(SUM(o.total_price - COALESCE(o.discount_amount, 0)), 0) as total_spent
     FROM users u
     LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
     WHERE u.role = 'customer' OR u.role IS NULL
     GROUP BY u.id
     ORDER BY total_spent DESC`
  );

  const header = ['ID', 'Nome', 'Email', 'Pedidos', 'Total Gasto', 'Cliente Desde'];

  const rows = customers.map(c => [
    c.id,
    c.name,
    c.email,
    c.total_orders,
    formatCurrency(c.total_spent),
    formatDate(c.created_at),
  ]);

  const totalSpent = customers.reduce((sum, c) => sum + c.total_spent, 0);
  rows.push([]);
  rows.push([`${customers.length} clientes`, '', '', '', formatCurrency(totalSpent), '']);

  const sheetName = 'Clientes';
  const sheetId = await ensureSheet(sheets, spreadsheetId, sheetName);
  await clearAndWrite(sheets, spreadsheetId, sheetName, [header, ...rows]);

  const summaryRowIndex = customers.length + 2;
  const formatRequests = buildFormatRequests(sheetId, 6, customers.length, summaryRowIndex, {
    colWidths: [60, 200, 250, 90, 140, 160],
  });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: formatRequests },
  });

  return { sheet: sheetName, rows: customers.length };
}

// ============ MAIN SYNC FUNCTION ============

export async function syncToGoogleSheets(spreadsheetId, options = {}) {
  const { vendas = true, estoque = true, clientes = true } = options;
  const sheets = getSheets();
  const results = {};

  if (vendas) {
    results.vendas = await exportVendas(sheets, spreadsheetId);
  }
  if (estoque) {
    results.estoque = await exportEstoque(sheets, spreadsheetId);
  }
  if (clientes) {
    results.clientes = await exportClientes(sheets, spreadsheetId);
  }

  return results;
}

export function hasCredentials() {
  return fs.existsSync(CREDENTIALS_PATH);
}

export function getServiceAccountEmail() {
  if (!fs.existsSync(CREDENTIALS_PATH)) return null;
  try {
    const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    return creds.client_email || null;
  } catch {
    return null;
  }
}
