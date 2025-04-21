const express = require('express');
const router = express.Router();
const {
    createSchedule,
    getSchedules,
    getMySchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule,
    updateScheduleStatus,
    createBulkSchedules
} = require('../controllers/scheduleController');
const { protect, admin, manager } = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: Quản lý lịch làm việc của nhân viên
 */

/**
 * @swagger
 * /schedules:
 *   post:
 *     summary: Tạo lịch làm việc mới
 *     tags: [Schedules]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - shiftId
 *               - date
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID của nhân viên
 *               shiftId:
 *                 type: string
 *                 description: ID của ca làm việc
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Ngày làm việc
 *               notes:
 *                 type: string
 *                 description: Ghi chú
 *               status:
 *                 type: string
 *                 enum: [scheduled, confirmed, completed, absent, late]
 *                 description: Trạng thái lịch làm việc
 *                 default: scheduled
 *     responses:
 *       201:
 *         description: Lịch làm việc đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc trùng lịch
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy nhân viên
 *
 *   get:
 *     summary: Lấy danh sách lịch làm việc của cửa hàng
 *     tags: [Schedules]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu để lọc (tùy chọn)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày kết thúc để lọc (tùy chọn)
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: ID của nhân viên để lọc (tùy chọn)
 *     responses:
 *       200:
 *         description: Danh sách lịch làm việc
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập
 */

// Routes cho lịch làm việc
router.route('/')
    .post(protect, manager, createSchedule)
    .get(protect, manager, getSchedules);

/**
 * @swagger
 * /schedules/bulk:
 *   post:
 *     summary: Tạo nhiều lịch làm việc cùng lúc
 *     tags: [Schedules]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - schedules
 *             properties:
 *               schedules:
 *                 type: array
 *                 description: Danh sách các lịch làm việc cần tạo
 *                 items:
 *                   type: object
 *                   required:
 *                     - userId
 *                     - shiftId
 *                     - date
 *                   properties:
 *                     userId:
 *                       type: string
 *                       description: ID của nhân viên
 *                     shiftId:
 *                       type: string
 *                       description: ID của ca làm việc
 *                     date:
 *                       type: string
 *                       format: date
 *                       description: Ngày làm việc
 *                     notes:
 *                       type: string
 *                       description: Ghi chú
 *                     status:
 *                       type: string
 *                       enum: [scheduled, confirmed, completed, absent, late]
 *                       description: Trạng thái lịch làm việc
 *     responses:
 *       201:
 *         description: Lịch làm việc đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Thông báo kết quả tạo lịch
 *                 success:
 *                   type: integer
 *                   description: Số lịch tạo thành công
 *                 failed:
 *                   type: integer
 *                   description: Số lịch tạo thất bại
 *                 errors:
 *                   type: array
 *                   description: Danh sách lỗi (nếu có)
 *                   items:
 *                     type: string
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập
 */

// Route tạo nhiều lịch làm việc cùng lúc
router.post('/bulk', protect, manager, createBulkSchedules);

/**
 * @swagger
 * /schedules/me:
 *   get:
 *     summary: Lấy danh sách lịch làm việc của nhân viên hiện tại
 *     tags: [Schedules]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày bắt đầu để lọc (tùy chọn)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày kết thúc để lọc (tùy chọn)
 *     responses:
 *       200:
 *         description: Danh sách lịch làm việc của nhân viên
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// Route lấy lịch làm việc của bản thân (nhân viên)
router.get('/me', protect, getMySchedules);

/**
 * @swagger
 * /schedules/{id}:
 *   get:
 *     summary: Lấy chi tiết lịch làm việc
 *     tags: [Schedules]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của lịch làm việc
 *     responses:
 *       200:
 *         description: Chi tiết lịch làm việc
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 * 
 *   put:
 *     summary: Cập nhật thông tin lịch làm việc
 *     tags: [Schedules]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của lịch làm việc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shiftId:
 *                 type: string
 *                 description: ID của ca làm việc
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Ngày làm việc
 *               notes:
 *                 type: string
 *                 description: Ghi chú
 *               status:
 *                 type: string
 *                 enum: [scheduled, confirmed, completed, absent, late]
 *                 description: Trạng thái lịch làm việc
 *     responses:
 *       200:
 *         description: Lịch làm việc đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
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
 *     summary: Xóa lịch làm việc
 *     tags: [Schedules]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của lịch làm việc
 *     responses:
 *       200:
 *         description: Lịch làm việc đã được xóa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lịch làm việc đã được xóa
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

// Routes thao tác với từng lịch làm việc theo ID
router.route('/:id')
    .get(protect, getScheduleById)
    .put(protect, manager, updateSchedule)
    .delete(protect, manager, deleteSchedule);

/**
 * @swagger
 * /schedules/{id}/status:
 *   patch:
 *     summary: Cập nhật trạng thái lịch làm việc
 *     tags: [Schedules]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của lịch làm việc
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
 *                 enum: [scheduled, confirmed, completed, absent, late]
 *                 description: Trạng thái mới của lịch làm việc
 *     responses:
 *       200:
 *         description: Trạng thái lịch làm việc đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

// Route cập nhật trạng thái lịch làm việc
router.patch('/:id/status', protect, updateScheduleStatus);

module.exports = router;