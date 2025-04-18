const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

/**
 * Middleware kiểm tra xác thực người dùng
 */
exports.protect = async (req, res, next) => {
    let token;

    // Kiểm tra token từ header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Lấy token từ header
            token = req.headers.authorization.split(' ')[1];

            // Giải mã token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Lấy thông tin người dùng, loại bỏ password
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            res.status(401);
            return next(new Error('Không được phép truy cập, token không hợp lệ'));
        }
    }

    if (!token) {
        res.status(401);
        return next(new Error('Không được phép truy cập, không tìm thấy token'));
    }
};

/**
 * Middleware kiểm tra quyền admin
 */
exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403);
        return next(new Error('Không có quyền truy cập chức năng này'));
    }
};

/**
 * Middleware kiểm tra quyền manager hoặc admin
 */
exports.manager = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
        next();
    } else {
        res.status(403);
        return next(new Error('Không có quyền truy cập chức năng này'));
    }
};

/**
 * Middleware kiểm tra người dùng thuộc cùng cửa hàng
 */
exports.sameStore = (req, res, next) => {
    const storeId = req.params.storeId || req.body.storeId;

    if (!storeId) {
        return next();
    }

    if (req.user.role === 'admin' || req.user.storeId.toString() === storeId.toString()) {
        next();
    } else {
        res.status(403);
        return next(new Error('Không có quyền truy cập dữ liệu của cửa hàng khác'));
    }
};