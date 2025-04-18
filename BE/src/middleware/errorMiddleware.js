/**
 * Middleware xử lý lỗi 404 (không tìm thấy route)
 */
const notFound = (req, res, next) => {
    const error = new Error(`Không tìm thấy - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

/**
 * Middleware xử lý các lỗi chung
 */
const errorHandler = (err, req, res, next) => {
    // Đảm bảo status code là đúng
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode);

    // Trả về thông tin lỗi
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        error: true
    });
};

/**
 * Middleware xử lý lỗi validation từ MongoDB
 */
const validationErrorHandler = (err, req, res, next) => {
    // Nếu là lỗi validation từ Mongoose
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            error: true,
            message: messages.join(', '),
            stack: process.env.NODE_ENV === 'production' ? null : err.stack
        });
    }

    // Nếu là lỗi trùng lặp (duplicate key)
    if (err.code === 11000) {
        return res.status(400).json({
            error: true,
            message: `Dữ liệu đã tồn tại: ${Object.keys(err.keyValue).join(', ')}`,
            stack: process.env.NODE_ENV === 'production' ? null : err.stack
        });
    }

    next(err);
};

module.exports = { notFound, errorHandler, validationErrorHandler };