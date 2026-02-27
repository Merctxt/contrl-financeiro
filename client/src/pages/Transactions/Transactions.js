import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Layout from '../../components/Layout/Layout';
import TransactionModal from '../../components/TransactionModal/TransactionModal';
import { FiPlus, FiEdit2, FiTrash2, FiFilter, FiX, FiDollarSign, FiTag } from 'react-icons/fi';
import './Transactions.css';
import { Link } from 'react-router-dom';

const Transactions = () => {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    category_id: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transactionsData, categoriesData] = await Promise.all([
        api.getTransactions(token, filters),
        api.getCategories(token)
      ]);

      if (transactionsData.transactions) {
        setTransactions(transactionsData.transactions);
      }

      if (categoriesData.categories) {
        setCategories(categoriesData.categories);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    setLoading(true);
    try {
      const data = await api.getTransactions(token, filters);
      if (data.transactions) {
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Erro ao filtrar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      type: '',
      category_id: '',
      startDate: '',
      endDate: ''
    });
    loadData();
  };

  const handleSaveTransaction = async (data) => {
    try {
      if (editingTransaction) {
        await api.updateTransaction(token, editingTransaction.id, data);
      } else {
        await api.createTransaction(token, data);
      }
      setShowModal(false);
      setEditingTransaction(null);
      loadData();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      setDeletingId(id);
      try {
        await api.deleteTransaction(token, id);
        loadData();
      } catch (error) {
        console.error('Erro ao excluir transação:', error);
      } finally {
        setDeletingId(null);
      }
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

  const totalReceitas = transactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const totalDespesas = transactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  if (loading) {
    return (
      <Layout>
        <div className="spinner"></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="transactions-page fade-in">
        <div className="page-header">
          <div>
            <h1>Transações</h1>
            <p>Gerencie suas receitas e despesas</p>
          </div>

          <div className="page-header-actions">
            <Link to="/categories" className="btn btn-secondary">
              <FiTag /> Gerenciar Categorias
            </Link>

            <button 
              className="btn btn-primary"
              onClick={() => {
                setEditingTransaction(null);
                setShowModal(true);
              }}
            >
              <FiPlus /> Nova Transação
            </button>
          </div>
        </div>

        <div className="card filters-card">
          <h3>Filtros</h3>
          <div className="filters-grid">
            <div className="form-group">
              <label>Tipo</label>
              <select
                className="form-control"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="">Todos</option>
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </select>
            </div>

            <div className="form-group">
              <label>Categoria</label>
              <select
                className="form-control"
                value={filters.category_id}
                onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
              >
                <option value="">Todas</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Data Inicial</label>
              <input
                type="date"
                className="form-control"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Data Final</label>
              <input
                type="date"
                className="form-control"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="filters-actions">
            <button className="btn btn-primary" onClick={handleFilter}>
              Aplicar Filtros
            </button>
            <button className="btn btn-secondary" onClick={handleClearFilters}>
              Limpar
            </button>
          </div>
        </div>

        <div className="totals-bar">
          <div className="total-item">
            <span className="total-label">Total Receitas:</span>
            <span className="total-value income">{formatCurrency(totalReceitas)}</span>
          </div>
          <div className="total-item">
            <span className="total-label">Total Despesas:</span>
            <span className="total-value expense">{formatCurrency(totalDespesas)}</span>
          </div>
          <div className="total-item">
            <span className="total-label">Saldo:</span>
            <span className={`total-value ${totalReceitas - totalDespesas >= 0 ? 'income' : 'expense'}`}>
              {formatCurrency(totalReceitas - totalDespesas)}
            </span>
          </div>
        </div>

        <div className="card">
          {transactions.length > 0 ? (
            <div className="transactions-table-wrapper">
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{formatDate(transaction.date)}</td>
                      <td>{transaction.description}</td>
                      <td>
                        <span 
                          className="category-badge"
                          style={{ backgroundColor: transaction.category_color || '#6366f1' }}
                        >
                          {transaction.category_name || 'Sem categoria'}
                        </span>
                      </td>
                      <td>
                        <span className={`type-badge ${transaction.type}`}>
                          {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td className={`amount ${transaction.type}`}>
                        {transaction.type === 'receita' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td>
                        <div className="actions">
                          <button 
                            className="btn-icon edit"
                            onClick={() => handleEdit(transaction)}
                            title="Editar"
                            disabled={deletingId === transaction.id}
                          >
                            <FiEdit2 />
                          </button>
                          <button 
                            className="btn-icon delete"
                            onClick={() => handleDelete(transaction.id)}
                            title="Excluir"
                            disabled={deletingId === transaction.id}
                          >
                            {deletingId === transaction.id ? (
                              <span className="btn-spinner small"></span>
                            ) : (
                              <FiTrash2 />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <FiDollarSign className="empty-icon" size={48} />
              <p>Nenhuma transação encontrada</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowModal(true)}
              >
                <FiPlus /> Adicionar Transação
              </button>
            </div>
          )}
        </div>

        {showModal && (
          <TransactionModal
            transaction={editingTransaction}
            categories={categories}
            onSave={handleSaveTransaction}
            onClose={() => {
              setShowModal(false);
              setEditingTransaction(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default Transactions;
