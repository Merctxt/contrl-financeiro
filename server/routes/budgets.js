const express = require('express');
const BudgetController = require('../controllers/BudgetController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.post('/', BudgetController.create);
router.get('/', BudgetController.getByPeriod);
router.get('/all-categories', BudgetController.getAllCategoriesWithBudgets);
router.get('/total', BudgetController.getTotalBudget);
router.put('/:id', BudgetController.update);
router.delete('/:id', BudgetController.delete);

module.exports = router;
