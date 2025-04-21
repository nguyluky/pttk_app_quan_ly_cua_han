/**
 * @swagger
 * tags:
 *   name: Tables
 *   description: API quản lý bàn
 */

/**
 * @swagger
 * /tables:
 *   get:
 *     summary: Lấy danh sách bàn
 *     tags: [Tables]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: string
 *         description: ID cửa hàng để lọc bàn
 *     responses:
 *       200:
 *         description: Danh sách bàn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Table'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     summary: Tạo bàn mới
 *     tags: [Tables]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tableNumber
 *               - capacity
 *               - storeId
 *             properties:
 *               tableNumber:
 *                 type: string
 *                 description: Số hoặc tên của bàn
 *               capacity:
 *                 type: number
 *                 description: Sức chứa tối đa của bàn (số người)
 *               location:
 *                 type: string
 *                 description: Vị trí của bàn (ví dụ tầng 1, ngoài trời, v.v.)
 *               storeId:
 *                 type: string
 *                 description: ID cửa hàng bàn thuộc về
 *     responses:
 *       201:
 *         description: Đã tạo bàn thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Table'
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc số bàn đã tồn tại
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 * 
 * /tables/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết một bàn
 *     tags: [Tables]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bàn
 *     responses:
 *       200:
 *         description: Thông tin chi tiết của bàn
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Table'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   put:
 *     summary: Cập nhật thông tin bàn
 *     tags: [Tables]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bàn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tableNumber:
 *                 type: string
 *                 description: Số hoặc tên của bàn
 *               capacity:
 *                 type: number
 *                 description: Sức chứa tối đa của bàn
 *               location:
 *                 type: string
 *                 description: Vị trí của bàn
 *               isActive:
 *                 type: boolean
 *                 description: Trạng thái kích hoạt của bàn
 *     responses:
 *       200:
 *         description: Bàn đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Table'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 * /tables/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái bàn
 *     tags: [Tables]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bàn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, occupied, reserved, cleaning]
 *                 description: Trạng thái mới của bàn
 *               currentOrderId:
 *                 type: string
 *                 description: ID đơn hàng hiện đang sử dụng bàn
 *     responses:
 *       200:
 *         description: Trạng thái bàn đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Table'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 * /tables/store/{id}:
 *   get:
 *     summary: Lấy danh sách bàn theo ID cửa hàng
 *     tags: [Tables]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của cửa hàng
 *     responses:
 *       200:
 *         description: Danh sách bàn của cửa hàng
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Table'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

const express = require('express');
const {
    getTables,
    getTableById,
    createTable,
    updateTableStatus,
    updateTable,
    getTablesByStoreId
} = require('../controllers/tableController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, getTables)
    .post(protect, admin, createTable);

router.route('/store/:id')
    .get(protect, getTablesByStoreId);

router.route('/:id')
    .get(protect, getTableById)
    .put(protect, admin, updateTable);

router.route('/:id/status')
    .put(protect, updateTableStatus);

module.exports = router;