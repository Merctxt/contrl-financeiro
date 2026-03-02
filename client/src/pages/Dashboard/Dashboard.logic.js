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
  const [allGoals, setAllGoals] = useState([]);
  const [transactionCount, setTransactionCount] = useState(0);
  const [totalTransactionCount, setTotalTransactionCount] = useState(0);
  const [lifetimeStats, setLifetimeStats] = useState({ total_receitas: 0, total_despesas: 0, saldo_total: 0 });
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

      // Dados do período selecionado + dados globais para o score
      const [
        summaryData, 
        transactionsData, 
        goalsData, 
        allTransactionsData,
        lifetimeData,
        allTransactionsGlobal,
        allGoalsData
      ] = await Promise.all([
        api.getSummary(token, startDate, endDate),
        api.getTransactions(token, { limit: 5 }),
        api.getGoals(token, 'active'),
        api.getTransactions(token, { startDate, endDate }),
        api.getLifetimeStats(token),
        api.getTransactions(token, {}),  // Todas as transações (sem filtro)
        api.getGoals(token)               // Todas as metas
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

      // Dados globais para o score
      if (lifetimeData.stats) {
        setLifetimeStats(lifetimeData.stats);
      }

      if (allTransactionsGlobal.transactions) {
        setTotalTransactionCount(allTransactionsGlobal.transactions.length);
      }

      if (allGoalsData.goals) {
        setAllGoals(allGoalsData.goals);
      }

      // Calcular score financeiro com dados de TODO O PERÍODO
      const score = calculateFinancialScore(
        lifetimeData.stats,
        allTransactionsGlobal.transactions?.length || 0,
        allGoalsData.goals || []
      );
      setFinancialScore(score);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calculateFinancialScore = (lifetimeData, transactionsCount, goalsData) => {
    let score = 0;

    // 30% - Disciplina (total de registros)
    // Considera bom ter pelo menos 20 transações no histórico
    const disciplineScore = Math.min((transactionsCount / 20) * 300, 300);
    score += disciplineScore;

    // 40% - Controle (gastos vs receita de todo o período)
    const receita = parseFloat(lifetimeData?.total_receitas) || 0;
    const despesa = parseFloat(lifetimeData?.total_despesas) || 0;
    
    if (receita > 0) {
      const spendingRatio = despesa / receita;
      if (spendingRatio <= 0.3) {
        score += 400;
      } else if (spendingRatio <= 0.4) {
        score += 320;
      } else if (spendingRatio <= 0.5) {
        score += 250;
      } else if (spendingRatio <= 0.6) {
        score += 150;
      } else if (spendingRatio <= 0.7) {
        score += 110;
      } else if (spendingRatio <= 0.8) {
        score += 50;
      } else if (spendingRatio < 1) {
        score += 20;
      } else if (spendingRatio < 1.2) {
        score += -10;
      } else if (spendingRatio < 1.3) {
        score += -50;
      } else if (spendingRatio < 1.4) {
        score += -100;
      } else {
        score += -200;
    }
  }

    // 20% - Crescimento (saldo final positivo ou negativo)
    const saldo = parseFloat(lifetimeData?.saldo_total);
    if (saldo > 0) {
      score += 200;  // Saldo positivo: pontuação máxima
    } else if (saldo < 0) {
      score += -100; // Saldo negativo: penalização
    }

    // 10% - Metas (cumprimento)
    if (goalsData && goalsData.length > 0) {
      const completedGoals = goalsData.filter(g => g.status === 'completed').length;
      const activeGoals = goalsData.filter(g => g.status === 'active');
      
      // Max 100 pts (10%)
      const completedScore = Math.min(completedGoals * 25, 50);
      score += completedScore;
      
      // Progresso das metas ativas (max 50 pts)
      let activeProgress = 0;
      activeGoals.forEach(goal => {
        const progress = (parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100;
        activeProgress += Math.min(progress, 100);
      });
      if (activeGoals.length > 0) {
        score += Math.min((activeProgress / activeGoals.length) * 0.5, 50);
      }
    } else {
      // Sem metas = 50% do score de metas
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
    totalTransactionCount,
    lifetimeStats,
    allGoals,
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
