require('dotenv').config();
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker/locale/vi');
const User = require('../src/models/userModel');
const Product = require('../src/models/productModel');
const Store = require('../src/models/storeModel');
// Import các model khác tùy nhu cầu

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/posapp')
    .then(() => console.log('Đã kết nối MongoDB'))
    .catch(err => {
        console.error('Lỗi kết nối MongoDB:', err);
        process.exit(1);
    });


// // Tạo users
const createUsers = async (count, storeId) => {
    const users = [];

    for (let i = 0; i < count; i++) {
        users.push({
            name: faker.person.fullName(),
            email: faker.internet.email(),
            password: 'password123',
            phone: faker.phone.number('0#########'),
            role: faker.helpers.arrayElement(['admin', 'manager', 'staff']),
            storeId,
            isActive: true
        });
    }

    await User.create(users);
    console.log(`Đã tạo ${count} người dùng`);
};

const createStores = async (count) => {
    const stores = [];

    for (let i = 0; i < count; i++) {
        stores.push({
            name: faker.company.name(),
            address: faker.location.streetAddress(),
            phone: faker.phone.number('0#########'),
            email: faker.internet.email(),
            isActive: true
        });
    }

    const data = await Store.create(stores);
    const storeId = data.map(store => store._id);
    for (let i = 0; i < storeId.length; i++) {
        await createUsers(3, storeId[i]);
        // await createProducts(5, storeId[i]);
    }
    console.log(`Đã tạo ${count} cửa hàng`);
};

// Chạy các hàm tạo dữ liệu
const generateData = async () => {
    try {
        await createStores(10);
        // Gọi các function tạo dữ liệu khác

        console.log('Hoàn thành tạo dữ liệu!');
    } catch (error) {
        console.error('Lỗi khi tạo dữ liệu:', error);
    } finally {
        mongoose.connection.close();
    }
};

generateData();