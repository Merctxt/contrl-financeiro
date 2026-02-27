const Transaction = require('../models/Transaction');

class TransactionController {
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const data = req.body;

      // Validar dados
      if (!data.description || !data.amount || !data.type || !data.date) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
      }

      if (!['receita', 'despesa'].includes(data.type)) {
        return res.status(400).json({ error: 'Tipo inválido' });
      }

      const transaction = await Transaction.create(userId, data);
      res.status(201).json({ message: 'Transação criada com sucesso', transaction });
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      res.status(500).json({ error: 'Erro ao criar transação' });
    }
  }

  static async getAll(req, res) {
    try {
      const userId = req.user.id;
      const filters = {
        type: req.query.type,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        category_id: req.query.category_id,
        limit: req.query.limit
      };

      const transactions = await Transaction.findByUserId(userId, filters);
      res.json({ transactions });
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      res.status(500).json({ error: 'Erro ao buscar transações' });
    }
  }

  static async getById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const transaction = await Transaction.findById(id, userId);
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      res.json({ transaction });
    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      res.status(500).json({ error: 'Erro ao buscar transação' });
    }
  }

  static async update(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const data = req.body;

      const transaction = await Transaction.update(id, userId, data);
      
      if (transaction.updated === 0) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      res.json({ message: 'Transação atualizada com sucesso', transaction });
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      res.status(500).json({ error: 'Erro ao atualizar transação' });
    }
  }

  static async delete(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await Transaction.delete(id, userId);
      
      if (result.deleted === 0) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      res.json({ message: 'Transação deletada com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      res.status(500).json({ error: 'Erro ao deletar transação' });
    }
  }

  static async getSummary(req, res) {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Período é obrigatório' });
      }

      const summary = await Transaction.getSummary(userId, startDate, endDate);
      res.json({ summary });
    } catch (error) {
      console.error('Erro ao buscar resumo:', error);
      res.status(500).json({ error: 'Erro ao buscar resumo' });
    }
  }

  static async getCategoryBreakdown(req, res) {
    try {
      const userId = req.user.id;
      const { type, startDate, endDate } = req.query;

      if (!type || !startDate || !endDate) {
        return res.status(400).json({ error: 'Tipo e período são obrigatórios' });
      }

      const breakdown = await Transaction.getCategoryBreakdown(userId, type, startDate, endDate);
      console.log('Breakdown result:', breakdown); // Debug
      res.json({ breakdown });
    } catch (error) {
      console.error('Erro ao buscar breakdown:', error);
      res.status(500).json({ error: 'Erro ao buscar breakdown' });
    }
  }

  static async getPaymentMethodBreakdown(req, res) {
    try {
      const userId = req.user.id;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Período é obrigatório' });
      }

      const breakdown = await Transaction.getPaymentMethodBreakdown(userId, startDate, endDate);
      res.json({ breakdown });
    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
      res.status(500).json({ error: 'Erro ao buscar métodos de pagamento' });
    }
  }

  static async getLifetimeStats(req, res) {
    try {
      const userId = req.user.id;
      const stats = await Transaction.getLifetimeStats(userId);
      res.json({ stats });
    } catch (error) {
      console.error('Erro ao buscar estatísticas totais:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas totais' });
    }
  }
}

module.exports = TransactionController;
