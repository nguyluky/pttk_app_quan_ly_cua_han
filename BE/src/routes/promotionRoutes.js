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

/**
 * @swagger
 * tags:
 *   name: Promotions
 *   description: Quản lý khuyến mãi
 */

/**
 * @swagger
 * /promotions:
 *   post:
 *     summary: Tạo khuyến mãi mới
 *     tags: [Promotions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - storeId
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên chương trình khuyến mãi
 *               description:
 *                 type: string
 *                 description: Mô tả khuyến mãi
 *               type:
 *                 type: string
 *                 enum: [percentage, amount, buy_x_get_y, special]
 *                 description: Loại khuyến mãi
 *               value:
 *                 type: number
 *                 description: Giá trị khuyến mãi (% hoặc số tiền)
 *               code:
 *                 type: string
 *                 description: Mã khuyến mãi (nếu có)
 *               minOrderValue:
 *                 type: number
 *                 description: Giá trị đơn hàng tối thiểu
 *               maxDiscountValue:
 *                 type: number
 *                 description: Giá trị giảm giá tối đa
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Ngày bắt đầu
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: Ngày kết thúc
 *               isActive:
 *                 type: boolean
 *                 description: Trạng thái kích hoạt
 *               storeId:
 *                 type: string
 *                 description: ID cửa hàng áp dụng
 *               applicableProducts:
 *                 type: array
 *                 description: Danh sách sản phẩm được áp dụng
 *                 items:
 *                   type: string
 *               applicableCategories:
 *                 type: array
 *                 description: Danh sách danh mục được áp dụng
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Tạo khuyến mãi thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promotion'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập
 *
 *   get:
 *     summary: Lấy danh sách tất cả khuyến mãi
 *     tags: [Promotions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách khuyến mãi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Promotion'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// @route   POST /api/promotions
// @desc    Tạo khuyến mãi mới
// @access  Private/Admin
router.post('/', protect, admin, createPromotion);

// @route   GET /api/promotions
// @desc    Lấy tất cả khuyến mãi
// @access  Private
router.get('/', protect, getAllPromotions);

/**
 * @swagger
 * /promotions/active:
 *   get:
 *     summary: Lấy danh sách khuyến mãi đang hoạt động
 *     tags: [Promotions]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách khuyến mãi đang hoạt động
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Promotion'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// @route   GET /api/promotions/active
// @desc    Lấy các khuyến mãi đang hoạt động
// @access  Private
router.get('/active', protect, getActivePromotions);

/**
 * @swagger
 * /promotions/store/{storeId}:
 *   get:
 *     summary: Lấy danh sách khuyến mãi theo cửa hàng
 *     tags: [Promotions]
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
 *         description: Danh sách khuyến mãi của cửa hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Promotion'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

// @route   GET /api/promotions/store/:storeId
// @desc    Lấy khuyến mãi của một cửa hàng
// @access  Private
router.get('/store/:storeId', protect, getStorePromotions);

/**
 * @swagger
 * /promotions/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết khuyến mãi
 *     tags: [Promotions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của khuyến mãi
 *     responses:
 *       200:
 *         description: Chi tiết khuyến mãi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promotion'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 *   put:
 *     summary: Cập nhật thông tin khuyến mãi
 *     tags: [Promotions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của khuyến mãi
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [percentage, amount, buy_x_get_y, special]
 *               value:
 *                 type: number
 *               code:
 *                 type: string
 *               minOrderValue:
 *                 type: number
 *               maxDiscountValue:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               isActive:
 *                 type: boolean
 *               applicableProducts:
 *                 type: array
 *                 items:
 *                   type: string
 *               applicableCategories:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Cập nhật khuyến mãi thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promotion'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 *   delete:
 *     summary: Xóa khuyến mãi
 *     tags: [Promotions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của khuyến mãi
 *     responses:
 *       200:
 *         description: Xóa khuyến mãi thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Đã xóa khuyến mãi thành công
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

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

module.exports = router;