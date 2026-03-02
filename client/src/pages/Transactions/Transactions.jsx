import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import TransactionModal from '../../components/TransactionModal/TransactionModal';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiTag } from 'react-icons/fi';
import { useTransactionsLogic, formatCurrency, formatDate } from './Transactions.logic';
import './Transactions.css';

const Transactions = () => {
  const {
    transactions,
    allTransactions,
    categories,
    loading,
    deletingId,
    showModal,
    editingTransaction,
    filters,
    totalReceitas,
    totalDespesas,
    currentPage,
    totalPages,
    setFilters,
    handleFilter,
    handleClearFilters,
    handleSaveTransaction,
    handleEdit,
    handleDelete,
    openNewModal,
    closeModal,
    goToPage
  } = useTransactionsLogic();

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
              onClick={openNewModal}
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

        <div className="card table-card">
          {transactions.length > 0 ? (
            <>
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
            
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-btn"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                >
                  «
                </button>
                <button 
                  className="pagination-btn"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>
                
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Mostrar apenas páginas próximas da atual
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <button
                        key={page}
                        className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="pagination-info">...</span>;
                  }
                  return null;
                })}
                
                <button 
                  className="pagination-btn"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  ›
                </button>
                <button 
                  className="pagination-btn"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  »
                </button>
                
                <span className="pagination-info">
                  {allTransactions.length} registros
                </span>
              </div>
            )}
          </>
          ) : (
            <div className="empty-state">
              <FiDollarSign className="empty-icon" size={48} />
              <p>Nenhuma transação encontrada</p>
              <button 
                className="btn btn-primary"
                onClick={openNewModal}
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
            onClose={closeModal}
          />
        )}
      </div>
    </Layout>
  );
};

export default Transactions;
