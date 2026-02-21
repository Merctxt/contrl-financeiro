const express = require('express');
const router = express.Router();
const GoalController = require('../controllers/GoalController');
const authenticateToken = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Listar metas
router.get('/', GoalController.getGoals);

// Buscar meta específica
router.get('/:id', GoalController.getGoal);

// Criar meta
router.post('/', GoalController.createGoal);

// Atualizar meta completa
router.put('/:id', GoalController.updateGoal);

// Atualizar apenas valor guardado
router.patch('/:id/amount', GoalController.updateAmount);

// Marcar meta como concluída
router.patch('/:id/complete', GoalController.completeGoal);

// Excluir meta
router.delete('/:id', GoalController.deleteGoal);

module.exports = router;
