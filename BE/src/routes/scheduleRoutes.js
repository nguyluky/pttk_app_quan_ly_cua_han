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

// Routes cho lịch làm việc
router.route('/')
    .post(protect, manager, createSchedule)
    .get(protect, manager, getSchedules);

// Route tạo nhiều lịch làm việc cùng lúc
router.post('/bulk', protect, manager, createBulkSchedules);

// Route lấy lịch làm việc của bản thân (nhân viên)
router.get('/me', protect, getMySchedules);

// Routes thao tác với từng lịch làm việc theo ID
router.route('/:id')
    .get(protect, getScheduleById)
    .put(protect, manager, updateSchedule)
    .delete(protect, manager, deleteSchedule);

// Route cập nhật trạng thái lịch làm việc
router.patch('/:id/status', protect, updateScheduleStatus);

module.exports = router;