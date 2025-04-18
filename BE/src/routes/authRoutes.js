const express = require('express');
const { login, getUserProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Route đăng nhập
router.post('/login', login);

// Các routes yêu cầu đăng nhập
router.get('/profile', protect, getUserProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;