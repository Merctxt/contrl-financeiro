import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

/**
 * Hook que encapsula toda a lógica de Categories
 */
export const useCategoriesLogic = () => {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [creatingDefaults, setCreatingDefaults] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'despesa',
    color: '#6366f1',
    icon: 'FiTrendingDown'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories(token);
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCategory) {
        await api.updateCategory(token, editingCategory.id, formData);
      } else {
        await api.createCategory(token, formData);
      }
      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', type: 'despesa', color: '#6366f1', icon: 'FiTrendingDown' });
      loadCategories();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
      setDeletingId(id);
      try {
        await api.deleteCategory(token, id);
        loadCategories();
      } catch (error) {
        console.error('Erro ao excluir categoria:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleCreateDefaults = async () => {
    setCreatingDefaults(true);
    try {
      await api.createDefaultCategories(token);
      loadCategories();
    } catch (error) {
      console.error('Erro ao criar categorias padrão:', error);
    } finally {
      setCreatingDefaults(false);
    }
  };

  const openNewForm = () => {
    setEditingCategory(null);
    setFormData({ name: '', type: 'despesa', color: '#6366f1', icon: 'FiTrendingDown' });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const updateFormData = (updates) => {
    setFormData({ ...formData, ...updates });
  };

  // Cálculos derivados
  const receitaCategories = categories.filter(cat => cat.type === 'receita');
  const despesaCategories = categories.filter(cat => cat.type === 'despesa');

  return {
    // Estado
    token,
    categories,
    loading,
    saving,
    deletingId,
    creatingDefaults,
    showForm,
    editingCategory,
    formData,
    receitaCategories,
    despesaCategories,
    // Ações
    setFormData,
    updateFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleCreateDefaults,
    openNewForm,
    closeForm
  };
};

/**
 * Constantes
 */
export const COLOR_OPTIONS = [
  '#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899', 
  '#14b8a6', '#8b5cf6', '#f43f5e', '#3b82f6', '#64748b'
];
