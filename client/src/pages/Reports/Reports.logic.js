import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

/**
 * Hook que encapsula toda a lógica de Reports
 */
export const useReportsLogic = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [summary, setSummary] = useState({ receita: 0, despesa: 0, saldo: 0 });
  const [lifetimeStats, setLifetimeStats] = useState({ total_receitas: 0, total_despesas: 0, saldo_total: 0 });
  
  // Estados para exportação
  const [exportStartDate, setExportStartDate] = useState('');
  const [exportEndDate, setExportEndDate] = useState('');

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
      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
      
      const [summaryData, breakdownData, paymentMethodsData, lifetimeData] = await Promise.all([
        api.getSummary(token, startDate, endDate),
        api.getCategoryBreakdown(token, 'despesa', startDate, endDate),
        api.getPaymentMethodBreakdown(token, startDate, endDate),
        api.getLifetimeStats(token)
      ]);

      if (summaryData.summary) {
        setSummary(summaryData.summary);
      }

      if (breakdownData.breakdown) {
        setCategoryData(breakdownData.breakdown);
      }

      if (paymentMethodsData.breakdown) {
        setPaymentMethodData(paymentMethodsData.breakdown);
      }

      if (lifetimeData.stats) {
        setLifetimeStats(lifetimeData.stats);
      }

      await loadYearlyData();
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadYearlyData = async () => {
    try {
      const yearlyData = await api.getYearlySummary(token, selectedYear);
      
      if (yearlyData.months) {
        setMonthlyData(yearlyData.months);
      }
    } catch (error) {
      console.error('Erro ao carregar dados anuais:', error);
      setMonthlyData([]);
    }
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

      const totals = transactions.reduce((acc, t) => {
        const amount = parseFloat(t.amount) || 0;
        if (t.type === 'receita') {
          acc.receita += amount;
        } else {
          acc.despesa += amount;
        }
        return acc;
      }, { receita: 0, despesa: 0 });

      const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor (R$)'];
      
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

      const summaryRows = [
        [''],
        ['RESUMO DO PERÍODO'],
        ['Total de Receitas', '', '', '', totals.receita.toFixed(2).replace('.', ',')],
        ['Total de Despesas', '', '', '', totals.despesa.toFixed(2).replace('.', ',')],
        ['Saldo', '', '', '', (totals.receita - totals.despesa).toFixed(2).replace('.', ',')],
        [''],
        ['Total de Transações', transactions.length.toString()]
      ];

      const csvContent = [
        `"Relatório de Transações";"${formatDate(exportStartDate)} a ${formatDate(exportEndDate)}"`,
        '',
        headers.join(';'),
        ...rows.map(row => row.join(';')),
        ...summaryRows.map(row => row.join(';'))
      ].join('\n');

      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      
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

    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      alert('Erro ao exportar relatório. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  // Cálculos derivados
  const totalYear = monthlyData.reduce((acc, m) => ({
    receita: acc.receita + m.receita,
    despesa: acc.despesa + m.despesa
  }), { receita: 0, despesa: 0 });

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return {
    // Estado
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
    // Ações
    setSelectedYear,
    setSelectedMonth,
    setExportStartDate,
    setExportEndDate,
    exportToCSV
  };
};

/**
 * Constantes
 */
export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const COLORS = [
  '#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899', 
  '#14b8a6', '#8b5cf6', '#f43f5e', '#3b82f6', '#64748b'
];

/**
 * Funções utilitárias de formatação
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
};

export const formatPaymentMethod = (method) => {
  if (!method) return 'Não especificado';
  
  const methods = {
    'credit_card': 'Cartão de Crédito',
    'debit_card': 'Cartão de Débito',
    'cash': 'Dinheiro',
    'pix': 'PIX',
    'bank_transfer': 'Transferência Bancária',
    'bank_slip': 'Boleto',
    'other': 'Outro'
  };
  
  if (methods[method]) return methods[method];
  
  return method
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
