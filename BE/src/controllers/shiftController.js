const asyncHandler = require('express-async-handler');
const Shift = require('../models/shiftModel');

// @desc    Tạo ca làm việc mới
// @route   POST /api/shifts
// @access  Private/Manager/Admin
const createShift = asyncHandler(async (req, res) => {
    const { name, startTime, endTime, color } = req.body;

    // Tạo ca làm việc mới
    const shift = await Shift.create({
        storeId: req.user.storeId,
        name,
        startTime,
        endTime,
        color: color || '#3788d8'
    });

    if (shift) {
        res.status(201).json(shift);
    } else {
        res.status(400);
        throw new Error('Dữ liệu ca làm việc không hợp lệ');
    }
});

// @desc    Lấy tất cả ca làm việc của cửa hàng
// @route   GET /api/shifts
// @access  Private/Manager/Admin
const getShifts = asyncHandler(async (req, res) => {
    const shifts = await Shift.find({ storeId: req.user.storeId });
    res.status(200).json(shifts);
});

// @desc    Lấy chi tiết ca làm việc theo ID
// @route   GET /api/shifts/:id
// @access  Private/Manager/Admin
const getShiftById = asyncHandler(async (req, res) => {
    const shift = await Shift.findById(req.params.id);

    if (shift && shift.storeId.toString() === req.user.storeId.toString()) {
        res.status(200).json(shift);
    } else {
        res.status(404);
        throw new Error('Không tìm thấy ca làm việc');
    }
});

// @desc    Cập nhật ca làm việc
// @route   PUT /api/shifts/:id
// @access  Private/Manager/Admin
const updateShift = asyncHandler(async (req, res) => {
    const { name, startTime, endTime, color } = req.body;

    const shift = await Shift.findById(req.params.id);

    if (shift && shift.storeId.toString() === req.user.storeId.toString()) {
        shift.name = name || shift.name;
        shift.startTime = startTime || shift.startTime;
        shift.endTime = endTime || shift.endTime;
        shift.color = color || shift.color;

        const updatedShift = await shift.save();
        res.status(200).json(updatedShift);
    } else {
        res.status(404);
        throw new Error('Không tìm thấy ca làm việc');
    }
});

// @desc    Xóa ca làm việc
// @route   DELETE /api/shifts/:id
// @access  Private/Manager/Admin
const deleteShift = asyncHandler(async (req, res) => {
    const shift = await Shift.findById(req.params.id);

    if (shift && shift.storeId.toString() === req.user.storeId.toString()) {
        await Shift.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Ca làm việc đã được xóa' });
    } else {
        res.status(404);
        throw new Error('Không tìm thấy ca làm việc');
    }
});

module.exports = {
    createShift,
    getShifts,
    getShiftById,
    updateShift,
    deleteShift
};