import React, { useState, useEffect, useRef } from 'react';
import { adminAPI } from '../../api/api';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import '../../styles/admin/AdminAnalytics.css';

const COLORS = ['#2D8A7B', '#d4a574', '#7B68EE', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [exporting, setExporting] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period, customStart, customEnd]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = period === 'custom'
        ? { startDate: customStart, endDate: customEnd }
        : { period };

      if (period === 'custom' && (!customStart || !customEnd)) {
        setLoading(false);
        return;
      }

      const res = await adminAPI.getAnalytics(params);
      setData(res.data);
    } catch (err) {
      console.error('Erro ao carregar analytics:', err);
    }
    setLoading(false);
  };

  const handleExportPDF = async () => {
    if (!contentRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Header
      pdf.setFontSize(16);
      pdf.setTextColor(45, 138, 123);
      pdf.text('Veratine - Relatorio Analytics', 14, 15);
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(data?.summary?.periodLabel || '', 14, 22);

      const imgWidth = pageWidth - 28;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let yPos = 28;
      let remainingHeight = imgHeight;
      let sourceY = 0;

      while (remainingHeight > 0) {
        const availableHeight = pageHeight - yPos - 10;
        const sliceHeight = Math.min(availableHeight, remainingHeight);
        const sliceSourceHeight = (sliceHeight / imgHeight) * canvas.height;

        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceSourceHeight;
        const ctx = sliceCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, sourceY, canvas.width, sliceSourceHeight, 0, 0, canvas.width, sliceSourceHeight);

        pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', 14, yPos, imgWidth, sliceHeight);

        remainingHeight -= sliceHeight;
        sourceY += sliceSourceHeight;

        if (remainingHeight > 0) {
          pdf.addPage();
          yPos = 14;
        }
      }

      pdf.save(`veratine-analytics-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Erro ao exportar PDF:', err);
    }
    setExporting(false);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="analytics-tooltip">
        <p className="analytics-tooltip-label">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: {entry.name === 'Faturamento' ? formatCurrency(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  };

  const renderPieLabel = ({ name, percent }) => {
    return `${name} (${(percent * 100).toFixed(0)}%)`;
  };

  if (loading && !data) {
    return (
      <div className="analytics-page">
        <h2 className="admin-page-title">Analytics</h2>
        <div className="analytics-loading">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h2 className="admin-page-title">Analytics</h2>
        <button
          className="analytics-export-btn"
          onClick={handleExportPDF}
          disabled={exporting || !data}
        >
          {exporting ? 'Exportando...' : 'Exportar PDF'}
        </button>
      </div>

      {/* Period Filter */}
      <div className="analytics-filters">
        {['7', '30', '90'].map((p) => (
          <button
            key={p}
            className={`analytics-filter-btn ${period === p ? 'active' : ''}`}
            onClick={() => setPeriod(p)}
          >
            {p} dias
          </button>
        ))}
        <button
          className={`analytics-filter-btn ${period === 'custom' ? 'active' : ''}`}
          onClick={() => setPeriod('custom')}
        >
          Personalizado
        </button>
        {period === 'custom' && (
          <div className="analytics-custom-dates">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="analytics-date-input"
            />
            <span>a</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="analytics-date-input"
            />
          </div>
        )}
      </div>

      {data && (
        <div className="analytics-content" ref={contentRef}>
          {/* KPI Cards */}
          <div className="analytics-kpis">
            <div className="analytics-kpi">
              <span className="analytics-kpi-label">Faturamento</span>
              <span className="analytics-kpi-value">{formatCurrency(data.summary.totalRevenue)}</span>
            </div>
            <div className="analytics-kpi">
              <span className="analytics-kpi-label">Pedidos</span>
              <span className="analytics-kpi-value">{data.summary.totalOrders}</span>
            </div>
            <div className="analytics-kpi">
              <span className="analytics-kpi-label">Ticket Medio</span>
              <span className="analytics-kpi-value">{formatCurrency(data.averageTicket)}</span>
            </div>
            <div className="analytics-kpi">
              <span className="analytics-kpi-label">Taxa de Conversao</span>
              <span className="analytics-kpi-value">{data.conversionRate.rate}%</span>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="analytics-card analytics-full">
            <h3>Faturamento ao Longo do Tempo</h3>
            {data.revenueTimeSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.revenueTimeSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#888' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#888' }}
                    tickFormatter={(v) => `R$${v}`} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#888' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" name="Faturamento"
                    stroke="#2D8A7B" strokeWidth={2} dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" name="Pedidos"
                    stroke="#d4a574" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="analytics-empty">Nenhum dado no periodo selecionado</p>
            )}
          </div>

          {/* Two Column Charts */}
          <div className="analytics-grid-2">
            {/* Top Products */}
            <div className="analytics-card">
              <h3>Top Produtos</h3>
              {data.topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.topProducts} layout="vertical"
                    margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#888' }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#888' }}
                      width={100} />
                    <Tooltip formatter={(value, name) =>
                      name === 'revenue' ? formatCurrency(value) : value
                    } />
                    <Bar dataKey="quantity" name="Quantidade" fill="#2D8A7B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="analytics-empty">Nenhum produto vendido no periodo</p>
              )}
            </div>

            {/* Category Breakdown */}
            <div className="analytics-card">
              <h3>Categorias</h3>
              {data.categoryBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.categoryBreakdown}
                      dataKey="revenue"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={renderPieLabel}
                      labelLine={{ stroke: '#888' }}
                    >
                      {data.categoryBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="analytics-empty">Nenhuma categoria com vendas no periodo</p>
              )}
            </div>
          </div>

          {/* Customer Segmentation */}
          <div className="analytics-card">
            <h3>Clientes Novos vs Retornantes</h3>
            {(data.customerSegmentation.newCustomers > 0 || data.customerSegmentation.returningCustomers > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[
                  { name: 'Novos', value: data.customerSegmentation.newCustomers },
                  { name: 'Retornantes', value: data.customerSegmentation.returningCustomers }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#888' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#888' }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" name="Clientes" radius={[4, 4, 0, 0]}>
                    <Cell fill="#2D8A7B" />
                    <Cell fill="#d4a574" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="analytics-empty">Nenhum dado de clientes no periodo</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
