const mongoose = require('mongoose');

const categorySchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Vui lòng nhập tên danh mục'],
            trim: true
        },
        description: {
            type: String
        },
        image: {
            type: String
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
        order: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;