import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

/**
 * Hook que encapsula toda a lógica do Dashboard
 */
export const useDashboardLogic = () => {
  const { token, user } = useAuth();
  const [summary, setSummary] = useState({ receita: 0, despesa: 0, saldo: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [transactionCount, setTransactionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [financialScore, setFinancialScore] = useState(0);

  useEffect(() => {
    loadData();
  }, [period]);

  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        endDate = new Date();
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  };

  const loadData = async () => {
    try {
      const { startDate, endDate } = getDateRange();

      const [summaryData, transactionsData, goalsData, allTransactionsData] = await Promise.all([
        api.getSummary(token, startDate, endDate),
        api.getTransactions(token, { limit: 5 }),
        api.getGoals(token, 'active'),
        api.getTransactions(token, { startDate, endDate })
      ]);

      if (summaryData.summary) {
        setSummary(summaryData.summary);
      }

      if (transactionsData.transactions) {
        setRecentTransactions(transactionsData.transactions);
      }

      if (goalsData.goals) {
        setGoals(goalsData.goals);
      }

      if (allTransactionsData.transactions) {
        setTransactionCount(allTransactionsData.transactions.length);
      }

      // Calcular score financeiro
      const score = calculateFinancialScore(
        summaryData.summary,
        allTransactionsData.transactions?.length || 0,
        goalsData.goals || []
      );
      setFinancialScore(score);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calculateFinancialScore = (summaryData, transactionsCount, goalsData) => {
    let score = 0;

    // 30% - Disciplina (registros no mês)
    const disciplineScore = Math.min((transactionsCount / 10) * 300, 300);
    score += disciplineScore;

    // 30% - Controle (gastos vs receita)
    const receita = parseFloat(summaryData?.receita) || 0;
    const despesa = parseFloat(summaryData?.despesa) || 0;
    
    if (receita > 0) {
      const spendingRatio = despesa / receita;
      if (spendingRatio <= 0.5) {
        score += 300;
      } else if (spendingRatio <= 0.7) {
        score += 250;
      } else if (spendingRatio <= 0.9) {
        score += 150;
      } else if (spendingRatio < 1) {
        score += 100;
      }
    }

    // 20% - Crescimento (saldo positivo)
    const saldo = receita - despesa;
    if (saldo > 0) {
      const growthRatio = saldo / (receita || 1);
      score += Math.min(growthRatio * 1000, 200);
    }

    // 20% - Metas (cumprimento)
    if (goalsData && goalsData.length > 0) {
      const completedGoals = goalsData.filter(g => g.status === 'completed').length;
      const activeGoals = goalsData.filter(g => g.status === 'active');
      
      score += completedGoals * 50;
      
      activeGoals.forEach(goal => {
        const progress = (parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100;
        score += Math.min(progress, 100) * 0.5;
      });
    } else {
      score += 50;
    }

    return Math.min(Math.round(score), 1000);
  };

  return {
    // Estado
    user,
    summary,
    recentTransactions,
    goals,
    transactionCount,
    loading,
    period,
    financialScore,
    // Ações
    setPeriod,
    loadData
  };
};

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
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Bom dia';
  } else if (hour >= 12 && hour < 18) {
    return 'Boa tarde';
  } else {
    return 'Boa noite';
  }
};

export const getScoreColor = (score) => {
  if (score >= 800) return '#10b981';
  if (score >= 600) return '#34d399';
  if (score >= 400) return '#fbbf24';
  if (score >= 200) return '#f59e0b';
  return '#ef4444';
};

export const getScoreLabel = (score) => {
  if (score >= 800) return 'Excelente';
  if (score >= 600) return 'Muito Bom';
  if (score >= 400) return 'Bom';
  if (score >= 200) return 'Regular';
  return 'Precisa Melhorar';
};
