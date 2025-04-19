const mongoose = require('mongoose');

const scheduleSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: true
        },
        shiftId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Shift',
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['scheduled', 'confirmed', 'completed', 'absent', 'late'],
            default: 'scheduled'
        },
        notes: {
            type: String
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Tạo index để tìm kiếm nhanh
scheduleSchema.index({ userId: 1, date: 1 });
scheduleSchema.index({ storeId: 1, date: 1 });

const Schedule = mongoose.model('Schedule', scheduleSchema);

module.exports = Schedule;