const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    createOrder,
    getOrderById,
    updateOrder,
    getOrders,
    getUserOrders,
    getStoreOrders,
    deleteOrder,
    updateOrderStatus,
    splitOrder,
    mergeOrders
} = require('../controllers/orderController');

// @route   POST /api/orders
// @desc    Tạo đơn hàng mới
// @access  Private
router.post('/', protect, createOrder);

// @route   GET /api/orders/:id
// @desc    Lấy thông tin đơn hàng theo ID
// @access  Private
router.get('/:id', protect, getOrderById);

// @route   PUT /api/orders/:id
// @desc    Cập nhật thông tin đơn hàng
// @access  Private
router.put('/:id', protect, updateOrder);

// @route   PUT /api/orders/:id/status
// @desc    Cập nhật trạng thái đơn hàng
// @access  Private
router.put('/:id/status', protect, updateOrderStatus);

// @route   GET /api/orders
// @desc    Lấy danh sách tất cả đơn hàng (quản trị viên)
// @access  Private/Admin
router.get('/', protect, admin, getOrders);

// @route   GET /api/orders/user
// @desc    Lấy danh sách đơn hàng của người dùng hiện tại
// @access  Private
router.get('/user', protect, getUserOrders);

// @route   GET /api/orders/store/:storeId
// @desc    Lấy danh sách đơn hàng của cửa hàng
// @access  Private
router.get('/store/:storeId', protect, getStoreOrders);

// @route   DELETE /api/orders/:id
// @desc    Xóa đơn hàng
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteOrder);

// @route   POST /api/orders/:id/split
// @desc    Tách đơn hàng
// @access  Private
router.post('/:id/split', protect, splitOrder);

// @route   POST /api/orders/merge
// @desc    Gộp đơn hàng
// @access  Private
router.post('/merge', protect, mergeOrders);

module.exports = router;