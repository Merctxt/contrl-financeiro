const express = require('express');
const UserController = require('../controllers/UserController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.put('/profile', UserController.updateProfile);
router.put('/password', UserController.changePassword);
router.delete('/account', UserController.deleteAccount);

module.exports = router;
