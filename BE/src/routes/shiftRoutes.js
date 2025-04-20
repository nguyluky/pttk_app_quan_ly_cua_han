const express = require('express');
const router = express.Router();
const {
    createShift,
    getShifts,
    getShiftById,
    updateShift,
    deleteShift
} = require('../controllers/shiftController');
const { protect, admin, manager } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Shifts
 *   description: Quản lý ca làm việc
 */

/**
 * @swagger
 * /shifts:
 *   post:
 *     summary: Tạo ca làm việc mới
 *     tags: [Shifts]
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
 *               - startTime
 *               - endTime
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên ca làm việc
 *               startTime:
 *                 type: string
 *                 description: Giờ bắt đầu ca (HH:MM)
 *               endTime:
 *                 type: string
 *                 description: Giờ kết thúc ca (HH:MM)
 *               color:
 *                 type: string
 *                 description: Mã màu hiển thị (hex hoặc tên màu)
 *     responses:
 *       201:
 *         description: Ca làm việc được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shift'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập
 *   
 *   get:
 *     summary: Lấy tất cả ca làm việc của cửa hàng
 *     tags: [Shifts]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách ca làm việc
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Shift'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập
 */

// Các routes cho ca làm việc
router.route('/')
    .post(protect, manager, createShift)
    .get(protect, manager, getShifts);

/**
 * @swagger
 * /shifts/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết ca làm việc
 *     tags: [Shifts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của ca làm việc
 *     responses:
 *       200:
 *         description: Chi tiết ca làm việc
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shift'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 *   put:
 *     summary: Cập nhật thông tin ca làm việc
 *     tags: [Shifts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của ca làm việc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên ca làm việc
 *               startTime:
 *                 type: string
 *                 description: Giờ bắt đầu ca (HH:MM)
 *               endTime:
 *                 type: string
 *                 description: Giờ kết thúc ca (HH:MM)
 *               color:
 *                 type: string
 *                 description: Mã màu hiển thị (hex hoặc tên màu)
 *     responses:
 *       200:
 *         description: Cập nhật ca làm việc thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Shift'
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
 *     summary: Xóa ca làm việc
 *     tags: [Shifts]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của ca làm việc
 *     responses:
 *       200:
 *         description: Ca làm việc đã được xóa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ca làm việc đã được xóa
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

router.route('/:id')
    .get(protect, manager, getShiftById)
    .put(protect, manager, updateShift)
    .delete(protect, manager, deleteShift);

module.exports = router;