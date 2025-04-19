const asyncHandler = require('express-async-handler');
const Schedule = require('../models/scheduleModel');
const User = require('../models/userModel');

// @desc    Tạo lịch làm việc cho nhân viên
// @route   POST /api/schedules
// @access  Private/Manager/Admin
const createSchedule = asyncHandler(async (req, res) => {
    const { userId, shiftId, date, notes, status } = req.body;

    // Kiểm tra user có tồn tại và thuộc cửa hàng hiện tại không
    const user = await User.findById(userId);
    if (!user || user.storeId.toString() !== req.user.storeId.toString()) {
        res.status(404);
        throw new Error('Không tìm thấy nhân viên');
    }

    // Kiểm tra xem đã có lịch làm việc trong ngày này chưa
    const existingSchedule = await Schedule.findOne({
        userId,
        shiftId,
        date: new Date(date),
    });

    if (existingSchedule) {
        res.status(400);
        throw new Error('Đã có lịch làm việc của nhân viên trong ca này');
    }

    // Tạo lịch làm việc mới
    const schedule = await Schedule.create({
        userId,
        storeId: req.user.storeId,
        shiftId,
        date: new Date(date),
        status: status || 'scheduled',
        notes,
        createdBy: req.user._id
    });

    if (schedule) {
        const populatedSchedule = await Schedule.findById(schedule._id)
            .populate('userId', 'name email')
            .populate('shiftId', 'name startTime endTime');

        res.status(201).json(populatedSchedule);
    } else {
        res.status(400);
        throw new Error('Dữ liệu lịch làm việc không hợp lệ');
    }
});

// @desc    Lấy tất cả lịch làm việc của cửa hàng
// @route   GET /api/schedules
// @access  Private/Manager/Admin
const getSchedules = asyncHandler(async (req, res) => {
    const { startDate, endDate, userId } = req.query;

    const query = { storeId: req.user.storeId };

    // Lọc theo khoảng thời gian
    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    } else if (startDate) {
        query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
        query.date = { $lte: new Date(endDate) };
    }

    // Lọc theo nhân viên
    if (userId) {
        query.userId = userId;
    }

    const schedules = await Schedule.find(query)
        .populate('userId', 'name email')
        .populate('shiftId', 'name startTime endTime')
        .sort({ date: 1 });

    res.status(200).json(schedules);
});

// @desc    Lấy lịch làm việc của nhân viên hiện tại
// @route   GET /api/schedules/me
// @access  Private
const getMySchedules = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const query = {
        userId: req.user._id,
        storeId: req.user.storeId
    };

    // Lọc theo khoảng thời gian
    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    } else if (startDate) {
        query.date = { $gte: new Date(startDate) };
    } else if (endDate) {
        query.date = { $lte: new Date(endDate) };
    }

    const schedules = await Schedule.find(query)
        .populate('userId', 'name email')
        .populate('shiftId', 'name startTime endTime')
        .sort({ date: 1 });

    res.status(200).json(schedules);
});

// @desc    Lấy chi tiết lịch làm việc theo ID
// @route   GET /api/schedules/:id
// @access  Private
const getScheduleById = asyncHandler(async (req, res) => {
    const schedule = await Schedule.findById(req.params.id)
        .populate('userId', 'name email')
        .populate('shiftId', 'name startTime endTime')
        .populate('createdBy', 'name');

    // Kiểm tra quyền truy cập
    if (schedule && (
        schedule.storeId.toString() === req.user.storeId.toString() &&
        (req.user.role === 'admin' || req.user.role === 'manager' || schedule.userId.toString() === req.user._id.toString())
    )) {
        res.status(200).json(schedule);
    } else {
        res.status(404);
        throw new Error('Không tìm thấy lịch làm việc hoặc không có quyền truy cập');
    }
});

// @desc    Cập nhật lịch làm việc
// @route   PUT /api/schedules/:id
// @access  Private/Manager/Admin
const updateSchedule = asyncHandler(async (req, res) => {
    const { shiftId, date, status, notes } = req.body;

    const schedule = await Schedule.findById(req.params.id);

    if (!schedule || schedule.storeId.toString() !== req.user.storeId.toString()) {
        res.status(404);
        throw new Error('Không tìm thấy lịch làm việc');
    }

    // Chỉ manager và admin mới có thể cập nhật lịch làm việc
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        res.status(403);
        throw new Error('Không có quyền thực hiện hành động này');
    }

    if (schedule) {
        schedule.shiftId = shiftId || schedule.shiftId;
        if (date) schedule.date = new Date(date);
        schedule.status = status || schedule.status;
        schedule.notes = notes !== undefined ? notes : schedule.notes;

        const updatedSchedule = await schedule.save();

        const populatedSchedule = await Schedule.findById(updatedSchedule._id)
            .populate('userId', 'name email')
            .populate('shiftId', 'name startTime endTime');

        res.status(200).json(populatedSchedule);
    }
});

// @desc    Xóa lịch làm việc
// @route   DELETE /api/schedules/:id
// @access  Private/Manager/Admin
const deleteSchedule = asyncHandler(async (req, res) => {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule || schedule.storeId.toString() !== req.user.storeId.toString()) {
        res.status(404);
        throw new Error('Không tìm thấy lịch làm việc');
    }

    // Chỉ manager và admin mới có thể xóa lịch làm việc
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        res.status(403);
        throw new Error('Không có quyền thực hiện hành động này');
    }

    await Schedule.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: 'Lịch làm việc đã được xóa' });
});

// @desc    Cập nhật trạng thái lịch làm việc của nhân viên
// @route   PATCH /api/schedules/:id/status
// @access  Private
const updateScheduleStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const schedule = await Schedule.findById(req.params.id);

    if (!schedule || schedule.storeId.toString() !== req.user.storeId.toString()) {
        res.status(404);
        throw new Error('Không tìm thấy lịch làm việc');
    }

    // Nhân viên chỉ có thể cập nhật trạng thái lịch làm việc của chính mình
    if (req.user.role === 'staff' && schedule.userId.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Không có quyền thực hiện hành động này');
    }

    schedule.status = status;
    const updatedSchedule = await schedule.save();

    const populatedSchedule = await Schedule.findById(updatedSchedule._id)
        .populate('userId', 'name email')
        .populate('shiftId', 'name startTime endTime');

    res.status(200).json(populatedSchedule);
});

// @desc    Tạo nhiều lịch làm việc cùng lúc
// @route   POST /api/schedules/bulk
// @access  Private/Manager/Admin
const createBulkSchedules = asyncHandler(async (req, res) => {
    const { schedules } = req.body;

    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
        res.status(400);
        throw new Error('Không có dữ liệu lịch làm việc');
    }

    // Kiểm tra quyền hạn
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        res.status(403);
        throw new Error('Không có quyền thực hiện hành động này');
    }

    const scheduleDocuments = [];
    const errors = [];

    // Tạo danh sách lịch làm việc và kiểm tra dữ liệu
    for (const schedule of schedules) {
        const { userId, shiftId, date } = schedule;

        // Kiểm tra user có tồn tại và thuộc cửa hàng hiện tại không
        const user = await User.findById(userId);
        if (!user || user.storeId.toString() !== req.user.storeId.toString()) {
            errors.push(`Không tìm thấy nhân viên có ID: ${userId}`);
            continue;
        }

        // Kiểm tra xem đã có lịch làm việc trong ngày và ca này chưa
        const existingSchedule = await Schedule.findOne({
            userId,
            shiftId,
            date: new Date(date),
        });

        if (existingSchedule) {
            errors.push(`Đã có lịch làm việc cho nhân viên ${userId} trong ca ${shiftId} vào ngày ${date}`);
            continue;
        }

        scheduleDocuments.push({
            userId,
            storeId: req.user.storeId,
            shiftId,
            date: new Date(date),
            status: schedule.status || 'scheduled',
            notes: schedule.notes,
            createdBy: req.user._id
        });
    }

    if (scheduleDocuments.length === 0) {
        res.status(400);
        throw new Error('Không thể tạo lịch làm việc: ' + errors.join(', '));
    }

    // Tạo lịch làm việc hàng loạt
    const result = await Schedule.insertMany(scheduleDocuments);

    res.status(201).json({
        message: `Đã tạo thành công ${result.length} lịch làm việc`,
        success: result.length,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined
    });
});

module.exports = {
    createSchedule,
    getSchedules,
    getMySchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule,
    updateScheduleStatus,
    createBulkSchedules
};