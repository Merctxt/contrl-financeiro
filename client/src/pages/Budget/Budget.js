import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Layout from '../../components/Layout/Layout';
import { FiCalendar, FiTag, FiTrendingDown, FiAlertCircle, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import './Budget.css';

const Budget = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalBudget, setTotalBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category_id: '',
    limit_amount: ''
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [budgetsData, categoriesData, totalData] = await Promise.all([
        api.getAllCategoriesWithBudgets(token, selectedMonth, selectedYear),
        api.getCategories(token, 'despesa'),
        api.getTotalBudget(token, selectedMonth, selectedYear)
      ]);

      if (budgetsData.budgets) {
        setBudgets(budgetsData.budgets);
      }

      if (categoriesData.categories) {
        setCategories(categoriesData.categories);
      }

      if (totalData.total) {
        setTotalBudget(totalData.total);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar planejamento');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (budget = null) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        category_id: budget.category_id,
        limit_amount: budget.limit_amount > 0 ? budget.limit_amount : ''
      });
    } else {
      setEditingBudget(null);
      setFormData({
        category_id: '',
        limit_amount: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBudget(null);
    setFormData({
      category_id: '',
      limit_amount: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...formData,
        month: selectedMonth,
        year: selectedYear,
        limit_amount: parseFloat(formData.limit_amount)
      };

      // Se tem ID e has_budget = true, é UPDATE. Caso contrário, é CREATE
      if (editingBudget && editingBudget.id && editingBudget.has_budget) {
        await api.updateBudget(token, editingBudget.id, { limit_amount: data.limit_amount });
      } else {
        await api.createBudget(token, data);
      }

      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      alert('Erro ao salvar orçamento');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente excluir este orçamento?')) {
      return;
    }

    setDeletingId(id);
    try {
      await api.deleteBudget(token, id);
      await loadData();
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      alert('Erro ao excluir orçamento');
    } finally {
      setDeletingId(null);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#ef4444'; // Vermelho
    if (percentage >= 80) return '#f59e0b'; // Laranja
    if (percentage >= 60) return '#eab308'; // Amarelo
    return '#10b981'; // Verde
  };

  const getStatusIcon = (percentage) => {
    if (percentage >= 100) {
      return <FiAlertCircle className="status-icon danger" />;
    }
    if (percentage >= 80) {
      return <FiAlertCircle className="status-icon warning" />;
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
      <div className="budget-page fade-in">
        <div className="page-header">
          <div>
            <h1>Planejamento Mensal</h1>
            <p>Defina metas de gastos por categoria</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate('/categories')}>
            <FiTag /> Gerenciar Categorias
          </button>
        </div>

        <div className="period-selector-budget">
          <FiCalendar className="calendar-icon" />
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

        {totalBudget && (
          <div className="card total-budget-card">
            <h3><FiTrendingDown /> Orçamento Total do Mês</h3>
            <div className="total-budget-content">
              <div className="budget-stats">
                <div className="stat-item">
                  <span className="stat-label">Limite Definido</span>
                  <span className="stat-value limit">{formatCurrency(totalBudget.total_limit)}</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-label">Já Gasto</span>
                  <span className="stat-value spent">{formatCurrency(totalBudget.total_spent)}</span>
                </div>
                <div className="stat-divider"></div>
                <div className="stat-item">
                  <span className="stat-label">Restante</span>
                  <span className={`stat-value ${totalBudget.total_remaining >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(totalBudget.total_remaining)}
                  </span>
                </div>
              </div>
              <div className="total-progress">
                <div className="progress-info">
                  <span>{totalBudget.percentage}% utilizado</span>
                  {getStatusIcon(parseFloat(totalBudget.percentage))}
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(totalBudget.percentage, 100)}%`,
                      backgroundColor: getProgressColor(parseFloat(totalBudget.percentage))
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="budgets-list">
          {budgets.length === 0 ? (
            <div className="empty-state card">
              <FiCalendar className="empty-icon" />
              <h3>Nenhuma categoria de despesa encontrada</h3>
              <p>Crie categorias de despesa para poder gerenciar seus orçamentos</p>
              <button className="btn btn-primary" onClick={() => navigate('/categories')}>
                <FiTag /> Gerenciar Categorias
              </button>
            </div>
          ) : (
            budgets.map((budget) => (
              <div key={budget.category_id} className={`card budget-item ${!budget.has_budget && budget.has_budget !== undefined ? 'no-budget' : ''}`}>
                <div className="budget-header">
                  <div className="category-info">
                    <span className="category-icon" style={{ color: budget.category_color }}>
                      <FiTrendingDown />
                    </span>
                    <div>
                      <h4>{budget.category_name}</h4>
                      <span className="budget-values">
                        {budget.limit_amount > 0 
                          ? `${formatCurrency(budget.spent_amount)} de ${formatCurrency(budget.limit_amount)}`
                          : 'Limite não definido'
                        }
                      </span>
                    </div>
                  </div>
                  <div className="budget-actions">
                    {budget.limit_amount > 0 ? (
                      <>
                        <button
                          className="btn-icon"
                          onClick={() => handleOpenModal(budget)}
                          title="Editar"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          className="btn-icon danger"
                          onClick={() => handleDelete(budget.id)}
                          disabled={deletingId === budget.id}
                          title="Remover Orçamento"
                        >
                          {deletingId === budget.id ? (
                            <div className="btn-spinner small"></div>
                          ) : (
                            <FiTrash2 />
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleOpenModal(budget)}
                      >
                        <FiPlus /> Definir Limite
                      </button>
                    )}
                  </div>
                </div>
                {budget.limit_amount > 0 && (
                  <div className="budget-progress">
                    <div className="progress-info">
                      <span className="percentage">{budget.percentage}%</span>
                      <span className={`remaining ${budget.remaining >= 0 ? 'positive' : 'negative'}`}>
                        {budget.remaining >= 0 ? 'Restam' : 'Excedeu'} {formatCurrency(Math.abs(budget.remaining))}
                      </span>
                      {getStatusIcon(parseFloat(budget.percentage))}
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${Math.min(budget.percentage, 100)}%`,
                          backgroundColor: getProgressColor(parseFloat(budget.percentage))
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingBudget && editingBudget.has_budget ? 'Editar Orçamento' : 'Definir Limite'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Categoria</label>
                  <select
                    className="form-control"
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    required
                    disabled={editingBudget}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Valor Limite</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.limit_amount}
                    onChange={(e) => setFormData({ ...formData, limit_amount: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? (
                      <>
                        <div className="btn-spinner"></div>
                        {editingBudget && editingBudget.has_budget ? 'Atualizando...' : 'Salvando...'}
                      </>
                    ) : (
                      editingBudget && editingBudget.has_budget ? 'Atualizar' : 'Salvar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Budget;
