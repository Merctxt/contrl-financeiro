import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Layout from '../../components/Layout/Layout';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import './Dashboard.css';

const Dashboard = () => {
  const { token, user } = useAuth();
  const [summary, setSummary] = useState({ receita: 0, despesa: 0, saldo: 0 });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

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

      const [summaryData, transactionsData, breakdownData] = await Promise.all([
        api.getSummary(token, startDate, endDate),
        api.getTransactions(token, { limit: 5 }),
        api.getCategoryBreakdown(token, 'despesa', startDate, endDate)
      ]);

      console.log('Breakdown Data:', breakdownData); // Debug

      if (summaryData.summary) {
        setSummary(summaryData.summary);
      }

      if (transactionsData.transactions) {
        setRecentTransactions(transactionsData.transactions);
      }

      if (breakdownData.breakdown) {
        // Garantir que os valores sejam números
        const breakdown = breakdownData.breakdown.map(item => ({
          ...item,
          total: parseFloat(item.total) || 0
        }));
        console.log('Category Breakdown:', breakdown); // Debug
        setCategoryBreakdown(breakdown);
      } else {
        console.log('No breakdown data'); // Debug
        setCategoryBreakdown([]);
      }
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

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#14b8a6', '#8b5cf6', '#f43f5e'];

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
          <div className="card chart-card">
            <h3>Despesas por Categoria</h3>
            {categoryBreakdown && categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total"
                    nameKey="name"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <p>Nenhuma despesa registrada no período</p>
              </div>
            )}
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
