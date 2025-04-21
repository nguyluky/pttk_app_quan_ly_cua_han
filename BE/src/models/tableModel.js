const mongoose = require('mongoose');

const tableSchema = mongoose.Schema({
    tableNumber: {
        type: String,
        required: true,
    },
    capacity: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'reserved', 'cleaning'],
        default: 'available'
    },
    currentOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    location: {
        type: String, // Ví dụ: "tầng 1", "ngoài trời", "khu vực hút thuốc"
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Table = mongoose.model('Table', tableSchema);
module.exports = Table;