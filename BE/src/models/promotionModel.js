const mongoose = require('mongoose');

const promotionSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Vui lòng nhập tên chương trình khuyến mãi'],
            trim: true
        },
        description: {
            type: String
        },
        type: {
            type: String,
            enum: ['percentage', 'amount', 'buy_x_get_y', 'special'],
            default: 'percentage'
        },
        value: {
            type: Number,
            required: function () {
                return this.type === 'percentage' || this.type === 'amount';
            }
        },
        buyQuantity: {
            type: Number,
            required: function () {
                return this.type === 'buy_x_get_y';
            }
        },
        getQuantity: {
            type: Number,
            required: function () {
                return this.type === 'buy_x_get_y';
            }
        },
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
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
        minOrderValue: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        daysOfWeek: {
            type: [Number],
            default: [0, 1, 2, 3, 4, 5, 6]  // 0: Sunday, 1: Monday, ..., 6: Saturday
        },
        startTime: {
            type: String,
            default: "00:00"
        },
        endTime: {
            type: String,
            default: "23:59"
        },
        image: {
            type: String
        },
        priority: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const Promotion = mongoose.model('Promotion', promotionSchema);

module.exports = Promotion;