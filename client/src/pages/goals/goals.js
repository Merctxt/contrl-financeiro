import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Layout from '../../components/Layout/Layout';
import { FiTarget, FiPlus, FiEdit2, FiTrash2, FiCheck, FiCalendar, FiTrendingUp, FiDollarSign } from 'react-icons/fi';
import './goals.css';

const Goals = () => {
  const { token } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filter, setFilter] = useState('active');

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    deadline: '',
    status: 'active'
  });

  useEffect(() => {
    loadGoals();
  }, [filter]);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const data = await api.getGoals(token, filter === 'all' ? null : filter);
      if (data.goals) {
        setGoals(data.goals);
      }
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        name: goal.name,
        target_amount: goal.target_amount,
        current_amount: goal.current_amount,
        deadline: goal.deadline.split('T')[0],
        status: goal.status
      });
    } else {
      setEditingGoal(null);
      setFormData({
        name: '',
        target_amount: '',
        current_amount: '0',
        deadline: '',
        status: 'active'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGoal(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingGoal) {
        await api.updateGoal(token, editingGoal.id, formData);
      } else {
        await api.createGoal(token, formData);
      }
      handleCloseModal();
      loadGoals();
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      alert('Erro ao salvar meta');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAmount = async (goalId, currentAmount) => {
    const newAmount = prompt('Digite o valor já guardado:', currentAmount);
    if (newAmount === null) return;

    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount < 0) {
      alert('Valor inválido');
      return;
    }

    setUpdatingId(goalId);
    try {
      await api.updateGoalAmount(token, goalId, amount);
      loadGoals();
    } catch (error) {
      console.error('Erro ao atualizar valor:', error);
      alert('Erro ao atualizar valor');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleComplete = async (goalId) => {
    if (!window.confirm('Parabéns! Deseja marcar esta meta como concluída?')) {
      return;
    }

    setCompletingId(goalId);
    try {
      await api.completeGoal(token, goalId);
      loadGoals();
    } catch (error) {
      console.error('Erro ao concluir meta:', error);
      alert('Erro ao concluir meta');
    } finally {
      setCompletingId(null);
    }
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta meta?')) {
      return;
    }

    setDeletingId(goalId);
    try {
      await api.deleteGoal(token, goalId);
      loadGoals();
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      alert('Erro ao excluir meta');
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
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
      <div className="goals-page fade-in">
        <div className="page-header">
          <div>
            <h1>Metas Financeiras</h1>
            <p>Defina e acompanhe suas metas de economia</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => handleOpenModal()}
          >
            <FiPlus /> Nova Meta
          </button>
        </div>

        {/* Filtros */}
        <div className="goals-filters">
          <button 
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Ativas
          </button>
          <button 
            className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Concluídas
          </button>
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
        </div>

        {/* Lista de Metas */}
        <div className="goals-grid">
          {goals.length === 0 ? (
            <div className="empty-state">
              <FiTarget size={64} />
              <h3>Nenhuma meta encontrada</h3>
              <p>Crie sua primeira meta financeira e comece a economizar!</p>
            </div>
          ) : (
            goals.map((goal) => (
              <div key={goal.id} className={`goal-card ${goal.status}`}>
                <div className="goal-header">
                  <h3>{goal.name}</h3>
                  <div className="goal-actions">
                    {goal.status === 'active' && (
                      <>
                        <button 
                          onClick={() => handleUpdateAmount(goal.id, goal.current_amount)} 
                          title="Atualizar valor"
                          disabled={updatingId === goal.id || deletingId === goal.id}
                        >
                          {updatingId === goal.id ? (
                            <span className="btn-spinner small"></span>
                          ) : (
                            <FiDollarSign />
                          )}
                        </button>
                        <button 
                          onClick={() => handleOpenModal(goal)} 
                          title="Editar"
                          disabled={updatingId === goal.id || deletingId === goal.id}
                        >
                          <FiEdit2 />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => handleDelete(goal.id)} 
                      title="Excluir"
                      disabled={deletingId === goal.id || updatingId === goal.id}
                    >
                      {deletingId === goal.id ? (
                        <span className="btn-spinner small"></span>
                      ) : (
                        <FiTrash2 />
                      )}
                    </button>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="progress-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{goal.progress}%</span>
                </div>

                {/* Valores */}
                <div className="goal-amounts">
                  <div className="amount-item">
                    <span className="amount-label">Guardado</span>
                    <span className="amount-value current">{formatCurrency(goal.current_amount)}</span>
                  </div>
                  <div className="amount-item">
                    <span className="amount-label">Meta</span>
                    <span className="amount-value target">{formatCurrency(goal.target_amount)}</span>
                  </div>
                </div>

                {/* Informações */}
                <div className="goal-info">
                  <div className="info-item">
                    <FiTrendingUp />
                    <div>
                      <span className="info-label">Faltam</span>
                      <span className="info-value">{formatCurrency(goal.remaining)}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <FiCalendar />
                    <div>
                      <span className="info-label">Prazo</span>
                      <span className="info-value">{formatDate(goal.deadline)}</span>
                    </div>
                  </div>
                </div>

                {goal.status === 'active' && (
                  <div className="goal-stats">
                    <div className="stat-box">
                      <span className="stat-label">Meses restantes</span>
                      <span className="stat-value">{goal.months_remaining}</span>
                    </div>
                    <div className="stat-box highlight">
                      <span className="stat-label">Guardar por mês</span>
                      <span className="stat-value">{formatCurrency(goal.monthly_target)}</span>
                    </div>
                  </div>
                )}

                {goal.status === 'active' && goal.progress >= 100 && (
                  <button 
                    className="btn btn-success btn-complete"
                    onClick={() => handleComplete(goal.id)}
                    disabled={completingId === goal.id}
                  >
                    {completingId === goal.id ? (
                      <>
                        <span className="btn-spinner"></span>
                        Concluindo...
                      </>
                    ) : (
                      <>
                        <FiCheck /> Marcar como Concluída
                      </>
                    )}
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingGoal ? 'Editar Meta' : 'Nova Meta'}</h2>
                <button className="modal-close" onClick={handleCloseModal}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Nome da Meta</label>
                  <input
                    type="text"
                    id="name"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Viagem para o Japão"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="target_amount">Valor Alvo</label>
                    <input
                      type="number"
                      id="target_amount"
                      className="form-control"
                      value={formData.target_amount}
                      onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                      placeholder="15000"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="current_amount">Já Guardado</label>
                    <input
                      type="number"
                      id="current_amount"
                      className="form-control"
                      value={formData.current_amount}
                      onChange={(e) => setFormData({...formData, current_amount: e.target.value})}
                      placeholder="0"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="deadline">Prazo Final</label>
                    <input
                      type="date"
                      id="deadline"
                      className="form-control"
                      value={formData.deadline}
                      onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                      required
                    />
                  </div>
                  {editingGoal && (
                    <div className="form-group">
                      <label htmlFor="status">Status</label>
                      <select
                        id="status"
                        className="form-control"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="active">Ativa</option>
                        <option value="completed">Concluída</option>
                        <option value="cancelled">Cancelada</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={saving}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? (
                      <>
                        <span className="btn-spinner"></span>
                        {editingGoal ? 'Atualizando...' : 'Criando...'}
                      </>
                    ) : (
                      editingGoal ? 'Atualizar' : 'Criar Meta'
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

export default Goals;
