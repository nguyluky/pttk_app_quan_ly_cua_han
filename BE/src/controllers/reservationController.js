const asyncHandler = require('express-async-handler');
const Reservation = require('../models/reservationModel');
const Table = require('../models/tableModel');

// Lấy danh sách đặt bàn
const getReservations = asyncHandler(async (req, res) => {
    const { storeId, date, status } = req.query;

    const filter = {};
    if (storeId) filter.storeId = storeId;
    if (status) filter.status = status;

    // Lọc theo ngày nếu có
    if (date) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        filter.reservationDate = { $gte: startDate, $lte: endDate };
    }

    const reservations = await Reservation.find(filter)
        .populate('tableId', 'tableNumber capacity')
        .sort('-reservationDate');

    res.json(reservations);
});

// Lấy thông tin đặt bàn theo ID
const getReservationById = asyncHandler(async (req, res) => {
    const reservation = await Reservation.findById(req.params.id)
        .populate('tableId', 'tableNumber capacity location')
        .populate('orderId');

    if (reservation) {
        res.json(reservation);
    } else {
        res.status(404);
        throw new Error('Không tìm thấy đặt bàn');
    }
});

// Tạo đặt bàn mới
const createReservation = asyncHandler(async (req, res) => {
    const {
        customerName,
        customerPhone,
        customerEmail,
        tableId,
        reservationDate,
        duration,
        numberOfGuests,
        specialRequests,
        storeId
    } = req.body;

    // Kiểm tra bàn có trống vào thời gian đặt không
    const table = await Table.findById(tableId);
    if (!table) {
        res.status(404);
        throw new Error('Không tìm thấy bàn');
    }

    if (table.capacity < numberOfGuests) {
        res.status(400);
        throw new Error('Bàn không đủ chỗ cho số khách');
    }

    // Kiểm tra bàn đã được đặt vào thời điểm này chưa
    const bookingStart = new Date(reservationDate);
    const bookingEnd = new Date(bookingStart.getTime() + duration * 60000);

    const conflictingReservation = await Reservation.findOne({
        tableId,
        status: { $in: ['pending', 'confirmed'] },
        $or: [
            {
                // Đặt bàn khác bắt đầu trong khoảng thời gian này
                reservationDate: {
                    $gte: bookingStart,
                    $lt: bookingEnd
                }
            },
            {
                // Đặt bàn khác kết thúc trong khoảng thời gian này
                $expr: {
                    $and: [
                        { $gte: [{ $add: ["$reservationDate", { $multiply: ["$duration", 60000] }] }, bookingStart] },
                        { $lte: [{ $add: ["$reservationDate", { $multiply: ["$duration", 60000] }] }, bookingEnd] }
                    ]
                }
            }
        ]
    });

    if (conflictingReservation) {
        res.status(400);
        throw new Error('Bàn đã được đặt vào thời gian này');
    }

    const reservation = await Reservation.create({
        customerName,
        customerPhone,
        customerEmail,
        tableId,
        reservationDate,
        duration,
        numberOfGuests,
        specialRequests,
        storeId,
        status: 'confirmed'
    });

    // Cập nhật trạng thái bàn nếu đặt bàn cho thời điểm hiện tại
    const now = new Date();
    const fifteenMinutes = 15 * 60 * 1000; // 15 phút tính theo mili giây

    if (Math.abs(bookingStart - now) < fifteenMinutes) {
        await Table.findByIdAndUpdate(tableId, { status: 'reserved' });
    }

    res.status(201).json(reservation);
});

// Cập nhật trạng thái đặt bàn
const updateReservationStatus = asyncHandler(async (req, res) => {
    const { status, orderId } = req.body;

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
        res.status(404);
        throw new Error('Không tìm thấy đặt bàn');
    }

    // Cập nhật trạng thái
    if (status) {
        reservation.status = status;

        // Nếu xác nhận đặt bàn, cập nhật trạng thái bàn
        if (status === 'confirmed') {
            // Xác định xem đặt bàn có trong vòng 15 phút nữa không
            const now = new Date();
            const reservationTime = new Date(reservation.reservationDate);
            const timeDiff = reservationTime - now;

            // Nếu đặt bàn trong vòng 15 phút tới, cập nhật trạng thái bàn thành reserved
            if (timeDiff <= 15 * 60 * 1000 && timeDiff > 0) {
                await Table.findByIdAndUpdate(reservation.tableId, {
                    status: 'reserved'
                });
            }
        }
        // Nếu khách đã đến và sử dụng
        else if (status === 'completed') {
            // Không thay đổi trạng thái bàn ở đây vì có thể đã có order liên kết
            if (orderId) {
                reservation.orderId = orderId;
            }
        }
        // Nếu khách hủy hoặc không đến
        else if (status === 'cancelled' || status === 'no-show') {
            // Kiểm tra xem bàn này có đang được giữ cho đặt bàn này không
            const table = await Table.findById(reservation.tableId);
            if (table && table.status === 'reserved') {
                await Table.findByIdAndUpdate(reservation.tableId, {
                    status: 'available'
                });
            }
        }
    }

    // Liên kết với đơn hàng
    if (orderId !== undefined) {
        reservation.orderId = orderId;
    }

    const updatedReservation = await reservation.save();
    res.json(updatedReservation);
});

module.exports = {
    getReservations,
    getReservationById,
    createReservation,
    updateReservationStatus
};