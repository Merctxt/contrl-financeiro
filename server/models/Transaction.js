const pool = require('../config/database');

class Transaction {
  static async create(userId, data) {
    const sql = `
      INSERT INTO transactions (user_id, category_id, description, amount, type, date, payment_method, notes, recurring)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    const params = [
      userId,
      data.category_id,
      data.description,
      data.amount,
      data.type,
      data.date,
      data.payment_method || null,
      data.notes || null,
      data.recurring || 0
    ];

    const result = await pool.query(sql, params);
    return { id: result.rows[0].id, ...data };
  }

  static async findByUserId(userId, filters = {}) {
    let sql = `
      SELECT t.*, c.name as category_name, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
    `;
    const params = [userId];
    let paramCount = 1;

    if (filters.type) {
      paramCount++;
      sql += ` AND t.type = $${paramCount}`;
      params.push(filters.type);
    }

    if (filters.startDate) {
      paramCount++;
      sql += ` AND t.date >= $${paramCount}`;
      params.push(filters.startDate);
    }

    if (filters.endDate) {
      paramCount++;
      sql += ` AND t.date <= $${paramCount}`;
      params.push(filters.endDate);
    }

    if (filters.category_id) {
      paramCount++;
      sql += ` AND t.category_id = $${paramCount}`;
      params.push(filters.category_id);
    }

    sql += ' ORDER BY t.date DESC, t.id DESC';

    if (filters.limit) {
      paramCount++;
      sql += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
    }

    const result = await pool.query(sql, params);
    return result.rows;
  }

  static async findById(id, userId) {
    const sql = `
      SELECT t.*, c.name as category_name, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = $1 AND t.user_id = $2
    `;
    const result = await pool.query(sql, [id, userId]);
    return result.rows[0];
  }

  static async update(id, userId, data) {
    const sql = `
      UPDATE transactions
      SET category_id = $1, description = $2, amount = $3, type = $4, date = $5, 
          payment_method = $6, notes = $7, recurring = $8
      WHERE id = $9 AND user_id = $10
    `;
    const params = [
      data.category_id,
      data.description,
      data.amount,
      data.type,
      data.date,
      data.payment_method || null,
      data.notes || null,
      data.recurring || 0,
      id,
      userId
    ];

    const result = await pool.query(sql, params);
    return { id, ...data, updated: result.rowCount };
  }

  static async delete(id, userId) {
    const sql = 'DELETE FROM transactions WHERE id = $1 AND user_id = $2';
    const result = await pool.query(sql, [id, userId]);
    return { deleted: result.rowCount };
  }

  static async getSummary(userId, startDate, endDate) {
    const sql = `
      SELECT 
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions
      WHERE user_id = $1 AND date BETWEEN $2 AND $3
      GROUP BY type
    `;
    
    const result = await pool.query(sql, [userId, startDate, endDate]);
    const rows = result.rows;
    
    const summary = {
      receita: 0,
      despesa: 0,
      saldo: 0,
      count_receita: 0,
      count_despesa: 0
    };

    rows.forEach(row => {
      if (row.type === 'receita') {
        summary.receita = parseFloat(row.total);
        summary.count_receita = parseInt(row.count);
      } else if (row.type === 'despesa') {
        summary.despesa = parseFloat(row.total);
        summary.count_despesa = parseInt(row.count);
      }
    });

    summary.saldo = summary.receita - summary.despesa;
    return summary;
  }

  static async getCategoryBreakdown(userId, type, startDate, endDate) {
    const sql = `  
      SELECT 
        c.id,
        COALESCE(c.name, 'Sem categoria') as name,
        COALESCE(c.color, '#6b7280') as color,
        c.icon,
        COALESCE(c.type, $2) as type,
        COALESCE(SUM(t.amount), 0)::numeric::float8 as total,
        COUNT(*) as count
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1 AND t.type = $2 AND t.date BETWEEN $3 AND $4
      GROUP BY c.id, c.name, c.color, c.icon, c.type
      ORDER BY total DESC
    `;
    
    const result = await pool.query(sql, [userId, type, startDate, endDate]);
    
    // Garantir que total seja um número
    const rows = result.rows.map(row => ({
      ...row,
      total: parseFloat(row.total) || 0,
      count: parseInt(row.count) || 0
    }));
    
    return rows;
  }

  static async getPaymentMethodBreakdown(userId, startDate, endDate) {
    const sql = `  
      SELECT 
        COALESCE(payment_method, 'other') as payment_method,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0)::numeric::float8 as total
      FROM transactions
      WHERE user_id = $1 AND date BETWEEN $2 AND $3 AND payment_method IS NOT NULL
      GROUP BY payment_method
      ORDER BY total DESC
    `;
    
    const result = await pool.query(sql, [userId, startDate, endDate]);
    
    // Calcular total geral para calcular percentuais
    const totalGeral = result.rows.reduce((sum, row) => sum + (parseFloat(row.total) || 0), 0);
    
    // Garantir que total seja um número e adicionar percentual
    const rows = result.rows.map(row => ({
      ...row,
      total: parseFloat(row.total) || 0,
      count: parseInt(row.count) || 0,
      percentage: totalGeral > 0 ? ((parseFloat(row.total) || 0) / totalGeral * 100).toFixed(2) : 0
    }));
    
    return rows;
  }

  static async getLifetimeStats(userId) {
    const sql = `
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'receita' THEN amount ELSE 0 END), 0)::numeric::float8 as total_receitas,
        COALESCE(SUM(CASE WHEN type = 'despesa' THEN amount ELSE 0 END), 0)::numeric::float8 as total_despesas
      FROM transactions
      WHERE user_id = $1
    `;
    
    const result = await pool.query(sql, [userId]);
    const row = result.rows[0];
    
    return {
      total_receitas: parseFloat(row.total_receitas) || 0,
      total_despesas: parseFloat(row.total_despesas) || 0,
      saldo_total: (parseFloat(row.total_receitas) || 0) - (parseFloat(row.total_despesas) || 0)
    };
  }
}

module.exports = Transaction;
