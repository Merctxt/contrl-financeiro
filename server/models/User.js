const pool = require('../config/database');

class User {
  static async create(name, email, hashedPassword) {
    const sql = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id';
    const result = await pool.query(sql, [name, email, hashedPassword]);
    return { id: result.rows[0].id, name, email };
  }

  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(sql, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const sql = 'SELECT id, name, email, created_at FROM users WHERE id = $1';
    const result = await pool.query(sql, [id]);
    return result.rows[0];
  }

  static async update(id, name, email) {
    const sql = 'UPDATE users SET name = $1, email = $2 WHERE id = $3';
    await pool.query(sql, [name, email, id]);
    return { id, name, email };
  }

  static async updatePassword(id, hashedPassword) {
    const sql = 'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2';
    const result = await pool.query(sql, [hashedPassword, id]);
    return { updated: result.rowCount };
  }

  static async setResetToken(id, token, expires) {
    const sql = 'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3';
    const result = await pool.query(sql, [token, expires, id]);
    return { updated: result.rowCount };
  }

  static async findByResetToken(token) {
    const sql = 'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()';
    const result = await pool.query(sql, [token]);
    return result.rows[0];
  }

  static async clearResetToken(id) {
    const sql = 'UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = $1';
    const result = await pool.query(sql, [id]);
    return { updated: result.rowCount };
  }

  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = $1';
    const result = await pool.query(sql, [id]);
    return { deleted: result.rowCount };
  }
}

module.exports = User;
