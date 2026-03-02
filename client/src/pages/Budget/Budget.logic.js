import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

// Constantes
export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

// Funções utilitárias
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
};

export const getProgressColor = (percentage) => {
  if (percentage >= 100) return '#ef4444'; // Vermelho
  if (percentage >= 80) return '#f59e0b'; // Laranja
  if (percentage >= 60) return '#eab308'; // Amarelo
  return '#10b981'; // Verde
};

// Hook principal
export const useBudgetLogic = () => {
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

  const getStatusIcon = (percentage) => {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    return null;
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    // Estado
    loading,
    budgets,
    categories,
    totalBudget,
    selectedMonth,
    selectedYear,
    showModal,
    editingBudget,
    formData,
    saving,
    deletingId,
    
    // Ações
    setSelectedMonth,
    setSelectedYear,
    handleOpenModal,
    handleCloseModal,
    handleSubmit,
    handleDelete,
    handleFormChange,
    getStatusIcon,
    navigate
  };
};
