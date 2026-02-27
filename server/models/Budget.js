const pool = require('../config/database');

class Budget {
  static async create(userId, data) {
    const { category_id, month, year, limit_amount } = data;
    
    const sql = `
      INSERT INTO budgets (user_id, category_id, month, year, limit_amount)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, category_id, month, year)
      DO UPDATE SET limit_amount = EXCLUDED.limit_amount
      RETURNING *
    `;
    
    const result = await pool.query(sql, [userId, category_id, month, year, limit_amount]);
    return result.rows[0];
  }

  static async findByUserAndPeriod(userId, month, year) {
    const sql = `
      SELECT 
        b.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        c.type as category_type,
        COALESCE(
          (SELECT SUM(amount)::numeric::float8
           FROM transactions t
           WHERE t.user_id = b.user_id
           AND t.category_id = b.category_id
           AND t.type = 'despesa'
           AND EXTRACT(MONTH FROM t.date) = b.month
           AND EXTRACT(YEAR FROM t.date) = b.year),
          0
        ) as spent_amount,
        true as has_budget
      FROM budgets b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = $1
      AND b.month = $2
      AND b.year = $3
      ORDER BY c.name
    `;
    
    const result = await pool.query(sql, [userId, month, year]);
    
    return result.rows.map(row => ({
      ...row,
      limit_amount: parseFloat(row.limit_amount) || 0,
      spent_amount: parseFloat(row.spent_amount) || 0,
      remaining: (parseFloat(row.limit_amount) || 0) - (parseFloat(row.spent_amount) || 0),
      percentage: parseFloat(row.limit_amount) > 0 
        ? ((parseFloat(row.spent_amount) / parseFloat(row.limit_amount)) * 100).toFixed(1)
        : 0
    }));
  }

  static async getAllCategoriesWithBudgets(userId, month, year) {
    const sql = `
      SELECT 
        c.id as category_id,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        c.type as category_type,
        b.id as budget_id,
        COALESCE(b.limit_amount, 0)::numeric::float8 as limit_amount,
        COALESCE(
          (SELECT SUM(amount)::numeric::float8
           FROM transactions t
           WHERE t.user_id = $1
           AND t.category_id = c.id
           AND t.type = 'despesa'
           AND EXTRACT(MONTH FROM t.date) = $2
           AND EXTRACT(YEAR FROM t.date) = $3),
          0
        ) as spent_amount,
        CASE WHEN b.id IS NOT NULL THEN true ELSE false END as has_budget
      FROM categories c
      LEFT JOIN budgets b ON b.category_id = c.id AND b.user_id = $1 AND b.month = $2 AND b.year = $3
      WHERE c.user_id = $1 AND c.type = 'despesa'
      ORDER BY c.name
    `;
    
    const result = await pool.query(sql, [userId, month, year]);
    
    return result.rows.map(row => ({
      ...row,
      id: row.budget_id,
      limit_amount: parseFloat(row.limit_amount) || 0,
      spent_amount: parseFloat(row.spent_amount) || 0,
      remaining: (parseFloat(row.limit_amount) || 0) - (parseFloat(row.spent_amount) || 0),
      percentage: parseFloat(row.limit_amount) > 0 
        ? ((parseFloat(row.spent_amount) / parseFloat(row.limit_amount)) * 100).toFixed(1)
        : 0
    }));
  }

  static async findById(id, userId) {
    const sql = `
      SELECT * FROM budgets
      WHERE id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(sql, [id, userId]);
    return result.rows[0];
  }

  static async update(id, userId, data) {
    const { limit_amount } = data;
    
    const sql = `
      UPDATE budgets
      SET limit_amount = $1
      WHERE id = $2 AND user_id = $3
      RETURNING *
    `;
    
    const result = await pool.query(sql, [limit_amount, id, userId]);
    
    return {
      updated: result.rowCount,
      budget: result.rows[0]
    };
  }

  static async delete(id, userId) {
    const sql = `
      DELETE FROM budgets
      WHERE id = $1 AND user_id = $2
    `;
    
    const result = await pool.query(sql, [id, userId]);
    
    return {
      deleted: result.rowCount
    };
  }

  static async getTotalBudget(userId, month, year) {
    const sql = `
      SELECT 
        COALESCE(SUM(limit_amount), 0)::numeric::float8 as total_limit,
        (
          SELECT COALESCE(SUM(amount), 0)::numeric::float8
          FROM transactions
          WHERE user_id = $1
          AND type = 'despesa'
          AND EXTRACT(MONTH FROM date) = $2
          AND EXTRACT(YEAR FROM date) = $3
        ) as total_spent
      FROM budgets
      WHERE user_id = $1
      AND month = $2
      AND year = $3
    `;
    
    const result = await pool.query(sql, [userId, month, year]);
    const row = result.rows[0];
    
    const total_limit = parseFloat(row.total_limit) || 0;
    const total_spent = parseFloat(row.total_spent) || 0;
    
    return {
      total_limit,
      total_spent,
      total_remaining: total_limit - total_spent,
      percentage: total_limit > 0 ? ((total_spent / total_limit) * 100).toFixed(1) : 0
    };
  }
}

module.exports = Budget;
