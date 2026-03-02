const express = require('express');
const AuthController = require('../controllers/AuthController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/profile', authenticateToken, AuthController.getProfile);

router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.get('/validate-reset-token/:token', AuthController.validateResetToken);

module.exports = router;
