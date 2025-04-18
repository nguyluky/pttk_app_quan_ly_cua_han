const Promotion = require('../models/promotionModel');
const asyncHandler = require('express-async-handler');

// @desc    Tạo khuyến mãi mới
// @route   POST /api/promotions
// @access  Private/Admin
const createPromotion = asyncHandler(async (req, res) => {
    const {
        name,
        description,
        type,
        value,
        code,
        minOrderValue,
        maxDiscountValue,
        startDate,
        endDate,
        isActive,
        storeId,
        applicableProducts,
        applicableCategories
    } = req.body;

    const promotion = new Promotion({
        name,
        description,
        type, // 'percentage', 'fixed', 'buy_x_get_y'
        value,
        code,
        minOrderValue: minOrderValue || 0,
        maxDiscountValue: maxDiscountValue || 0,
        startDate: startDate || Date.now(),
        endDate,
        isActive: isActive !== undefined ? isActive : true,
        storeId,
        applicableProducts,
        applicableCategories,
        createdBy: req.user._id
    });

    const createdPromotion = await promotion.save();
    res.status(201).json(createdPromotion);
});

// @desc    Lấy thông tin khuyến mãi theo ID
// @route   GET /api/promotions/:id
// @access  Private
const getPromotionById = asyncHandler(async (req, res) => {
    const promotion = await Promotion.findById(req.params.id);

    if (promotion) {
        res.json(promotion);
    } else {
        res.status(404);
        throw new Error('Không tìm thấy khuyến mãi');
    }
});

// @desc    Cập nhật thông tin khuyến mãi
// @route   PUT /api/promotions/:id
// @access  Private/Admin
const updatePromotion = asyncHandler(async (req, res) => {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
        res.status(404);
        throw new Error('Không tìm thấy khuyến mãi');
    }

    // Cập nhật các trường
    Object.keys(req.body).forEach(key => {
        promotion[key] = req.body[key];
    });

    // Lưu lại thông tin
    const updatedPromotion = await promotion.save();
    res.json(updatedPromotion);
});

// @desc    Xóa khuyến mãi
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
const deletePromotion = asyncHandler(async (req, res) => {
    const promotion = await Promotion.findById(req.params.id);

    if (!promotion) {
        res.status(404);
        throw new Error('Không tìm thấy khuyến mãi');
    }

    await promotion.deleteOne();
    res.json({ message: 'Đã xóa khuyến mãi' });
});

// @desc    Lấy tất cả khuyến mãi
// @route   GET /api/promotions
// @access  Private
const getAllPromotions = asyncHandler(async (req, res) => {
    const promotions = await Promotion.find({})
        .sort('-createdAt');
    res.json(promotions);
});

// @desc    Lấy các khuyến mãi đang hoạt động
// @route   GET /api/promotions/active
// @access  Private
const getActivePromotions = asyncHandler(async (req, res) => {
    const now = new Date();
    const promotions = await Promotion.find({
        isActive: true,
        startDate: { $lte: now },
        $or: [
            { endDate: { $gte: now } },
            { endDate: null }
        ]
    }).sort('-createdAt');
    res.json(promotions);
});

// @desc    Lấy khuyến mãi của một cửa hàng
// @route   GET /api/promotions/store/:storeId
// @access  Private
const getStorePromotions = asyncHandler(async (req, res) => {
    const { storeId } = req.params;
    const promotions = await Promotion.find({ storeId })
        .sort('-createdAt');
    res.json(promotions);
});

module.exports = {
    createPromotion,
    getPromotionById,
    updatePromotion,
    deletePromotion,
    getAllPromotions,
    getActivePromotions,
    getStorePromotions
};