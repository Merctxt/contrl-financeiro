import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Layout from '../../components/Layout/Layout';
import { FiPlus, FiEdit2, FiTrash2, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import './Categories.css';

const Categories = () => {
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

  const colorOptions = [
    '#ef4444', '#f59e0b', '#10b981', '#6366f1', '#ec4899', 
    '#14b8a6', '#8b5cf6', '#f43f5e', '#3b82f6', '#64748b'
  ];

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

  const receitaCategories = categories.filter(cat => cat.type === 'receita');
  const despesaCategories = categories.filter(cat => cat.type === 'despesa');

  if (loading) {
    return (
      <Layout>
        <div className="spinner"></div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="categories-page fade-in">
        <div className="page-header">
          <div>
            <h1>Categorias</h1>
            <p>Organize suas transações por categorias</p>
          </div>
          <div className="header-actions">
            {categories.length === 0 && (
              <button 
                className="btn btn-secondary"
                onClick={handleCreateDefaults}
                disabled={creatingDefaults}
              >
                {creatingDefaults ? (
                  <>
                    <span className="btn-spinner"></span>
                    Criando...
                  </>
                ) : (
                  'Criar Categorias Padrão'
                )}
              </button>
            )}
            <button 
              className="btn btn-primary"
              onClick={() => {
                setEditingCategory(null);
                setFormData({ name: '', type: 'despesa', color: '#6366f1', icon: 'FiTrendingDown' });
                setShowForm(true);
              }}
            >
              <FiPlus /> Nova Categoria
            </button>
          </div>
        </div>

        {showForm && (
          <div className="card category-form fade-in">
            <h3>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nome</label>
                  <input
                    type="text"
                    id="name"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome da categoria"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Tipo</label>
                  <select
                    id="type"
                    className="form-control"
                    value={formData.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setFormData({ 
                        ...formData, 
                        type: newType,
                        icon: newType === 'receita' ? 'FiTrendingUp' : 'FiTrendingDown'
                      });
                    }}
                  >
                    <option value="receita">Receita</option>
                    <option value="despesa">Despesa</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Cor</label>
                <div className="color-grid">
                  {colorOptions.map((color) => (
                    <button
                      type="button"
                      key={color}
                      className={`color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCategory(null);
                  }}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <>
                      <span className="btn-spinner"></span>
                      {editingCategory ? 'Atualizando...' : 'Criando...'}
                    </>
                  ) : (
                    editingCategory ? 'Atualizar' : 'Criar'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="categories-grid">
          <div className="card">
            <h3 className="category-section-title income">
              <FiTrendingUp /> Categorias de Receita
            </h3>
            {receitaCategories.length > 0 ? (
              <div className="categories-list">
                {receitaCategories.map((cat) => (
                  <div key={cat.id} className="category-item">
                    <div className="category-info">
                      <span 
                        className="category-icon"
                        style={{ backgroundColor: cat.color }}
                      >
                        {cat.type === 'receita' ? <FiTrendingUp /> : <FiTrendingDown />}
                      </span>
                      <span className="category-name">{cat.name}</span>
                    </div>
                    <div className="category-actions">
                      <button 
                        className="btn-icon edit"
                        onClick={() => handleEdit(cat)}
                        title="Editar"
                        disabled={deletingId === cat.id}
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        className="btn-icon delete"
                        onClick={() => handleDelete(cat.id)}
                        title="Excluir"
                        disabled={deletingId === cat.id}
                      >
                        {deletingId === cat.id ? (
                          <span className="btn-spinner small"></span>
                        ) : (
                          <FiTrash2 />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-list">Nenhuma categoria de receita</p>
            )}
          </div>

          <div className="card">
            <h3 className="category-section-title expense">
              <FiTrendingDown /> Categorias de Despesa
            </h3>
            {despesaCategories.length > 0 ? (
              <div className="categories-list">
                {despesaCategories.map((cat) => (
                  <div key={cat.id} className="category-item">
                    <div className="category-info">
                      <span 
                        className="category-icon"
                        style={{ backgroundColor: cat.color }}
                      >
                        {cat.type === 'receita' ? <FiTrendingUp /> : <FiTrendingDown />}
                      </span>
                      <span className="category-name">{cat.name}</span>
                    </div>
                    <div className="category-actions">
                      <button 
                        className="btn-icon edit"
                        onClick={() => handleEdit(cat)}
                        title="Editar"
                        disabled={deletingId === cat.id}
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        className="btn-icon delete"
                        onClick={() => handleDelete(cat.id)}
                        title="Excluir"
                        disabled={deletingId === cat.id}
                      >
                        {deletingId === cat.id ? (
                          <span className="btn-spinner small"></span>
                        ) : (
                          <FiTrash2 />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-list">Nenhuma categoria de despesa</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Categories;
