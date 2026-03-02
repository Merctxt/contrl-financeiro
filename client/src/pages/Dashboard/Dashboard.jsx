import React from 'react';
import Layout from '../../components/Layout/Layout';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiActivity } from 'react-icons/fi';
import { 
  useDashboardLogic, 
  formatCurrency, 
  formatDate, 
  getGreeting, 
  getScoreColor, 
  getScoreLabel 
} from './Dashboard.logic';
import './Dashboard.css';

const Dashboard = () => {
  const {
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
    setPeriod
  } = useDashboardLogic();

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
          </div>
        </div>

        <div className="summary-cards-dashboard">
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
                <span className="score-item-desc">{totalTransactionCount} registros</span>
              </div>
              <div className="score-item">
                <span className="score-item-label">Controle</span>
                <span className="score-item-desc">
                  {parseFloat(lifetimeStats.total_receitas) > 0 
                    ? `${((parseFloat(lifetimeStats.total_despesas) / parseFloat(lifetimeStats.total_receitas)) * 100).toFixed(0)}% gastos` 
                    : 'N/A'}
                </span>
              </div>
              <div className="score-item">
                <span className="score-item-label">Crescimento</span>
                <span className="score-item-desc">
                  {parseFloat(lifetimeStats.saldo_total) >= 0 ? 'Saldo positivo' : 'Saldo negativo'}
                </span>
              </div>
              <div className="score-item">
                <span className="score-item-label">Metas</span>
                <span className="score-item-desc">
                  {allGoals.filter(g => g.status === 'completed').length} concluídas, {allGoals.filter(g => g.status === 'active').length} ativas
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
