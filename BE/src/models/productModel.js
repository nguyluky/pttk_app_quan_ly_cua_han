const mongoose = require('mongoose');

const productOptionSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0
    }
});

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Vui lòng nhập tên sản phẩm'],
            trim: true
        },
        description: {
            type: String
        },
        price: {
            type: Number,
            required: [true, 'Vui lòng nhập giá sản phẩm'],
            default: 0
        },
        image: {
            type: String
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: true
        },
        sku: {
            type: String
        },
        barcode: {
            type: String
        },
        isAvailable: {
            type: Boolean,
            default: true
        },
        trackInventory: {
            type: Boolean,
            default: false
        },
        inventoryQuantity: {
            type: Number,
            default: 0
        },
        lowInventoryThreshold: {
            type: Number,
            default: 5
        },
        options: [productOptionSchema],
        toppings: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }]
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;