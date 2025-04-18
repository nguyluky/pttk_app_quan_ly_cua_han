const mongoose = require('mongoose');

const tableSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Vui lòng nhập tên bàn'],
            trim: true
        },
        capacity: {
            type: Number,
            required: [true, 'Vui lòng nhập sức chứa của bàn'],
            default: 2
        },
        status: {
            type: String,
            enum: ['available', 'occupied', 'reserved', 'cleaning'],
            default: 'available'
        },
        area: {
            type: String,
            enum: ['indoor', 'outdoor', 'rooftop', 'vip', 'other'],
            default: 'indoor'
        },
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: true
        },
        positionX: {
            type: Number,
            default: 0
        },
        positionY: {
            type: Number,
            default: 0
        },
        currentOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;