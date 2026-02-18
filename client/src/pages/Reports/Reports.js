import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Layout from '../../components/Layout/Layout';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiDownload } from 'react-icons/fi';
import './Reports.css';

const Reports = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [summary, setSummary] = useState({ receita: 0, despesa: 0, saldo: 0 });
  
  // Estados para exportação
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#14b8a6', '#8b5cf6', '#f43f5e', '#3b82f6', '#64748b'];

  useEffect(() => {
    // Definir datas padrão de exportação (mês atual)
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    setExportStartDate(`${year}-${String(month).padStart(2, '0')}-01`);
    setExportEndDate(new Date(year, month, 0).toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    loadReportData();
  }, [selectedYear, selectedMonth]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Carregar dados do mês selecionado
      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
      
      const [summaryData, breakdownData] = await Promise.all([
        api.getSummary(token, startDate, endDate),
        api.getCategoryBreakdown(token, 'despesa', startDate, endDate)
      ]);

      if (summaryData.summary) {
        setSummary(summaryData.summary);
      }

      if (breakdownData.breakdown) {
        setCategoryData(breakdownData.breakdown);
      }

      // Carregar dados mensais do ano
      await loadYearlyData();
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadYearlyData = async () => {
    const monthlyResults = [];
    
    for (let month = 1; month <= 12; month++) {
      const startDate = `${selectedYear}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(selectedYear, month, 0).toISOString().split('T')[0];
      
      try {
        const data = await api.getSummary(token, startDate, endDate);
        monthlyResults.push({
          month: months[month - 1].substring(0, 3),
          fullMonth: months[month - 1],
          receita: data.summary?.receita || 0,
          despesa: data.summary?.despesa || 0,
          saldo: (data.summary?.receita || 0) - (data.summary?.despesa || 0)
        });
      } catch (error) {
        monthlyResults.push({
          month: months[month - 1].substring(0, 3),
          fullMonth: months[month - 1],
          receita: 0,
          despesa: 0,
          saldo: 0
        });
      }
    }
    
    setMonthlyData(monthlyResults);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  const exportToCSV = async () => {
    if (!exportStartDate || !exportEndDate) {
      alert('Por favor, selecione o período para exportação');
      return;
    }

    if (new Date(exportStartDate) > new Date(exportEndDate)) {
      alert('Data inicial não pode ser maior que data final');
      return;
    }

    setExporting(true);
    try {
      // Buscar todas as transações do período
      const response = await api.getTransactions(token, {
        startDate: exportStartDate,
        endDate: exportEndDate
      });

      const transactions = response.transactions || [];

      if (transactions.length === 0) {
        alert('Nenhuma transação encontrada no período selecionado');
        setExporting(false);
        return;
      }

      // Calcular totais
      const totals = transactions.reduce((acc, t) => {
        const amount = parseFloat(t.amount) || 0;
        if (t.type === 'receita') {
          acc.receita += amount;
        } else {
          acc.despesa += amount;
        }
        return acc;
      }, { receita: 0, despesa: 0 });

      // Criar cabeçalhos do CSV
      const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor (R$)'];
      
      // Criar linhas do CSV
      const rows = transactions.map(t => {
        const amount = parseFloat(t.amount) || 0;
        return [
          formatDate(t.date),
          `"${(t.description || '').replace(/"/g, '""')}"`,
          `"${(t.category_name || 'Sem categoria').replace(/"/g, '""')}"`,
          t.type === 'receita' ? 'Receita' : 'Despesa',
          amount.toFixed(2).replace('.', ',')
        ];
      });

      // Adicionar linhas de resumo
      const summaryRows = [
        [''],
        ['RESUMO DO PERÍODO'],
        ['Total de Receitas', '', '', '', totals.receita.toFixed(2).replace('.', ',')],
        ['Total de Despesas', '', '', '', totals.despesa.toFixed(2).replace('.', ',')],
        ['Saldo', '', '', '', (totals.receita - totals.despesa).toFixed(2).replace('.', ',')],
        [''],
        ['Total de Transações', transactions.length.toString()]
      ];

      // Combinar cabeçalhos e linhas
      const csvContent = [
        `"Relatório de Transações";"${formatDate(exportStartDate)} a ${formatDate(exportEndDate)}"`,
        '',
        headers.join(';'),
        ...rows.map(row => row.join(';')),
        ...summaryRows.map(row => row.join(';'))
      ].join('\n');

      // Adicionar BOM para Excel reconhecer UTF-8
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
      // Criar link de download
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const startFormatted = formatDate(exportStartDate).replace(/\//g, '-');
      const endFormatted = formatDate(exportEndDate).replace(/\//g, '-');
      const filename = `relatorio_${startFormatted}_a_${endFormatted}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(`✅ Relatório exportado com sucesso!\n\nPeríodo: ${formatDate(exportStartDate)} a ${formatDate(exportEndDate)}\nTransações: ${transactions.length}\n\nReceitas: ${formatCurrency(totals.receita)}\nDespesas: ${formatCurrency(totals.despesa)}\nSaldo: ${formatCurrency(totals.receita - totals.despesa)}`);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      alert('❌ Erro ao exportar relatório. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

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

  const totalYear = monthlyData.reduce((acc, m) => ({
    receita: acc.receita + m.receita,
    despesa: acc.despesa + m.despesa
  }), { receita: 0, despesa: 0 });

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

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
              {months.map((month, index) => (
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
          <div className="summary-card income">
            <div className="summary-icon"><FiTrendingUp /></div>
            <div className="summary-info">
              <span className="summary-label">Receitas ({months[selectedMonth - 1]})</span>
              <span className="summary-value">{formatCurrency(summary.receita)}</span>
            </div>
          </div>

          <div className="summary-card expense">
            <div className="summary-icon"><FiTrendingDown /></div>
            <div className="summary-info">
              <span className="summary-label">Despesas ({months[selectedMonth - 1]})</span>
              <span className="summary-value">{formatCurrency(summary.despesa)}</span>
            </div>
          </div>

          <div className={`summary-card balance ${summary.saldo >= 0 ? 'positive' : 'negative'}`}>
            <div className="summary-icon"><FiDollarSign /></div>
            <div className="summary-info">
              <span className="summary-label">Saldo ({months[selectedMonth - 1]})</span>
              <span className="summary-value">{formatCurrency(summary.saldo)}</span>
            </div>
          </div>
        </div>

        <div className="report-grid">
          <div className="card chart-card full-width">
            <h3>Evolução Mensal - {selectedYear}</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value).replace('R$', '')} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="receita" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesa" name="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

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
            <h3>Despesas por Categoria - {months[selectedMonth - 1]}</h3>
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

        {categoryData.length > 0 && (
          <div className="card category-breakdown">
            <h3>Detalhamento por Categoria - {months[selectedMonth - 1]}</h3>
            <div className="breakdown-list">
              {categoryData.map((cat, index) => (
                <div key={index} className="breakdown-item">
                  <div className="breakdown-info">
                    <span 
                      className="breakdown-icon" 
                      style={{ backgroundColor: cat.color || COLORS[index % COLORS.length] }}
                    >
                      {cat.icon || '📦'}
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
