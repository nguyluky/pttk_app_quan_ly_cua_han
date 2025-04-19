const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Đăng nhập và nhận token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra email và password đã được nhập
        if (!email || !password) {
            res.status(400);
            throw new Error('Vui lòng nhập email và mật khẩu');
        }

        // Tìm user theo email và bao gồm trường password
        const user = await User.findOne({ email }).select('+password');
        
        // Nếu không tìm thấy user
        if (!user) {
            res.status(404);
            throw new Error('Tài khoản không tồn tại');
        }

        // Kiểm tra mật khẩu
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            res.status(401);
            throw new Error('Mật khẩu không đúng');
        }

        // Kiểm tra tài khoản có active không
        if (!user.isActive) {
            res.status(401);
            throw new Error('Tài khoản của bạn đã bị vô hiệu hóa');
        }

        // Trả về token và thông tin người dùng
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            storeId: user.storeId,
            phone: user.phone,
            token: generateToken(user._id)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Lấy thông tin người dùng hiện tại
 * @route   GET /api/auth/profile
 * @access  Private
 */
exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            res.status(404);
            throw new Error('Không tìm thấy người dùng');
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            storeId: user.storeId,
            phone: user.phone
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Đổi mật khẩu
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400);
            throw new Error('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới');
        }

        // Tìm user
        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            res.status(404);
            throw new Error('Không tìm thấy người dùng');
        }

        // Kiểm tra mật khẩu hiện tại
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            res.status(401);
            throw new Error('Mật khẩu hiện tại không đúng');
        }

        // Cập nhật mật khẩu mới
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        next(error);
    }
};