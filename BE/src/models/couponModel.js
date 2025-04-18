const mongoose = require('mongoose');

const couponSchema = mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Vui lòng nhập mã giảm giá'],
            unique: true,
            uppercase: true,
            trim: true
        },
        type: {
            type: String,
            enum: ['percentage', 'amount'],
            default: 'percentage',
            required: true
        },
        value: {
            type: Number,
            required: [true, 'Vui lòng nhập giá trị giảm giá']
        },
        minOrderValue: {
            type: Number,
            default: 0
        },
        maxDiscount: {
            type: Number,
            default: null
        },
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        usageLimit: {
            type: Number,
            default: null
        },
        usedCount: {
            type: Number,
            default: 0
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        productIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }],
        categoryIds: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category'
        }],
        description: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;