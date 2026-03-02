import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

/**
 * Hook que encapsula toda a lógica de Transactions
 */
export const useTransactionsLogic = () => {
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const openNewModal = () => {
    setEditingTransaction(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
  };

  // Cálculos derivados
  const totalReceitas = transactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const totalDespesas = transactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  // Paginação
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    // Estado
    transactions: paginatedTransactions,
    allTransactions: transactions,
    categories,
    loading,
    deletingId,
    showModal,
    editingTransaction,
    filters,
    totalReceitas,
    totalDespesas,
    // Paginação
    currentPage,
    totalPages,
    itemsPerPage,
    // Ações
    setFilters,
    handleFilter,
    handleClearFilters,
    handleSaveTransaction,
    handleEdit,
    handleDelete,
    openNewModal,
    closeModal,
    goToPage
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
