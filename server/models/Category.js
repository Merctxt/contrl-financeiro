const pool = require('../config/database');

class Category {
  static async create(userId, data) {
    const sql = `
      INSERT INTO categories (user_id, name, type, color, icon)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const params = [
      userId,
      data.name,
      data.type,
      data.color || '#6366f1',
      data.icon || 'category'
    ];

    const result = await pool.query(sql, params);
    return { id: result.rows[0].id, user_id: userId, ...data };
  }

  static async findByUserId(userId, type = null) {
    let sql = 'SELECT * FROM categories WHERE user_id = $1';
    const params = [userId];

    if (type) {
      sql += ' AND type = $2';
      params.push(type);
    }

    sql += ' ORDER BY name ASC';

    const result = await pool.query(sql, params);
    return result.rows;
  }

  static async findById(id, userId) {
    const sql = 'SELECT * FROM categories WHERE id = $1 AND user_id = $2';
    const result = await pool.query(sql, [id, userId]);
    return result.rows[0];
  }

  static async update(id, userId, data) {
    const sql = `
      UPDATE categories
      SET name = $1, type = $2, color = $3, icon = $4
      WHERE id = $5 AND user_id = $6
    `;
    const params = [
      data.name,
      data.type,
      data.color || '#6366f1',
      data.icon || 'category',
      id,
      userId
    ];

    const result = await pool.query(sql, params);
    return { id, ...data, updated: result.rowCount };
  }

  static async delete(id, userId) {
    const sql = 'DELETE FROM categories WHERE id = $1 AND user_id = $2';
    const result = await pool.query(sql, [id, userId]);
    return { deleted: result.rowCount };
  }

  static async createDefaultCategories(userId) {
    const defaultCategories = [
      // Receitas
      { name: 'Salário', type: 'receita', color: '#10b981', icon: '💰' },
      { name: 'Freelance', type: 'receita', color: '#3b82f6', icon: '💼' },
      { name: 'Investimentos', type: 'receita', color: '#8b5cf6', icon: '📈' },
      { name: 'Outros', type: 'receita', color: '#6366f1', icon: '➕' },
      // Despesas
      { name: 'Alimentação', type: 'despesa', color: '#ef4444', icon: '🍔' },
      { name: 'Transporte', type: 'despesa', color: '#f59e0b', icon: '🚗' },
      { name: 'Moradia', type: 'despesa', color: '#ec4899', icon: '🏠' },
      { name: 'Saúde', type: 'despesa', color: '#14b8a6', icon: '🏥' },
      { name: 'Educação', type: 'despesa', color: '#06b6d4', icon: '📚' },
      { name: 'Lazer', type: 'despesa', color: '#8b5cf6', icon: '🎮' },
      { name: 'Compras', type: 'despesa', color: '#f43f5e', icon: '🛍️' },
      { name: 'Contas', type: 'despesa', color: '#64748b', icon: '📄' }
    ];

    const promises = defaultCategories.map(cat => this.create(userId, cat));
    return Promise.all(promises);
  }
}

module.exports = Category;
