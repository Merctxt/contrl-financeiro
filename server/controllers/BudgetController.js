const Budget = require('../models/Budget');

class BudgetController {
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const data = req.body;

      // Validar dados
      if (!data.category_id || !data.month || !data.year || data.limit_amount === undefined) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
      }

      const budget = await Budget.create(userId, data);
      res.status(201).json({ message: 'Orçamento definido com sucesso', budget });
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      res.status(500).json({ error: 'Erro ao criar orçamento' });
    }
  }

  static async getByPeriod(req, res) {
    try {
      const userId = req.user.id;
      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({ error: 'Mês e ano são obrigatórios' });
      }

      const budgets = await Budget.findByUserAndPeriod(userId, parseInt(month), parseInt(year));
      res.json({ budgets });
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      res.status(500).json({ error: 'Erro ao buscar orçamentos' });
    }
  }

  static async getAllCategoriesWithBudgets(req, res) {
    try {
      const userId = req.user.id;
      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({ error: 'Mês e ano são obrigatórios' });
      }

      const budgets = await Budget.getAllCategoriesWithBudgets(userId, parseInt(month), parseInt(year));
      res.json({ budgets });
    } catch (error) {
      console.error('Erro ao buscar categorias com orçamentos:', error);
      res.status(500).json({ error: 'Erro ao buscar categorias com orçamentos' });
    }
  }

  static async getTotalBudget(req, res) {
    try {
      const userId = req.user.id;
      const { month, year } = req.query;

      if (!month || !year) {
        return res.status(400).json({ error: 'Mês e ano são obrigatórios' });
      }

      const total = await Budget.getTotalBudget(userId, parseInt(month), parseInt(year));
      res.json({ total });
    } catch (error) {
      console.error('Erro ao buscar total de orçamento:', error);
      res.status(500).json({ error: 'Erro ao buscar total de orçamento' });
    }
  }

  static async update(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const data = req.body;

      const budget = await Budget.update(id, userId, data);
      
      if (budget.updated === 0) {
        return res.status(404).json({ error: 'Orçamento não encontrado' });
      }

      res.json({ message: 'Orçamento atualizado com sucesso', budget });
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      res.status(500).json({ error: 'Erro ao atualizar orçamento' });
    }
  }

  static async delete(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await Budget.delete(id, userId);
      
      if (result.deleted === 0) {
        return res.status(404).json({ error: 'Orçamento não encontrado' });
      }

      res.json({ message: 'Orçamento deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar orçamento:', error);
      res.status(500).json({ error: 'Erro ao deletar orçamento' });
    }
  }
}

module.exports = BudgetController;
