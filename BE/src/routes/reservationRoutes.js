/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: API quản lý đặt bàn
 */

/**
 * @swagger
 * /reservations:
 *   get:
 *     summary: Lấy danh sách đặt bàn
 *     tags: [Reservations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: string
 *         description: ID cửa hàng để lọc đặt bàn
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Ngày để lọc đặt bàn (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled, no-show]
 *         description: Trạng thái đặt bàn để lọc
 *     responses:
 *       200:
 *         description: Danh sách đặt bàn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     summary: Tạo đặt bàn mới
 *     tags: [Reservations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - customerPhone
 *               - tableId
 *               - reservationDate
 *               - numberOfGuests
 *               - storeId
 *             properties:
 *               customerName:
 *                 type: string
 *                 description: Tên khách hàng đặt bàn
 *               customerPhone:
 *                 type: string
 *                 description: Số điện thoại khách hàng
 *               customerEmail:
 *                 type: string
 *                 description: Email khách hàng
 *               tableId:
 *                 type: string
 *                 description: ID của bàn được đặt
 *               reservationDate:
 *                 type: string
 *                 format: date-time
 *                 description: Thời gian đặt bàn
 *               duration:
 *                 type: number
 *                 description: Thời gian dự kiến sử dụng (tính bằng phút)
 *                 default: 120
 *               numberOfGuests:
 *                 type: number
 *                 description: Số lượng khách
 *               specialRequests:
 *                 type: string
 *                 description: Yêu cầu đặc biệt
 *               storeId:
 *                 type: string
 *                 description: ID cửa hàng
 *     responses:
 *       201:
 *         description: Đã tạo đặt bàn thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc bàn đã được đặt vào thời gian này
 *       404:
 *         description: Không tìm thấy bàn
 * 
 * /reservations/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết một đặt bàn
 *     tags: [Reservations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đặt bàn
 *     responses:
 *       200:
 *         description: Thông tin chi tiết của đặt bàn
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 * /reservations/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái đặt bàn
 *     tags: [Reservations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của đặt bàn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled, no-show]
 *                 description: Trạng thái mới của đặt bàn
 *               orderId:
 *                 type: string
 *                 description: ID đơn hàng liên kết với đặt bàn
 *     responses:
 *       200:
 *         description: Trạng thái đặt bàn đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

const express = require('express');
const {
    getReservations,
    getReservationById,
    createReservation,
    updateReservationStatus
} = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, getReservations)
    .post(createReservation); // Không cần xác thực để khách có thể đặt bàn

router.route('/:id')
    .get(protect, getReservationById);

router.route('/:id/status')
    .put(protect, updateReservationStatus);

module.exports = router;