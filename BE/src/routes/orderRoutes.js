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

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Quản lý đơn hàng
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Tạo đơn hàng mới
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderItems
 *               - storeId
 *               - totalPrice
 *             properties:
 *               orderItems:
 *                 type: array
 *                 description: Danh sách các mặt hàng trong đơn hàng
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                       description: ID của sản phẩm
 *                     name:
 *                       type: string
 *                       description: Tên sản phẩm
 *                     quantity:
 *                       type: integer
 *                       description: Số lượng sản phẩm
 *                     price:
 *                       type: number
 *                       description: Giá của sản phẩm
 *               storeId:
 *                 type: string
 *                 description: ID cửa hàng
 *               tableId:
 *                 type: string
 *                 description: ID của bàn (nếu có)
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, momo, other]
 *                 description: Phương thức thanh toán
 *               itemsPrice:
 *                 type: number
 *                 description: Tổng giá các mặt hàng
 *               taxPrice:
 *                 type: number
 *                 description: Giá trị thuế
 *               totalPrice:
 *                 type: number
 *                 description: Tổng tiền đơn hàng
 *               note:
 *                 type: string
 *                 description: Ghi chú đơn hàng
 *               couponApplied:
 *                 type: string
 *                 description: ID của phiếu giảm giá được áp dụng
 *               promotionApplied:
 *                 type: string
 *                 description: ID của khuyến mãi được áp dụng
 *     responses:
 *       201:
 *         description: Đơn hàng đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 *   get:
 *     summary: Lấy tất cả đơn hàng (Admin)
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập
 */

// @route   POST /api/orders
// @desc    Tạo đơn hàng mới
// @access  Private
router.post('/', protect, createOrder);

// @route   GET /api/orders
// @desc    Lấy danh sách tất cả đơn hàng (quản trị viên)
// @access  Private/Admin
router.get('/', protect, admin, getOrders);

/**
 * @swagger
 * /orders/user:
 *   get:
 *     summary: Lấy đơn hàng của người dùng hiện tại
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng của người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// @route   GET /api/orders/user
// @desc    Lấy danh sách đơn hàng của người dùng hiện tại
// @access  Private
router.get('/user', protect, getUserOrders);

/**
 * @swagger
 * /orders/store/{storeId}:
 *   get:
 *     summary: Lấy đơn hàng của một cửa hàng
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của cửa hàng
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng của cửa hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

// @route   GET /api/orders/store/:storeId
// @desc    Lấy danh sách đơn hàng của cửa hàng
// @access  Private
router.get('/store/:storeId', protect, getStoreOrders);

/**
 * @swagger
 * /orders/merge:
 *   post:
 *     summary: Gộp các đơn hàng
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderIds
 *               - targetOrderId
 *             properties:
 *               orderIds:
 *                 type: array
 *                 description: Danh sách ID các đơn hàng cần gộp
 *                 items:
 *                   type: string
 *               targetOrderId:
 *                 type: string
 *                 description: ID đơn hàng đích để gộp vào
 *     responses:
 *       200:
 *         description: Đơn hàng đã được gộp thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Không tìm thấy một trong các đơn hàng
 */

// @route   POST /api/orders/merge
// @desc    Gộp đơn hàng
// @access  Private
router.post('/merge', protect, mergeOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết đơn hàng
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của đơn hàng
 *     responses:
 *       200:
 *         description: Chi tiết đơn hàng
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 * 
 *   put:
 *     summary: Cập nhật thông tin đơn hàng
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của đơn hàng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product:
 *                       type: string
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *                     price:
 *                       type: number
 *               tableId:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *               totalPrice:
 *                 type: number
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đơn hàng đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Không có quyền cập nhật
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 * 
 *   delete:
 *     summary: Xóa đơn hàng
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của đơn hàng
 *     responses:
 *       200:
 *         description: Đơn hàng đã được xóa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Đơn hàng đã được xóa thành công
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Không có quyền xóa
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

// @route   GET /api/orders/:id
// @desc    Lấy thông tin đơn hàng theo ID
// @access  Private
router.get('/:id', protect, getOrderById);

// @route   PUT /api/orders/:id
// @desc    Cập nhật thông tin đơn hàng
// @access  Private
router.put('/:id', protect, updateOrder);

// @route   DELETE /api/orders/:id
// @desc    Xóa đơn hàng
// @access  Private/Admin
router.delete('/:id', protect, admin, deleteOrder);

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái đơn hàng
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của đơn hàng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, completed, cancelled]
 *                 description: Trạng thái mới của đơn hàng
 *     responses:
 *       200:
 *         description: Trạng thái đơn hàng đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

// @route   PUT /api/orders/:id/status
// @desc    Cập nhật trạng thái đơn hàng
// @access  Private
router.put('/:id/status', protect, updateOrderStatus);

/**
 * @swagger
 * /orders/{id}/split:
 *   post:
 *     summary: Tách đơn hàng
 *     tags: [Orders]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của đơn hàng cần tách
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 description: Danh sách các mặt hàng và số lượng để tách sang đơn hàng mới
 *                 items:
 *                   type: object
 *                   properties:
 *                     itemIndex:
 *                       type: integer
 *                       description: Vị trí của mặt hàng trong đơn hàng gốc
 *                     quantity:
 *                       type: integer
 *                       description: Số lượng cần tách
 *               tableId:
 *                 type: string
 *                 description: ID bàn cho đơn hàng mới (nếu có)
 *     responses:
 *       200:
 *         description: Đơn hàng đã được tách thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 originalOrder:
 *                   $ref: '#/components/schemas/Order'
 *                 newOrder:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Không tìm thấy đơn hàng
 */

// @route   POST /api/orders/:id/split
// @desc    Tách đơn hàng
// @access  Private
router.post('/:id/split', protect, splitOrder);

module.exports = router;