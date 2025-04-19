const mongoose = require('mongoose');

const shiftSchema = mongoose.Schema(
    {
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: true
        },
        name: {
            type: String,
            required: [true, 'Vui lòng nhập tên ca làm việc']
        },
        startTime: {
            type: String,
            required: [true, 'Vui lòng nhập giờ bắt đầu']
        },
        endTime: {
            type: String,
            required: [true, 'Vui lòng nhập giờ kết thúc']
        },
        color: {
            type: String,
            default: '#3788d8'
        }
    },
    {
        timestamps: true
    }
);

const Shift = mongoose.model('Shift', shiftSchema);

module.exports = Shift;