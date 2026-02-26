const pool = require('../config/database');

class NotificationController {
  /**
   * Retorna dados para verificar gatilhos de notificação
   * GET /api/notifications/triggers
   */
  static async getTriggers(req, res) {
    try {
      const userId = req.user.id;
      const today = new Date();

      // 1. Verificar última transação (3 dias sem registrar nada)
      const lastTransactionQuery = `
        SELECT MAX(date) as last_transaction_date
        FROM transactions
        WHERE user_id = $1
      `;
      const lastTransactionResult = await pool.query(lastTransactionQuery, [userId]);
      const lastTransactionDate = lastTransactionResult.rows[0]?.last_transaction_date;
      
      const daysSinceLastTransaction = lastTransactionDate 
        ? Math.floor((today - new Date(lastTransactionDate)) / (1000 * 60 * 60 * 24))
        : 999;

      // 2. Verificar se gastou 80%+ da renda do mês
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      const firstDayOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
      const lastDayNum = new Date(currentYear, currentMonth, 0).getDate();
      const lastDayOfMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDayNum).padStart(2, '0')}`;
      
      const summaryQuery = `
        SELECT 
          COALESCE(SUM(CASE WHEN type = 'receita' THEN amount ELSE 0 END), 0) as receita,
          COALESCE(SUM(CASE WHEN type = 'despesa' THEN amount ELSE 0 END), 0) as despesa
        FROM transactions
        WHERE user_id = $1
          AND date >= $2::date
          AND date <= $3::date
      `;
      
      const summaryResult = await pool.query(summaryQuery, [userId, firstDayOfMonth, lastDayOfMonthStr]);
      const receita = parseFloat(summaryResult.rows[0]?.receita || 0);
      const despesa = parseFloat(summaryResult.rows[0]?.despesa || 0);
      const percentage = receita > 0 ? (despesa / receita * 100) : 0;

      res.json({
        triggers: {
          noRecentTransactions: {
            active: daysSinceLastTransaction >= 3,
            daysSinceLastTransaction,
            message: `Você não registra nada há ${daysSinceLastTransaction} dias! Não esqueça de adicionar suas transações`,
            type: 'warning'
          },
          budgetTight: {
            active: percentage >= 80 && receita > 0,
            percentage: percentage.toFixed(1),
            receita: receita.toFixed(2),
            despesa: despesa.toFixed(2),
            message: percentage >= 80 && receita > 0
              ? `Você já gastou ${percentage.toFixed(0)}% da sua renda do mês! (R$ ${despesa.toFixed(2)} de R$ ${receita.toFixed(2)})`
              : null,
            type: 'alert'
          }
        }
      });
    } catch (error) {
      console.error('Erro ao buscar gatilhos de notificação:', error);
      res.status(500).json({ error: 'Erro ao buscar gatilhos de notificação' });
    }
  }
}

module.exports = NotificationController;
