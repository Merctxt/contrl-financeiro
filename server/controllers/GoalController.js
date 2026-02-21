const Goal = require('../models/Goal');

class GoalController {
  // Helper: Calcular estatísticas da meta
  static calculateGoalStats(goal) {
    const targetAmount = parseFloat(goal.target_amount);
    const currentAmount = parseFloat(goal.current_amount) || 0;
    const remaining = Math.max(0, targetAmount - currentAmount);
    const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
    
    // Calcular meses restantes
    const today = new Date();
    const deadline = new Date(goal.deadline);
    const monthsDiff = (deadline.getFullYear() - today.getFullYear()) * 12 + 
                       (deadline.getMonth() - today.getMonth());
    const monthsRemaining = Math.max(0, monthsDiff);
    
    // Calcular quanto guardar por mês
    const monthlyTarget = monthsRemaining > 0 ? remaining / monthsRemaining : remaining;
    
    return {
      ...goal,
      target_amount: targetAmount,
      current_amount: currentAmount,
      remaining,
      progress: Math.min(100, Math.round(progress * 10) / 10),
      months_remaining: monthsRemaining,
      monthly_target: Math.round(monthlyTarget * 100) / 100
    };
  }

  // Listar metas
  static async getGoals(req, res) {
    try {
      const userId = req.user.id;
      const { status } = req.query;
      
      const goals = await Goal.findByUserId(userId, status);
      const goalsWithStats = goals.map(goal => GoalController.calculateGoalStats(goal));
      
      res.json({ goals: goalsWithStats });
    } catch (error) {
      console.error('Erro ao buscar metas:', error);
      res.status(500).json({ error: 'Erro ao buscar metas' });
    }
  }

  // Buscar meta específica
  static async getGoal(req, res) {
    try {
      const userId = req.user.id;
      const goalId = req.params.id;
      
      const goal = await Goal.findById(goalId, userId);
      
      if (!goal) {
        return res.status(404).json({ error: 'Meta não encontrada' });
      }
      
      const goalWithStats = GoalController.calculateGoalStats(goal);
      res.json({ goal: goalWithStats });
    } catch (error) {
      console.error('Erro ao buscar meta:', error);
      res.status(500).json({ error: 'Erro ao buscar meta' });
    }
  }

  // Criar meta
  static async createGoal(req, res) {
    try {
      const userId = req.user.id;
      const { name, target_amount, current_amount, deadline } = req.body;
      
      // Validações
      if (!name || !target_amount || !deadline) {
        return res.status(400).json({ error: 'Nome, valor alvo e prazo são obrigatórios' });
      }
      
      if (target_amount <= 0) {
        return res.status(400).json({ error: 'Valor alvo deve ser maior que zero' });
      }
      
      if (new Date(deadline) < new Date()) {
        return res.status(400).json({ error: 'Prazo final deve ser uma data futura' });
      }
      
      const goal = await Goal.create(
        userId, 
        name, 
        target_amount, 
        current_amount || 0, 
        deadline
      );
      
      const goalWithStats = GoalController.calculateGoalStats(goal);
      res.status(201).json({ message: 'Meta criada com sucesso', goal: goalWithStats });
    } catch (error) {
      console.error('Erro ao criar meta:', error);
      res.status(500).json({ error: 'Erro ao criar meta' });
    }
  }

  // Atualizar meta
  static async updateGoal(req, res) {
    try {
      const userId = req.user.id;
      const goalId = req.params.id;
      const { name, target_amount, current_amount, deadline, status } = req.body;
      
      // Validações
      if (!name || !target_amount || !deadline || !status) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }
      
      if (target_amount <= 0) {
        return res.status(400).json({ error: 'Valor alvo deve ser maior que zero' });
      }
      
      if (!['active', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
      }
      
      const goal = await Goal.update(goalId, userId, {
        name,
        target_amount,
        current_amount: current_amount || 0,
        deadline,
        status
      });
      
      if (!goal) {
        return res.status(404).json({ error: 'Meta não encontrada' });
      }
      
      const goalWithStats = GoalController.calculateGoalStats(goal);
      res.json({ message: 'Meta atualizada com sucesso', goal: goalWithStats });
    } catch (error) {
      console.error('Erro ao atualizar meta:', error);
      res.status(500).json({ error: 'Erro ao atualizar meta' });
    }
  }

  // Atualizar valor guardado
  static async updateAmount(req, res) {
    try {
      const userId = req.user.id;
      const goalId = req.params.id;
      const { amount } = req.body;
      
      if (amount === undefined || amount < 0) {
        return res.status(400).json({ error: 'Valor inválido' });
      }
      
      const goal = await Goal.updateAmount(goalId, userId, amount);
      
      if (!goal) {
        return res.status(404).json({ error: 'Meta não encontrada' });
      }
      
      const goalWithStats = GoalController.calculateGoalStats(goal);
      res.json({ message: 'Valor atualizado com sucesso', goal: goalWithStats });
    } catch (error) {
      console.error('Erro ao atualizar valor:', error);
      res.status(500).json({ error: 'Erro ao atualizar valor' });
    }
  }

  // Marcar meta como concluída
  static async completeGoal(req, res) {
    try {
      const userId = req.user.id;
      const goalId = req.params.id;
      
      const goal = await Goal.complete(goalId, userId);
      
      if (!goal) {
        return res.status(404).json({ error: 'Meta não encontrada' });
      }
      
      const goalWithStats = GoalController.calculateGoalStats(goal);
      res.json({ message: 'Meta concluída! Parabéns!', goal: goalWithStats });
    } catch (error) {
      console.error('Erro ao concluir meta:', error);
      res.status(500).json({ error: 'Erro ao concluir meta' });
    }
  }

  // Excluir meta
  static async deleteGoal(req, res) {
    try {
      const userId = req.user.id;
      const goalId = req.params.id;
      
      const result = await Goal.delete(goalId, userId);
      
      if (!result) {
        return res.status(404).json({ error: 'Meta não encontrada' });
      }
      
      res.json({ message: 'Meta excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      res.status(500).json({ error: 'Erro ao excluir meta' });
    }
  }
}

module.exports = GoalController;
