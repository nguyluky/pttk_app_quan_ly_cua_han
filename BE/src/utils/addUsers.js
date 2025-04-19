const mongoose = require('mongoose');
const User = require('../models/userModel');
const Store = require('../models/storeModel');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
        return conn;
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

const addUsers = async () => {
    try {
        // Tìm store hiện có
        const store = await Store.findOne({ name: 'Coffee House Central' });
        
        if (!store) {
            console.error('Không tìm thấy cửa hàng!');
            process.exit(1);
        }

        // Tạo mật khẩu cho users
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('123456', saltRounds);

        // Tạo manager
        const manager = await User.create({
            name: 'Store Manager',
            email: 'manager@example.com',
            password: hashedPassword,
            phone: '0909123457',
            role: 'manager',
            storeId: store._id,
            isActive: true
        });

        console.log('Đã tạo tài khoản manager:', manager.email);

        // Tạo staff
        const staff = await User.create({
            name: 'Staff User',
            email: 'staff@example.com',
            password: hashedPassword,
            phone: '0909123458',
            role: 'staff',
            storeId: store._id,
            isActive: true
        });

        console.log('Đã tạo tài khoản staff:', staff.email);

        console.log('Tạo users thành công!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

connectDB().then(() => {
    addUsers();
});