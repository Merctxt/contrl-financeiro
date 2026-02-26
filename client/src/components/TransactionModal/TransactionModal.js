import React, { useState, useEffect } from 'react';
import { FiX, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import './TransactionModal.css';

const TransactionModal = ({ transaction, categories, onSave, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'despesa',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: '',
    notes: ''
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        description: transaction.description || '',
        amount: transaction.amount || '',
        type: transaction.type || 'despesa',
        category_id: transaction.category_id || '',
        date: transaction.date?.split('T')[0] || new Date().toISOString().split('T')[0],
        payment_method: transaction.payment_method || '',
        notes: transaction.notes || ''
      });
    }
  }, [transaction]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        ...formData,
        amount: parseFloat(formData.amount),
        category_id: formData.category_id ? parseInt(formData.category_id) : null
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === formData.type);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{transaction ? 'Editar Transação' : 'Nova Transação'}</h2>
          <button className="btn-close" onClick={onClose}><FiX /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="type-selector">
            <button
              type="button"
              className={`type-btn ${formData.type === 'receita' ? 'active income' : ''}`}
              onClick={() => setFormData({ ...formData, type: 'receita', category_id: '' })}
            >
              <FiTrendingUp /> Receita
            </button>
            <button
              type="button"
              className={`type-btn ${formData.type === 'despesa' ? 'active expense' : ''}`}
              onClick={() => setFormData({ ...formData, type: 'despesa', category_id: '' })}
            >
              <FiTrendingDown /> Despesa
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição *</label>
            <input
              type="text"
              id="description"
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ex: Almoço no restaurante"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Valor *</label>
              <input
                type="number"
                id="amount"
                name="amount"
                className="form-control"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0,00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">Data *</label>
              <input
                type="date"
                id="date"
                name="date"
                className="form-control"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category_id">Categoria</label>
              <select
                id="category_id"
                name="category_id"
                className="form-control"
                value={formData.category_id}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="payment_method">Método de Pagamento</label>
              <select
                id="payment_method"
                name="payment_method"
                className="form-control"
                value={formData.payment_method}
                onChange={handleChange}
              >
                <option value="">Selecione...</option>
                <option value="dinheiro">💵 Dinheiro</option>
                <option value="cartao_credito">💳 Cartão de Crédito</option>
                <option value="cartao_debito">💳 Cartão de Débito</option>
                <option value="pix">📱 PIX</option>
                <option value="transferencia">🏦 Transferência</option>
                <option value="boleto">📄 Boleto</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Observações</label>
            <textarea
              id="notes"
              name="notes"
              className="form-control"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Adicione uma nota (opcional)"
              rows="3"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  {transaction ? 'Atualizando...' : 'Adicionando...'}
                </>
              ) : (
                transaction ? 'Atualizar' : 'Adicionar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
