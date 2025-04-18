const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getInventoryItems,
    getInventoryItemById,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addInventoryStock,
    reduceInventoryStock,
    getLowStockItems,
    getInventoryByStore
} = require('../controllers/inventoryController');

// @route   GET /api/inventory
// @desc    Lấy danh sách tất cả các mặt hàng trong kho
// @access  Private
router.get('/', protect, getInventoryItems);

// @route   GET /api/inventory/:id
// @desc    Lấy thông tin chi tiết một mặt hàng trong kho
// @access  Private
router.get('/:id', protect, getInventoryItemById);

// @route   POST /api/inventory
// @desc    Tạo mới một mặt hàng trong kho
// @access  Private/Admin
router.post('/', protect, admin, createInventoryItem);

// @route   PUT /api/inventory/:id
// @desc    Cập nhật thông tin mặt hàng trong kho
// @access  Private/Admin
router.put('/:id', protect, admin, updateInventoryItem);

// @route   DELETE /api/inventory/:id
// @desc    Xóa mặt hàng khỏi kho
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteInventoryItem);

// @route   POST /api/inventory/:id/add
// @desc    Thêm số lượng cho mặt hàng trong kho
// @access  Private
router.post('/:id/add', protect, addInventoryStock);

// @route   POST /api/inventory/:id/reduce
// @desc    Giảm số lượng mặt hàng trong kho
// @access  Private
router.post('/:id/reduce', protect, reduceInventoryStock);

// @route   GET /api/inventory/low-stock
// @desc    Lấy danh sách các mặt hàng có số lượng thấp
// @access  Private
router.get('/low-stock', protect, getLowStockItems);

// @route   GET /api/inventory/store/:storeId
// @desc    Lấy danh sách kho hàng theo cửa hàng
// @access  Private
router.get('/store/:storeId', protect, getInventoryByStore);

module.exports = router;