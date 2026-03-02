import React from 'react';
import Layout from '../../components/Layout/Layout';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiDownload } from 'react-icons/fi';
import { 
  useReportsLogic, 
  MONTHS, 
  COLORS, 
  formatCurrency, 
  formatPaymentMethod 
} from './Reports.logic';
import './Reports.css';

const Reports = () => {
  const {
    loading,
    exporting,
    selectedYear,
    selectedMonth,
    monthlyData,
    categoryData,
    paymentMethodData,
    summary,
    lifetimeStats,
    exportStartDate,
    exportEndDate,
    totalYear,
    years,
    setSelectedYear,
    setSelectedMonth,
    setExportStartDate,
    setExportEndDate,
    exportToCSV
  } = useReportsLogic();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Layout>
        <div className="spinner"></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="reports-page fade-in">
        <div className="page-header">
          <div>
            <h1>Relatórios</h1>
            <p>Análise detalhada das suas finanças</p>
          </div>
          <div className="report-filters">
            <select 
              className="form-control"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {MONTHS.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
            <select 
              className="form-control"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Seção de Exportação */}
        <div className="export-section card">
          <h3><FiDownload /> Exportar Relatório</h3>
          <p className="export-description">
            Selecione o período desejado e exporte suas transações em formato CSV para análise em planilhas
          </p>
          <div className="export-controls">
            <div className="export-dates">
              <div className="form-group">
                <label>Data Inicial</label>
                <input
                  type="date"
                  className="form-control"
                  value={exportStartDate}
                  onChange={(e) => setExportStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Data Final</label>
                <input
                  type="date"
                  className="form-control"
                  value={exportEndDate}
                  onChange={(e) => setExportEndDate(e.target.value)}
                />
              </div>
            </div>
            <button 
              className="btn-primary btn-export"
              onClick={exportToCSV}
              disabled={exporting || !exportStartDate || !exportEndDate}
            >
              <FiDownload /> {exporting ? 'Exportando...' : 'Exportar CSV'}
            </button>
          </div>
        </div>

        <div className="summary-cards">
          <div className={`summary-card total ${lifetimeStats.saldo_total >= 0 ? 'positive' : 'negative'}`}>
            <div className="summary-icon"><FiDollarSign /></div>
            <div className="summary-info">
              <span className="summary-label">Saldo Total</span>
              <span className="summary-value">{formatCurrency(lifetimeStats.saldo_total)}</span>
              <span className="summary-sublabel">Todo o período</span>
            </div>
          </div>

          <div className="summary-card expense">
            <div className="summary-icon"><FiTrendingDown /></div>
            <div className="summary-info">
              <span className="summary-label">Despesas Totais</span>
              <span className="summary-value">{formatCurrency(lifetimeStats.total_despesas)}</span>
              <span className="summary-sublabel">Todo o período</span>
            </div>
          </div>

          <div className="summary-card income">
            <div className="summary-icon"><FiTrendingUp /></div>
            <div className="summary-info">
              <span className="summary-label">Receitas ({MONTHS[selectedMonth - 1]})</span>
              <span className="summary-value">{formatCurrency(summary.receita)}</span>
            </div>
          </div>

          <div className="summary-card expense">
            <div className="summary-icon"><FiTrendingDown /></div>
            <div className="summary-info">
              <span className="summary-label">Despesas ({MONTHS[selectedMonth - 1]})</span>
              <span className="summary-value">{formatCurrency(summary.despesa)}</span>
            </div>
          </div>

          <div className={`summary-card balance ${summary.saldo >= 0 ? 'positive' : 'negative'}`}>
            <div className="summary-icon"><FiDollarSign /></div>
            <div className="summary-info">
              <span className="summary-label">Saldo ({MONTHS[selectedMonth - 1]})</span>
              <span className="summary-value">{formatCurrency(summary.saldo)}</span>
            </div>
          </div>
        </div>

        <div className="report-grid">
          <div className="card chart-card">
            <h3>Saldo Mensal - {selectedYear}</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value).replace('R$', '')} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  name="Saldo"
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card chart-card">
            <h3>Despesas por Categoria - {MONTHS[selectedMonth - 1]}</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="total"
                    nameKey="name"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                <p>Nenhuma despesa registrada neste período</p>
              </div>
            )}
          </div>

          <div className="card chart-card">
            <h3>Métodos de Pagamento - {MONTHS[selectedMonth - 1]}</h3>
            {paymentMethodData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ payment_method, percent }) => `${formatPaymentMethod(payment_method)} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="total"
                    nameKey="payment_method"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => formatPaymentMethod(label)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                <p>Nenhuma transação registrada neste período</p>
              </div>
            )}
          </div>

          <div className="card year-summary">
            <h3>Resumo Anual - {selectedYear}</h3>
            <div className="year-stats">
              <div className="year-stat">
                <span className="stat-label">Total de Receitas</span>
                <span className="stat-value income">{formatCurrency(totalYear.receita)}</span>
              </div>
              <div className="year-stat">
                <span className="stat-label">Total de Despesas</span>
                <span className="stat-value expense">{formatCurrency(totalYear.despesa)}</span>
              </div>
              <div className="year-stat">
                <span className="stat-label">Saldo do Ano</span>
                <span className={`stat-value ${totalYear.receita - totalYear.despesa >= 0 ? 'income' : 'expense'}`}>
                  {formatCurrency(totalYear.receita - totalYear.despesa)}
                </span>
              </div>
              <div className="year-stat">
                <span className="stat-label">Média Mensal (Receitas)</span>
                <span className="stat-value income">{formatCurrency(totalYear.receita / 12)}</span>
              </div>
              <div className="year-stat">
                <span className="stat-label">Média Mensal (Despesas)</span>
                <span className="stat-value expense">{formatCurrency(totalYear.despesa / 12)}</span>
              </div>
              <div className="year-stat">
                <span className="stat-label">Taxa de Economia</span>
                <span className={`stat-value ${totalYear.receita - totalYear.despesa >= 0 ? 'income' : 'expense'}`}>
                  {totalYear.receita > 0 
                    ? ((totalYear.receita - totalYear.despesa) / totalYear.receita * 100).toFixed(1) 
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {categoryData.length > 0 && (
          <div className="card category-breakdown">
            <h3>Detalhamento por Categoria - {MONTHS[selectedMonth - 1]}</h3>
            <div className="breakdown-list">
              {categoryData.map((cat, index) => (
                <div key={index} className="breakdown-item">
                  <div className="breakdown-info">
                    <span 
                      className="breakdown-icon" 
                      style={{ backgroundColor: cat.color || COLORS[index % COLORS.length] }}
                    >
                      {cat.type === 'receita' ? <FiTrendingUp /> : <FiTrendingDown />}
                    </span>
                    <span className="breakdown-name">{cat.name || 'Sem categoria'}</span>
                  </div>
                  <div className="breakdown-values">
                    <span className="breakdown-count">{cat.count} transações</span>
                    <span className="breakdown-total">{formatCurrency(cat.total)}</span>
                  </div>
                  <div className="breakdown-bar">
                    <div 
                      className="breakdown-bar-fill"
                      style={{ 
                        width: `${(cat.total / categoryData.reduce((s, c) => s + c.total, 0)) * 100}%`,
                        backgroundColor: cat.color || COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;
