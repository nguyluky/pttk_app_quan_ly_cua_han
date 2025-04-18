const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    options: [String],
    toppings: [{
        topping: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            default: 1
        },
        price: Number
    }],
    note: String,
    subtotal: {
        type: Number,
        required: true
    }
});

const orderSchema = mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true
        },
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: true
        },
        customer: {
            name: String,
            phone: String,
            email: String
        },
        items: [orderItemSchema],
        subtotal: {
            type: Number,
            required: true
        },
        tax: {
            type: Number,
            required: true
        },
        discount: {
            type: Number,
            default: 0
        },
        discountType: {
            type: String,
            enum: ['percentage', 'amount'],
            default: 'amount'
        },
        couponCode: {
            type: String
        },
        total: {
            type: Number,
            required: true
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'card', 'transfer', 'other'],
            default: 'cash'
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'refunded'],
            default: 'pending'
        },
        orderType: {
            type: String,
            enum: ['dine-in', 'takeaway', 'delivery', 'online'],
            default: 'dine-in'
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'canceled'],
            default: 'pending'
        },
        table: {
            type: String
        },
        note: {
            type: String
        },
        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        deliveryAddress: {
            street: String,
            city: String,
            district: String,
            phone: String
        },
        deliveryFee: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Middleware để tự động tạo mã đơn hàng
orderSchema.pre('save', async function (next) {
    if (this.isNew) {
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);

        // Lấy số lượng đơn hàng trong ngày
        const count = await this.constructor.countDocuments({
            createdAt: {
                $gte: new Date(date.setHours(0, 0, 0, 0)),
                $lt: new Date(date.setHours(23, 59, 59, 999))
            },
            storeId: this.storeId
        });

        // Tạo mã đơn hàng: STORE_ID-YEAR-MONTH-DAY-COUNT
        const storeIdPrefix = this.storeId.toString().substr(-3);
        this.orderNumber = `${storeIdPrefix}-${year}${month}${day}-${(count + 1).toString().padStart(3, '0')}`;
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;