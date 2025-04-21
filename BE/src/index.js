const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler, validationErrorHandler } = require('./middleware/errorMiddleware');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger/swagger');
const tableRoutes = require('./routes/tableRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

// Load biến môi trường
dotenv.config();

// Kết nối đến database
connectDB();

// Khởi tạo app Express
const app = express();

// Middleware
app.use(morgan('tiny'))
app.use(cors({
    origin: '*'
}));
app.use(express.json());

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Route cơ bản
app.get('/', (req, res) => {
    res.send('API đang chạy... Truy cập <a href="/api-docs">API Documentation</a>');
});

// Đăng ký các routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/stores', require('./routes/storeRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/promotions', require('./routes/promotionRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/shifts', require('./routes/shiftRoutes'));
app.use('/api/schedules', require('./routes/scheduleRoutes'));
app.use('/api/tables', tableRoutes);
app.use('/api/reservations', reservationRoutes);

// Tạm thời comment các routes chưa được triển khai
// app.use('/api/inventory', require('./routes/inventoryRoutes'));
// app.use('/api/reports', require('./routes/reportRoutes'));

// Middleware xử lý lỗi
app.use(validationErrorHandler);
app.use(notFound);
app.use(errorHandler);

// Cổng server
const PORT = process.env.PORT || 5000;

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
    console.log(`API Documentation có thể xem tại http://localhost:${PORT}/api-docs`);
});