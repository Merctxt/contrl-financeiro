const express = require('express');
const CategoryController = require('../controllers/CategoryController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.post('/', CategoryController.create);
router.get('/', CategoryController.getAll);
router.post('/defaults', CategoryController.createDefaults);
router.get('/:id', CategoryController.getById);
router.put('/:id', CategoryController.update);
router.delete('/:id', CategoryController.delete);

module.exports = router;
