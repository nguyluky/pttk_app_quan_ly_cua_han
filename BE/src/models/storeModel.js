const mongoose = require('mongoose');

const storeSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Vui lòng nhập tên cửa hàng']
        },
        address: {
            type: String,
            required: [true, 'Vui lòng nhập địa chỉ cửa hàng']
        },
        phone: {
            type: String,
            required: [true, 'Vui lòng nhập số điện thoại liên hệ']
        },
        email: {
            type: String
        },
        taxId: {
            type: String
        },
        logo: {
            type: String
        },
        businessType: {
            type: String,
            enum: ['restaurant', 'cafe', 'retail', 'other'],
            default: 'restaurant'
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        settings: {
            currency: {
                type: String,
                default: 'VND'
            },
            taxRate: {
                type: Number,
                default: 10
            },
            receiptFooter: {
                type: String,
                default: 'Cảm ơn quý khách!'
            },
            allowOnlineOrder: {
                type: Boolean,
                default: false
            }
        }
    },
    {
        timestamps: true
    }
);

const Store = mongoose.model('Store', storeSchema);

module.exports = Store;