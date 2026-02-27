const express = require('express');
const TransactionController = require('../controllers/TransactionController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.post('/', TransactionController.create);
router.get('/', TransactionController.getAll);
router.get('/summary', TransactionController.getSummary);
router.get('/lifetime-stats', TransactionController.getLifetimeStats);
router.get('/breakdown', TransactionController.getCategoryBreakdown);
router.get('/payment-methods-breakdown', TransactionController.getPaymentMethodBreakdown);
router.get('/:id', TransactionController.getById);
router.put('/:id', TransactionController.update);
router.delete('/:id', TransactionController.delete);

module.exports = router;
