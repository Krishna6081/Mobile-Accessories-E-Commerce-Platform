const express = require('express');
const AuthController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.post('/verify-otp', AuthController.verifyOtp);

module.exports = router;
