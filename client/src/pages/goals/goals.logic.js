import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export const useGoalsLogic = () => {
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

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    // Estado
    goals,
    loading,
    saving,
    updatingId,
    completingId,
    deletingId,
    showModal,
    editingGoal,
    filter,
    formData,
    
    // Ações
    setFilter,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleUpdateAmount,
    handleComplete,
    handleDelete,
    handleFormChange,
    
    // Utilitários
    formatCurrency,
    formatDate
  };
};
