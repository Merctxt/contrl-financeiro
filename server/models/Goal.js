const pool = require('../config/database');

class Goal {
  // Criar meta
  static async create(userId, name, targetAmount, currentAmount = 0, deadline) {
    const result = await pool.query(
      `INSERT INTO financial_goals (user_id, name, target_amount, current_amount, deadline, status) 
       VALUES ($1, $2, $3, $4, $5, 'active') 
       RETURNING *`,
      [userId, name, targetAmount, currentAmount, deadline]
    );
    return result.rows[0];
  }

  // Listar metas do usuário
  static async findByUserId(userId, status = null) {
    let query = 'SELECT * FROM financial_goals WHERE user_id = $1';
    const params = [userId];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    query += ' ORDER BY deadline ASC, created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Buscar meta por ID
  static async findById(id, userId) {
    const result = await pool.query(
      'SELECT * FROM financial_goals WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0];
  }

  // Atualizar meta
  static async update(id, userId, data) {
    const { name, target_amount, current_amount, deadline, status } = data;
    
    const result = await pool.query(
      `UPDATE financial_goals 
       SET name = $1, target_amount = $2, current_amount = $3, deadline = $4, status = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [name, target_amount, current_amount, deadline, status, id, userId]
    );
    return result.rows[0];
  }

  // Atualizar apenas valor guardado
  static async updateAmount(id, userId, amount) {
    const result = await pool.query(
      `UPDATE financial_goals 
       SET current_amount = $1
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [amount, id, userId]
    );
    return result.rows[0];
  }

  // Marcar meta como concluída
  static async complete(id, userId) {
    const result = await pool.query(
      `UPDATE financial_goals 
       SET status = 'completed'
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );
    return result.rows[0];
  }

  // Excluir meta
  static async delete(id, userId) {
    const result = await pool.query(
      'DELETE FROM financial_goals WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return result.rows[0];
  }
}

module.exports = Goal;
