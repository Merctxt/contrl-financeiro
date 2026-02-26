import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Layout from '../../components/Layout/Layout';
import NotificationPanel from '../../components/NotificationPanel/NotificationPanel';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiActivity } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Bom dia';
    } else if (hour >= 12 && hour < 18) {
      return 'Boa tarde';
    } else {
      return 'Boa noite';
    }
  };

  const calculateFinancialScore = (summaryData, transactionsCount, goalsData) => {
    let score = 0;

    // 30% - Disciplina (registros no mês)
    // Considera bom ter pelo menos 10 transações no mês
    const disciplineScore = Math.min((transactionsCount / 10) * 300, 300);
    score += disciplineScore;

    // 30% - Controle (gastos vs receita)
    // Melhor score quando despesas são menores que receitas
    const receita = parseFloat(summaryData?.receita) || 0;
    const despesa = parseFloat(summaryData?.despesa) || 0;
    
    if (receita > 0) {
      const spendingRatio = despesa / receita;
      if (spendingRatio <= 0.5) {
        score += 300; // Excelente controle
      } else if (spendingRatio <= 0.7) {
        score += 250; // Bom controle
      } else if (spendingRatio <= 0.9) {
        score += 150; // Controle moderado
      } else if (spendingRatio < 1) {
        score += 100; // Controle básico
      } else {
        score += 0; // Gastando mais que ganha
      }
    }

    // 20% - Crescimento (saldo positivo)
    const saldo = receita - despesa;
    if (saldo > 0) {
      const growthRatio = saldo / (receita || 1);
      score += Math.min(growthRatio * 1000, 200); // Máximo 200 pontos
    }

    // 20% - Metas (cumprimento)
    if (goalsData && goalsData.length > 0) {
      const completedGoals = goalsData.filter(g => g.status === 'completed').length;
      const activeGoals = goalsData.filter(g => g.status === 'active');
      
      // Pontos por metas concluídas
      score += completedGoals * 50;
      
      // Pontos por progresso em metas ativas
      activeGoals.forEach(goal => {
        const progress = (parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100;
        score += Math.min(progress, 100) * 0.5; // Até 50 pontos por meta
      });
    } else {
      // Sem metas, dá 50 pontos (10% do total possível) para não penalizar muito
      score += 50;
    }

    return Math.min(Math.round(score), 1000); // Limita a 1000
  };

  const getScoreColor = (score) => {
    if (score >= 800) return '#10b981'; // Verde forte
    if (score >= 600) return '#34d399'; // Verde
    if (score >= 400) return '#fbbf24'; // Amarelo
    if (score >= 200) return '#f59e0b'; // Laranja
    return '#ef4444'; // Vermelho
  };

  const getScoreLabel = (score) => {
    if (score >= 800) return 'Excelente';
    if (score >= 600) return 'Muito Bom';
    if (score >= 400) return 'Bom';
    if (score >= 200) return 'Regular';
    return 'Precisa Melhorar';
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
      <div className="dashboard fade-in">
        <div className="dashboard-header">
          <div>
            <h1>{getGreeting()}, {user?.name?.split(' ')[0]}!</h1>
            <p>Aqui está o resumo das suas finanças</p>
          </div>
          <div className="period-selector">
            <button 
              className={`btn ${period === 'week' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPeriod('week')}
            >
              7 dias
            </button>
            <button 
              className={`btn ${period === 'month' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPeriod('month')}
            >
              Este mês
            </button>
            <button 
              className={`btn ${period === 'year' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPeriod('year')}
            >
              Este ano
            </button>
            <NotificationPanel />
          </div>
        </div>

        <div className="summary-cards">
          <div className="summary-card income">
            <div className="summary-icon"><FiTrendingUp /></div>
            <div className="summary-info">
              <span className="summary-label">Receitas</span>
              <span className="summary-value">{formatCurrency(summary.receita)}</span>
            </div>
          </div>

          <div className="summary-card expense">
            <div className="summary-icon"><FiTrendingDown /></div>
            <div className="summary-info">
              <span className="summary-label">Despesas</span>
              <span className="summary-value">{formatCurrency(summary.despesa)}</span>
            </div>
          </div>

          <div className={`summary-card balance ${summary.saldo >= 0 ? 'positive' : 'negative'}`}>
            <div className="summary-icon"><FiDollarSign /></div>
            <div className="summary-info">
              <span className="summary-label">Saldo</span>
              <span className="summary-value">{formatCurrency(summary.saldo)}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="card chart-card score-card">
            <div className="score-header">
              <h3><FiActivity /> Seu Score Financeiro</h3>
              <span className="score-subtitle">Avaliação da sua maturidade financeira</span>
            </div>
            
            <div className="score-gauge">
              <svg viewBox="0 0 200 120" className="gauge-svg">
                {/* Arco de fundo */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="var(--bg-tertiary)"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                
                {/* Arco colorido baseado no score */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke={getScoreColor(financialScore)}
                  strokeWidth="20"
                  strokeLinecap="round"
                  strokeDasharray={`${(financialScore / 1000) * 251.2} 251.2`}
                  style={{ transition: 'all 1s ease-in-out' }}
                />
              </svg>
              
              <div className="score-display">
                <div className="score-number" style={{ color: getScoreColor(financialScore) }}>
                  {financialScore}
                </div>
                <div className="score-max">/ 1000</div>
                <div className="score-label" style={{ color: getScoreColor(financialScore) }}>
                  {getScoreLabel(financialScore)}
                </div>
              </div>
            </div>

            <div className="score-breakdown">
              <div className="score-item">
                <span className="score-item-label">Disciplina</span>
                <span className="score-item-desc">{transactionCount} registros</span>
              </div>
              <div className="score-item">
                <span className="score-item-label">Controle</span>
                <span className="score-item-desc">
                  {summary.receita > 0 
                    ? `${((summary.despesa / summary.receita) * 100).toFixed(0)}% da renda` 
                    : 'N/A'}
                </span>
              </div>
              <div className="score-item">
                <span className="score-item-label">Crescimento</span>
                <span className="score-item-desc">
                  {summary.saldo >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
                </span>
              </div>
              <div className="score-item">
                <span className="score-item-label">Metas</span>
                <span className="score-item-desc">
                  {goals.length} {goals.length === 1 ? 'meta ativa' : 'metas ativas'}
                </span>
              </div>
            </div>
          </div>

          <div className="card transactions-card">
            <div className="card-header">
              <h3>Últimas Transações</h3>
            </div>
            {recentTransactions.length > 0 ? (
              <div className="transactions-list">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-info">
                      <span className="transaction-category">
                        {transaction.category_name || 'Sem categoria'}
                      </span>
                      <span className="transaction-description">{transaction.description}</span>
                      <span className="transaction-date">{formatDate(transaction.date)}</span>
                    </div>
                    <span className={`transaction-amount ${transaction.type}`}>
                      {transaction.type === 'receita' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Nenhuma transação registrada</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
