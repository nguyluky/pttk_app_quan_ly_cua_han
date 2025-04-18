const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    createCoupon,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    getAllCoupons,
    getActiveCoupons,
    validateCoupon
} = require('../controllers/couponController');

// @route   POST /api/coupons
// @desc    Tạo phiếu giảm giá mới
// @access  Private/Admin
router.post('/', protect, admin, createCoupon);

// @route   GET /api/coupons/:id
// @desc    Lấy thông tin phiếu giảm giá theo ID
// @access  Private
router.get('/:id', protect, getCouponById);

// @route   PUT /api/coupons/:id
// @desc    Cập nhật thông tin phiếu giảm giá
// @access  Private/Admin
router.put('/:id', protect, admin, updateCoupon);

// @route   DELETE /api/coupons/:id
// @desc    Xóa phiếu giảm giá
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteCoupon);

// @route   GET /api/coupons
// @desc    Lấy tất cả phiếu giảm giá
// @access  Private/Admin
router.get('/', protect, admin, getAllCoupons);

// @route   GET /api/coupons/active
// @desc    Lấy phiếu giảm giá đang hoạt động
// @access  Private
router.get('/active', protect, getActiveCoupons);

// @route   POST /api/coupons/validate
// @desc    Kiểm tra tính hợp lệ của phiếu giảm giá
// @access  Private
router.post('/validate', protect, validateCoupon);

module.exports = router;