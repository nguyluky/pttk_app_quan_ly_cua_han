const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Vui lòng nhập tên']
        },
        email: {
            type: String,
            required: [true, 'Vui lòng nhập email'],
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Vui lòng nhập email hợp lệ'
            ]
        },
        password: {
            type: String,
            required: [true, 'Vui lòng nhập mật khẩu'],
            minlength: 6,
            select: false
        },
        phone: {
            type: String
        },
        role: {
            type: String,
            enum: ['admin', 'manager', 'staff'],
            default: 'staff'
        },
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Store',
            required: true
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

// Mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Phương thức so sánh mật khẩu
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;