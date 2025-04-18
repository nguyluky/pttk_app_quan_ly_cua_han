const Coupon = require('../models/couponModel');
const asyncHandler = require('express-async-handler');

// @desc    Tạo phiếu giảm giá mới
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res) => {
    const {
        code,
        discountType,
        discountValue,
        minPurchase,
        maxDiscount,
        startDate,
        expiryDate,
        isActive,
        storeId,
        usageLimit,
        description
    } = req.body;

    // Kiểm tra mã giảm giá đã tồn tại hay chưa
    const couponExists = await Coupon.findOne({ code });
    if (couponExists) {
        res.status(400);
        throw new Error('Mã giảm giá đã tồn tại');
    }

    const coupon = new Coupon({
        code,
        discountType, // 'percentage' hoặc 'fixed'
        discountValue,
        minPurchase: minPurchase || 0,
        maxDiscount: maxDiscount || null,
        startDate: startDate || Date.now(),
        expiryDate,
        isActive: isActive !== undefined ? isActive : true,
        storeId,
        usageLimit: usageLimit || null,
        usageCount: 0,
        description,
        createdBy: req.user._id
    });

    const createdCoupon = await coupon.save();
    res.status(201).json(createdCoupon);
});

// @desc    Lấy thông tin phiếu giảm giá theo ID
// @route   GET /api/coupons/:id
// @access  Private
const getCouponById = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (coupon) {
        res.json(coupon);
    } else {
        res.status(404);
        throw new Error('Không tìm thấy phiếu giảm giá');
    }
});

// @desc    Cập nhật thông tin phiếu giảm giá
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
        res.status(404);
        throw new Error('Không tìm thấy phiếu giảm giá');
    }

    // Nếu đang cập nhật mã giảm giá, kiểm tra xem mã đã tồn tại chưa
    if (req.body.code && req.body.code !== coupon.code) {
        const couponExists = await Coupon.findOne({ code: req.body.code });
        if (couponExists) {
            res.status(400);
            throw new Error('Mã giảm giá đã tồn tại');
        }
    }

    // Cập nhật các trường
    Object.keys(req.body).forEach(key => {
        coupon[key] = req.body[key];
    });

    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
});

// @desc    Xóa phiếu giảm giá
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
        res.status(404);
        throw new Error('Không tìm thấy phiếu giảm giá');
    }

    await coupon.deleteOne();
    res.json({ message: 'Đã xóa phiếu giảm giá' });
});

// @desc    Lấy tất cả phiếu giảm giá
// @route   GET /api/coupons
// @access  Private/Admin
const getAllCoupons = asyncHandler(async (req, res) => {
    const coupons = await Coupon.find({}).sort('-createdAt');
    res.json(coupons);
});

// @desc    Lấy phiếu giảm giá đang hoạt động
// @route   GET /api/coupons/active
// @access  Private
const getActiveCoupons = asyncHandler(async (req, res) => {
    const now = new Date();

    const coupons = await Coupon.find({
        isActive: true,
        startDate: { $lte: now },
        $or: [
            { expiryDate: { $gte: now } },
            { expiryDate: null }
        ],
        $or: [
            { usageLimit: { $gt: '$usageCount' } },
            { usageLimit: null }
        ]
    }).sort('-createdAt');

    res.json(coupons);
});

// @desc    Kiểm tra tính hợp lệ của phiếu giảm giá
// @route   POST /api/coupons/validate
// @access  Private
const validateCoupon = asyncHandler(async (req, res) => {
    const { code, totalAmount, storeId } = req.body;

    if (!code) {
        res.status(400);
        throw new Error('Vui lòng cung cấp mã giảm giá');
    }

    const now = new Date();
    const coupon = await Coupon.findOne({
        code,
        isActive: true,
        startDate: { $lte: now },
        $or: [
            { expiryDate: { $gte: now } },
            { expiryDate: null }
        ],
        $or: [
            { storeId },
            { storeId: null } // Coupon áp dụng cho tất cả cửa hàng
        ]
    });

    if (!coupon) {
        res.status(404);
        throw new Error('Mã giảm giá không hợp lệ hoặc đã hết hạn');
    }

    // Kiểm tra giới hạn sử dụng
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        res.status(400);
        throw new Error('Mã giảm giá đã đạt giới hạn sử dụng');
    }

    // Kiểm tra giá trị tối thiểu của đơn hàng
    if (totalAmount && coupon.minPurchase > totalAmount) {
        res.status(400);
        throw new Error(`Mã giảm giá yêu cầu giá trị đơn hàng tối thiểu là ${coupon.minPurchase}`);
    }

    // Tính toán giá trị giảm
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
        discountAmount = (totalAmount * coupon.discountValue) / 100;

        // Áp dụng giới hạn giảm giá tối đa nếu có
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
        }
    } else {
        // Giảm giá cố định
        discountAmount = coupon.discountValue;
    }

    res.json({
        valid: true,
        coupon,
        discountAmount
    });
});

module.exports = {
    createCoupon,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    getAllCoupons,
    getActiveCoupons,
    validateCoupon
};