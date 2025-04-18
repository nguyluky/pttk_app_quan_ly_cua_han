const mongoose = require('mongoose');

const inventoryHistorySchema = mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ['add', 'reduce', 'adjustment', 'transfer']
    },
    quantity: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
});

const inventorySchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Store'
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    unit: {
        type: String,
        default: 'cái'
    },
    lowStockThreshold: {
        type: Number,
        default: 10
    },
    supplierInfo: {
        name: { type: String },
        contact: { type: String },
        email: { type: String }
    },
    notes: {
        type: String
    },
    history: [inventoryHistorySchema],
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastUpdatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Tạo index cho việc tìm kiếm nhanh
inventorySchema.index({ storeId: 1 });
inventorySchema.index({ product: 1, storeId: 1 }, { unique: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;