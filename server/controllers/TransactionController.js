const Transaction = require('../models/Transaction');
const validator = require('../utils/validator');

class TransactionController {
  static async create(req, res) {
    try {
      const userId = req.user.id;
      const data = req.body;

      // Validar e sanitizar dados
      const validation = validator.validateTransaction(data, false);
      
      if (!validation.valid) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: validation.errors 
        });
      }

      const transaction = await Transaction.create(userId, validation.data);
      res.status(201).json({ message: 'Transação criada com sucesso', transaction });
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      res.status(500).json({ error: 'Erro ao criar transação' });
    }
  }

  static async getAll(req, res) {
    try {
      const userId = req.user.id;
      
      // Validar filtros
      const filters = {};
      
      if (req.query.type) {
        const typeValidation = validator.validateTransactionType(req.query.type);
        if (typeValidation.valid) {
          filters.type = typeValidation.value;
        }
      }
      
      if (req.query.startDate) {
        const dateValidation = validator.validateDate(req.query.startDate);
        if (dateValidation.valid) {
          filters.startDate = dateValidation.value;
        }
      }
      
      if (req.query.endDate) {
        const dateValidation = validator.validateDate(req.query.endDate);
        if (dateValidation.valid) {
          filters.endDate = dateValidation.value;
        }
      }
      
      if (req.query.category_id) {
        const idValidation = validator.validateId(req.query.category_id);
        if (idValidation.valid) {
          filters.category_id = idValidation.value;
        }
      }
      
      if (req.query.limit) {
        const limitValidation = validator.validateLimit(req.query.limit);
        filters.limit = limitValidation.value;
      }

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
      
      // Validar ID
      const idValidation = validator.validateId(id);
      if (!idValidation.valid) {
        return res.status(400).json({ error: idValidation.error });
      }

      const transaction = await Transaction.findById(idValidation.value, userId);
      
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
      
      // Validar ID
      const idValidation = validator.validateId(id);
      if (!idValidation.valid) {
        return res.status(400).json({ error: idValidation.error });
      }
      
      // Validar dados (modo update - campos opcionais)
      const validation = validator.validateTransaction(data, true);
      
      if (!validation.valid) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: validation.errors 
        });
      }

      const transaction = await Transaction.update(idValidation.value, userId, validation.data);
      
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
      
      // Validar ID
      const idValidation = validator.validateId(id);
      if (!idValidation.valid) {
        return res.status(400).json({ error: idValidation.error });
      }

      const result = await Transaction.delete(idValidation.value, userId);
      
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
      
      // Validar datas
      const startValidation = validator.validateDate(startDate);
      const endValidation = validator.validateDate(endDate);
      
      if (!startValidation.valid || !endValidation.valid) {
        return res.status(400).json({ error: 'Período inválido' });
      }

      const summary = await Transaction.getSummary(userId, startValidation.value, endValidation.value);
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
      
      // Validar tipo e datas
      const typeValidation = validator.validateTransactionType(type);
      const startValidation = validator.validateDate(startDate);
      const endValidation = validator.validateDate(endDate);
      
      if (!typeValidation.valid || !startValidation.valid || !endValidation.valid) {
        return res.status(400).json({ error: 'Tipo e período são obrigatórios' });
      }

      const breakdown = await Transaction.getCategoryBreakdown(
        userId, 
        typeValidation.value, 
        startValidation.value, 
        endValidation.value
      );
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
      
      // Validar datas
      const startValidation = validator.validateDate(startDate);
      const endValidation = validator.validateDate(endDate);
      
      if (!startValidation.valid || !endValidation.valid) {
        return res.status(400).json({ error: 'Período inválido' });
      }

      const breakdown = await Transaction.getPaymentMethodBreakdown(
        userId, 
        startValidation.value, 
        endValidation.value
      );
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

  static async getYearlySummary(req, res) {
    try {
      const userId = req.user.id;
      const { year } = req.query;
      
      // Validar ano
      const yearNum = parseInt(year, 10);
      if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
        return res.status(400).json({ error: 'Ano inválido' });
      }

      const monthlyData = await Transaction.getYearlySummary(userId, yearNum);
      
      // Calcular totais do ano
      const yearTotals = monthlyData.reduce((acc, month) => {
        acc.totalReceita += month.receita;
        acc.totalDespesa += month.despesa;
        acc.totalTransactions += month.count_receita + month.count_despesa;
        return acc;
      }, { totalReceita: 0, totalDespesa: 0, totalTransactions: 0 });
      
      res.json({ 
        year: yearNum,
        months: monthlyData,
        totals: {
          ...yearTotals,
          saldo: yearTotals.totalReceita - yearTotals.totalDespesa
        }
      });
    } catch (error) {
      console.error('Erro ao buscar resumo anual:', error);
      res.status(500).json({ error: 'Erro ao buscar resumo anual' });
    }
  }
}

module.exports = TransactionController;
