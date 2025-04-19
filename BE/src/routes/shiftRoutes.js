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

// Các routes cho ca làm việc
router.route('/')
    .post(protect, manager, createShift)
    .get(protect, manager, getShifts);

router.route('/:id')
    .get(protect, manager, getShiftById)
    .put(protect, manager, updateShift)
    .delete(protect, manager, deleteShift);

module.exports = router;