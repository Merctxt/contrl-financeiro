const pool = require('../config/database');

class SessionController {
  // Listar todas as sessões ativas do usuário
  static async getSessions(req, res) {
    try {
      const userId = req.user.id;
      const currentSessionId = req.sessionId;
      
      const result = await pool.query(
        `SELECT id, device_info, ip_address, created_at, last_activity, 
                (id = $2) as is_current
         FROM sessions 
         WHERE user_id = $1 AND is_active = TRUE 
         ORDER BY last_activity DESC`,
        [userId, currentSessionId]
      );
      
      res.json({ sessions: result.rows });
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
      res.status(500).json({ error: 'Erro ao buscar sessões' });
    }
  }

  // Revogar uma sessão específica
  static async revokeSession(req, res) {
    try {
      const userId = req.user.id;
      const sessionId = parseInt(req.params.id);
      const currentSessionId = req.sessionId;
      
      // Não permitir revogar a sessão atual
      if (sessionId === currentSessionId) {
        return res.status(400).json({ error: 'Não é possível revogar a sessão atual' });
      }
      
      const result = await pool.query(
        `UPDATE sessions 
         SET is_active = FALSE 
         WHERE id = $1 AND user_id = $2 AND is_active = TRUE
         RETURNING id`,
        [sessionId, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }
      
      res.json({ message: 'Sessão revogada com sucesso' });
    } catch (error) {
      console.error('Erro ao revogar sessão:', error);
      res.status(500).json({ error: 'Erro ao revogar sessão' });
    }
  }

  // Revogar todas as outras sessões (mantém apenas a atual)
  static async revokeOtherSessions(req, res) {
    try {
      const userId = req.user.id;
      const currentSessionId = req.sessionId;
      
      const result = await pool.query(
        `UPDATE sessions 
         SET is_active = FALSE 
         WHERE user_id = $1 AND id != $2 AND is_active = TRUE
         RETURNING id`,
        [userId, currentSessionId]
      );
      
      res.json({ 
        message: `${result.rows.length} sessão(ões) encerrada(s) com sucesso`,
        count: result.rows.length
      });
    } catch (error) {
      console.error('Erro ao revogar outras sessões:', error);
      res.status(500).json({ error: 'Erro ao revogar sessões' });
    }
  }

  // Limpar sessões expiradas (7 dias de inatividade)
  static async cleanupExpiredSessions(req, res) {
    try {
      const result = await pool.query(
        `UPDATE sessions 
         SET is_active = FALSE 
         WHERE is_active = TRUE 
         AND last_activity < NOW() - INTERVAL '7 days'
         RETURNING id`
      );
      
      res.json({ 
        message: `${result.rows.length} sessão(ões) expirada(s) removida(s)`,
        count: result.rows.length
      });
    } catch (error) {
      console.error('Erro ao limpar sessões:', error);
      res.status(500).json({ error: 'Erro ao limpar sessões' });
    }
  }
}

module.exports = SessionController;
