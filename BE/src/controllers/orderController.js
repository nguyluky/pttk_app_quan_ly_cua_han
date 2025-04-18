const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const {
        orderItems,
        storeId,
        tableId,
        paymentMethod,
        itemsPrice,
        taxPrice,
        totalPrice,
        note,
        couponApplied,
        promotionApplied
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
        res.status(400);
        throw new Error('Không có sản phẩm nào trong đơn hàng');
    }

    // Tạo đơn hàng mới
    const order = new Order({
        user: req.user._id,
        orderItems,
        storeId,
        tableId,
        paymentMethod,
        itemsPrice,
        taxPrice,
        totalPrice,
        note,
        couponApplied,
        promotionApplied,
        status: 'pending'
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
});

// @desc    Lấy thông tin đơn hàng theo ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name email')
        .populate('orderItems.product', 'name price image');

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }
});

// @desc    Cập nhật thông tin đơn hàng
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }

    // Kiểm tra quyền cập nhật (chỉ admin hoặc người tạo đơn hàng)
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Bạn không có quyền cập nhật đơn hàng này');
    }

    // Cập nhật các trường của đơn hàng
    Object.keys(req.body).forEach(key => {
        if (key !== 'status' && key !== 'user' && key !== '_id') {
            order[key] = req.body[key];
        }
    });

    const updatedOrder = await order.save();
    res.json(updatedOrder);
});

// @desc    Cập nhật trạng thái đơn hàng
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }

    order.status = status;
    if (status === 'paid') {
        order.isPaid = true;
        order.paidAt = Date.now();
    } else if (status === 'completed') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
});

// @desc    Lấy danh sách tất cả đơn hàng (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({})
        .populate('user', 'id name')
        .sort('-createdAt');
    res.json(orders);
});

// @desc    Lấy danh sách đơn hàng của người dùng hiện tại
// @route   GET /api/orders/user
// @access  Private
const getUserOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
        .sort('-createdAt');
    res.json(orders);
});

// @desc    Lấy danh sách đơn hàng của cửa hàng
// @route   GET /api/orders/store/:storeId
// @access  Private
const getStoreOrders = asyncHandler(async (req, res) => {
    const { storeId } = req.params;

    // Kiểm tra quyền truy cập vào cửa hàng
    // (logic kiểm tra quyền có thể được mở rộng tùy theo yêu cầu)

    const orders = await Order.find({ storeId })
        .populate('user', 'id name')
        .sort('-createdAt');
    res.json(orders);
});

// @desc    Xóa đơn hàng
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng');
    }

    await order.deleteOne();
    res.json({ message: 'Đơn hàng đã được xóa' });
});

// @desc    Tách đơn hàng
// @route   POST /api/orders/:id/split
// @access  Private
const splitOrder = asyncHandler(async (req, res) => {
    const { orderItemsToSplit, newTableId } = req.body;

    const originalOrder = await Order.findById(req.params.id);
    if (!originalOrder) {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng gốc');
    }

    // Tạo đơn hàng mới với các sản phẩm được tách
    const newOrder = new Order({
        user: req.user._id,
        storeId: originalOrder.storeId,
        tableId: newTableId || originalOrder.tableId,
        paymentMethod: originalOrder.paymentMethod,
        orderItems: orderItemsToSplit,
        itemsPrice: orderItemsToSplit.reduce((acc, item) => acc + item.price * item.qty, 0),
        taxPrice: 0, // Tính toán thuế cho đơn hàng mới
        totalPrice: 0, // Tính tổng giá trị đơn hàng mới
        status: 'pending'
    });

    // Cập nhật thuế và tổng giá
    newOrder.taxPrice = newOrder.itemsPrice * 0.1; // 10% thuế (ví dụ)
    newOrder.totalPrice = newOrder.itemsPrice + newOrder.taxPrice;

    // Loại bỏ các sản phẩm đã tách khỏi đơn hàng gốc
    const itemIdsToRemove = orderItemsToSplit.map(item => item._id.toString());
    originalOrder.orderItems = originalOrder.orderItems.filter(
        item => !itemIdsToRemove.includes(item._id.toString())
    );

    // Cập nhật giá và thuế của đơn hàng gốc
    originalOrder.itemsPrice = originalOrder.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    originalOrder.taxPrice = originalOrder.itemsPrice * 0.1; // 10% thuế (ví dụ)
    originalOrder.totalPrice = originalOrder.itemsPrice + originalOrder.taxPrice;

    // Lưu cả hai đơn hàng
    await originalOrder.save();
    const createdOrder = await newOrder.save();

    res.status(201).json({
        message: 'Đã tách đơn hàng thành công',
        originalOrder,
        newOrder: createdOrder
    });
});

// @desc    Gộp đơn hàng
// @route   POST /api/orders/merge
// @access  Private
const mergeOrders = asyncHandler(async (req, res) => {
    const { orderIds, targetOrderId } = req.body;

    if (!orderIds || orderIds.length < 2) {
        res.status(400);
        throw new Error('Cần ít nhất 2 đơn hàng để gộp');
    }

    // Lấy đơn hàng đích (nếu được chỉ định) hoặc sử dụng đơn hàng đầu tiên trong danh sách
    const targetId = targetOrderId || orderIds[0];
    const targetOrder = await Order.findById(targetId);

    if (!targetOrder) {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng đích');
    }

    // Lấy các đơn hàng còn lại để gộp
    const ordersToMerge = await Order.find({
        _id: { $in: orderIds.filter(id => id !== targetId) }
    });

    if (ordersToMerge.length === 0) {
        res.status(404);
        throw new Error('Không tìm thấy đơn hàng để gộp');
    }

    // Gộp các sản phẩm từ các đơn hàng
    for (const order of ordersToMerge) {
        targetOrder.orderItems = [...targetOrder.orderItems, ...order.orderItems];

        // Xóa các đơn hàng đã được gộp
        await order.deleteOne();
    }

    // Cập nhật giá tiền
    targetOrder.itemsPrice = targetOrder.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    targetOrder.taxPrice = targetOrder.itemsPrice * 0.1; // 10% thuế (ví dụ)
    targetOrder.totalPrice = targetOrder.itemsPrice + targetOrder.taxPrice;

    // Lưu đơn hàng đã gộp
    const updatedOrder = await targetOrder.save();

    res.json({
        message: 'Đã gộp đơn hàng thành công',
        order: updatedOrder
    });
});

module.exports = {
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
};