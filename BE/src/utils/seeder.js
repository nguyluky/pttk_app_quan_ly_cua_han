const mongoose = require('mongoose');
const Store = require('../models/storeModel');
const User = require('../models/userModel');
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
const Shift = require('../models/shiftModel');
const Table = require('../models/tableModel');
const Inventory = require('../models/inventoryModel');
const Coupon = require('../models/couponModel');
const Promotion = require('../models/promotionModel');
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

const seedData = async () => {
    try {
        // Xóa dữ liệu cũ
        await Promise.all([
            Store.deleteMany(),
            User.deleteMany(),
            Category.deleteMany(),
            Product.deleteMany(),
            Shift.deleteMany(),
            Table.deleteMany(),
            Inventory.deleteMany(),
            Coupon.deleteMany(),
            Promotion.deleteMany()
        ]);

        // 1. Tạo Store
        const store = await Store.create({
            name: 'Coffee House Central',
            address: '123 Nguyễn Huệ, Q1, TP.HCM',
            phone: '0901234567',
            email: 'central@coffeehouse.com',
            businessType: 'cafe',
            settings: {
                currency: 'VND',
                taxRate: 10,
                receiptFooter: 'Cảm ơn quý khách!',
                allowOnlineOrder: true
            }
        });

        // 2. Tạo User (Admin)
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('admin123', saltRounds);
        
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: hashedPassword,
            phone: '0909123456',
            role: 'admin',
            storeId: store._id,
            isActive: true
        });

        // 3. Tạo Category
        const category = await Category.create({
            name: 'Cà phê',
            description: 'Các loại cà phê',
            storeId: store._id,
            isActive: true,
            order: 1
        });

        // 4. Tạo Product
        const product = await Product.create({
            name: 'Cà phê sữa đá',
            description: 'Cà phê đen đá pha với sữa đặc',
            price: 29000,
            categoryId: category._id,
            storeId: store._id,
            isAvailable: true,
            trackInventory: true,
            inventoryQuantity: 100,
            lowInventoryThreshold: 10
        });

        // 5. Tạo Shift
        const shift = await Shift.create({
            storeId: store._id,
            name: 'Ca sáng',
            startTime: '07:00',
            endTime: '15:00',
            color: '#3788d8'
        });

        // 6. Tạo Table
        const table = await Table.create({
            name: 'Bàn 01',
            capacity: 4,
            status: 'available',
            area: 'indoor',
            storeId: store._id,
            isActive: true
        });

        // 7. Tạo Inventory
        const inventory = await Inventory.create({
            product: product._id,
            storeId: store._id,
            quantity: 100,
            unit: 'ly',
            lowStockThreshold: 20,
            lastUpdatedBy: admin._id
        });

        // 8. Tạo Coupon
        const coupon = await Coupon.create({
            code: 'WELCOME2025',
            type: 'percentage',
            value: 10,
            minOrderValue: 100000,
            maxDiscount: 50000,
            storeId: store._id,
            isActive: true,
            startDate: new Date(),
            endDate: new Date(2025, 11, 31),
            usageLimit: 100
        });

        // 9. Tạo Promotion
        const promotion = await Promotion.create({
            name: 'Khuyến mãi mùa hè',
            description: 'Giảm giá 20% cho tất cả đồ uống',
            type: 'percentage',
            value: 20,
            storeId: store._id,
            isActive: true,
            startDate: new Date(),
            endDate: new Date(2025, 8, 31),
            startTime: '10:00',
            endTime: '17:00'
        });

        console.log('Data seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

connectDB().then(() => {
    seedData();
});