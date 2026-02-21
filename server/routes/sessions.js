const express = require('express');
const router = express.Router();
const SessionController = require('../controllers/SessionController');
const authenticateToken = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Listar sessões ativas
router.get('/', SessionController.getSessions);

// Revogar uma sessão específica
router.delete('/:id', SessionController.revokeSession);

// Revogar todas as outras sessões
router.delete('/others/all', SessionController.revokeOtherSessions);

module.exports = router;
