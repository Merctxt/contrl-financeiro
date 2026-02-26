const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const auth = require('../middleware/auth');

// Rota para buscar gatilhos de notificação
router.get('/triggers', auth, NotificationController.getTriggers);

module.exports = router;
