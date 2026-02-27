import { getCache, setCache, clearCachePattern, TTL } from '../utils/cache';

// Em produção usa URL relativa, em dev usa localhost:5000
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

const api = {
  // Autenticação
  register: async (name, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return response.json();
  },

  login: async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  getProfile: async (token) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Recuperação de Senha
  forgotPassword: async (email) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return response.json();
  },

  validateResetToken: async (token) => {
    const response = await fetch(`${API_URL}/auth/validate-reset-token/${token}`);
    return response.json();
  },

  resetPassword: async (token, password) => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password })
    });
    return response.json();
  },

  // Transações
  getTransactions: async (token, filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/transactions?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  createTransaction: async (token, data) => {
    const response = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    
    // Limpar caches relacionados
    clearCachePattern('summary_');
    clearCachePattern('breakdown_');
    clearCachePattern('lifetime_stats');
    
    return result;
  },

  updateTransaction: async (token, id, data) => {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    
    // Limpar caches relacionados
    clearCachePattern('summary_');
    clearCachePattern('breakdown_');
    clearCachePattern('lifetime_stats');
    
    return result;
  },

  deleteTransaction: async (token, id) => {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    
    // Limpar caches relacionados
    clearCachePattern('summary_');
    clearCachePattern('breakdown_');
    clearCachePattern('lifetime_stats');
    
    return result;
  },

  getSummary: async (token, startDate, endDate) => {
    const cacheKey = `summary_${startDate}_${endDate}`;
    const cached = getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    const params = new URLSearchParams({ startDate, endDate });
    const response = await fetch(`${API_URL}/transactions/summary?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    setCache(cacheKey, data, TTL.MEDIUM);
    return data;
  },

  getCategoryBreakdown: async (token, type, startDate, endDate) => {
    const cacheKey = `breakdown_${type}_${startDate}_${endDate}`;
    const cached = getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    const params = new URLSearchParams({ type, startDate, endDate });
    const response = await fetch(`${API_URL}/transactions/breakdown?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    setCache(cacheKey, data, TTL.MEDIUM);
    return data;
  },

  getPaymentMethodBreakdown: async (token, startDate, endDate) => {
    const params = new URLSearchParams({ startDate, endDate });
    const response = await fetch(`${API_URL}/transactions/payment-methods-breakdown?${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data;
  },

  getLifetimeStats: async (token) => {
    const cacheKey = 'lifetime_stats';
    const cached = getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    const response = await fetch(`${API_URL}/transactions/lifetime-stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    setCache(cacheKey, data, TTL.LONG);
    return data;
  },

  // Categorias
  getCategories: async (token, type = null) => {
    const cacheKey = type ? `categories_${type}` : 'categories_all';
    const cached = getCache(cacheKey);
    
    if (cached) {
      return cached;
    }

    const params = type ? `?type=${type}` : '';
    const response = await fetch(`${API_URL}/categories${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    setCache(cacheKey, data, TTL.LONG);
    return data;
  },

  createCategory: async (token, data) => {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    
    // Limpar cache de categorias
    clearCachePattern('categories_');
    clearCachePattern('breakdown_');
    
    return result;
  },

  createDefaultCategories: async (token) => {
    const response = await fetch(`${API_URL}/categories/defaults`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    
    // Limpar cache de categorias
    clearCachePattern('categories_');
    clearCachePattern('breakdown_');
    
    return result;
  },

  updateCategory: async (token, id, data) => {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    
    // Limpar cache de categorias
    clearCachePattern('categories_');
    clearCachePattern('breakdown_');
    
    return result;
  },

  deleteCategory: async (token, id) => {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    
    // Limpar cache de categorias
    clearCachePattern('categories_');
    clearCachePattern('breakdown_');
    
    return result;
  },

  // Configurações do Usuário
  updateProfile: async (token, name, email) => {
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, email })
    });
    return response.json();
  },

  changePassword: async (token, currentPassword, newPassword) => {
    const response = await fetch(`${API_URL}/user/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return response.json();
  },

  deleteAccount: async (token, password) => {
    const response = await fetch(`${API_URL}/user/account`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ password })
    });
    return response.json();
  },

  // Sessões
  getSessions: async (token) => {
    const response = await fetch(`${API_URL}/sessions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  revokeSession: async (token, sessionId) => {
    const response = await fetch(`${API_URL}/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  revokeOtherSessions: async (token) => {
    const response = await fetch(`${API_URL}/sessions/others/all`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Metas Financeiras
  getGoals: async (token, status = null) => {
    const params = status ? `?status=${status}` : '';
    const response = await fetch(`${API_URL}/goals${params}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getGoal: async (token, id) => {
    const response = await fetch(`${API_URL}/goals/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  createGoal: async (token, data) => {
    const response = await fetch(`${API_URL}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  updateGoal: async (token, id, data) => {
    const response = await fetch(`${API_URL}/goals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  updateGoalAmount: async (token, id, amount) => {
    const response = await fetch(`${API_URL}/goals/${id}/amount`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ amount })
    });
    return response.json();
  },

  completeGoal: async (token, id) => {
    const response = await fetch(`${API_URL}/goals/${id}/complete`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  deleteGoal: async (token, id) => {
    const response = await fetch(`${API_URL}/goals/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  // Notificações
  getNotificationTriggers: async (token) => {
    const response = await fetch(`${API_URL}/notifications/triggers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

export default api;
