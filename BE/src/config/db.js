const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB kết nối thành công: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Lỗi kết nối: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;