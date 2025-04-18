const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    createPromotion,
    getPromotionById,
    updatePromotion,
    deletePromotion,
    getAllPromotions,
    getActivePromotions,
    getStorePromotions
} = require('../controllers/promotionController');

// @route   POST /api/promotions
// @desc    Tạo khuyến mãi mới
// @access  Private/Admin
router.post('/', protect, admin, createPromotion);

// @route   GET /api/promotions/:id
// @desc    Lấy thông tin khuyến mãi theo ID
// @access  Private
router.get('/:id', protect, getPromotionById);

// @route   PUT /api/promotions/:id
// @desc    Cập nhật thông tin khuyến mãi
// @access  Private/Admin
router.put('/:id', protect, admin, updatePromotion);

// @route   DELETE /api/promotions/:id
// @desc    Xóa khuyến mãi
// @access  Private/Admin
router.delete('/:id', protect, admin, deletePromotion);

// @route   GET /api/promotions
// @desc    Lấy tất cả khuyến mãi
// @access  Private
router.get('/', protect, getAllPromotions);

// @route   GET /api/promotions/active
// @desc    Lấy các khuyến mãi đang hoạt động
// @access  Private
router.get('/active', protect, getActivePromotions);

// @route   GET /api/promotions/store/:storeId
// @desc    Lấy khuyến mãi của một cửa hàng
// @access  Private
router.get('/store/:storeId', protect, getStorePromotions);

module.exports = router;