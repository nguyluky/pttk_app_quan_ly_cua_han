const User = require('../models/userModel');
const Store = require('../models/storeModel');

/**
 * @desc    Tạo người dùng mới
 * @route   POST /api/users
 * @access  Private/Admin, Manager
 */
exports.createUser = async (req, res, next) => {
    try {
        const { name, email, password, role, storeId, phone } = req.body;

        // Kiểm tra email đã tồn tại chưa
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('Email đã được sử dụng');
        }

        // Kiểm tra storeId có tồn tại không
        const store = await Store.findById(storeId);
        if (!store) {
            res.status(400);
            throw new Error('Cửa hàng không tồn tại');
        }

        // Chỉ admin mới có thể tạo tài khoản admin
        if (role === 'admin' && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Bạn không có quyền tạo tài khoản admin');
        }

        // Tạo người dùng mới
        const user = await User.create({
            name,
            email,
            password,
            role,
            storeId,
            phone
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                storeId: user.storeId,
                phone: user.phone
            });
        } else {
            res.status(400);
            throw new Error('Dữ liệu người dùng không hợp lệ');
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Lấy danh sách tất cả người dùng
 * @route   GET /api/users
 * @access  Private/Admin, Manager
 */
exports.getUsers = async (req, res, next) => {
    try {
        let query = {};

        // Nếu không phải admin, chỉ lấy user của cửa hàng mình
        if (req.user.role !== 'admin') {
            query.storeId = req.user.storeId;
        }

        // Nếu có storeId trong query param
        if (req.query.storeId) {
            // Chỉ admin mới có thể lấy user của cửa hàng khác
            if (req.user.role !== 'admin' && req.query.storeId !== req.user.storeId.toString()) {
                res.status(403);
                throw new Error('Không có quyền xem người dùng cửa hàng khác');
            }
            query.storeId = req.query.storeId;
        }

        const users = await User.find(query).select('-password').populate('storeId', 'name');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Lấy thông tin một người dùng
 * @route   GET /api/users/:id
 * @access  Private/Admin, Manager
 */
exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password').populate('storeId', 'name');

        if (!user) {
            res.status(404);
            throw new Error('Không tìm thấy người dùng');
        }

        // Nếu không phải admin, chỉ xem được user của cửa hàng mình
        if (req.user.role !== 'admin' && user.storeId._id.toString() !== req.user.storeId.toString()) {
            res.status(403);
            throw new Error('Không có quyền xem người dùng cửa hàng khác');
        }

        res.json(user);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cập nhật thông tin người dùng
 * @route   PUT /api/users/:id
 * @access  Private/Admin, Manager
 */
exports.updateUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            throw new Error('Không tìm thấy người dùng');
        }

        // Nếu không phải admin, chỉ update được user của cửa hàng mình
        if (req.user.role !== 'admin' && user.storeId.toString() !== req.user.storeId.toString()) {
            res.status(403);
            throw new Error('Không có quyền cập nhật người dùng cửa hàng khác');
        }

        // Chỉ admin mới được thay đổi role thành admin
        if (req.body.role === 'admin' && req.user.role !== 'admin') {
            res.status(403);
            throw new Error('Chỉ admin mới có quyền nâng cấp tài khoản lên admin');
        }

        // Không được thay đổi email thành một email đã tồn tại
        if (req.body.email && req.body.email !== user.email) {
            const existingUser = await User.findOne({ email: req.body.email });
            if (existingUser) {
                res.status(400);
                throw new Error('Email đã được sử dụng bởi tài khoản khác');
            }
        }

        // Cập nhật thông tin người dùng
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.role = req.body.role || user.role;
        user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;

        // Nếu có mật khẩu mới thì cập nhật
        if (req.body.password) {
            user.password = req.body.password;
        }

        // Chỉ admin mới có quyền đổi storeId
        if (req.body.storeId && req.user.role === 'admin') {
            // Kiểm tra storeId có tồn tại không
            const store = await Store.findById(req.body.storeId);
            if (!store) {
                res.status(400);
                throw new Error('Cửa hàng không tồn tại');
            }
            user.storeId = req.body.storeId;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            storeId: updatedUser.storeId,
            phone: updatedUser.phone,
            isActive: updatedUser.isActive
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Xóa người dùng
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            throw new Error('Không tìm thấy người dùng');
        }

        // Không thể xóa chính mình
        if (user._id.toString() === req.user._id.toString()) {
            res.status(400);
            throw new Error('Không thể xóa tài khoản của chính mình');
        }

        await user.remove();
        res.json({ message: 'Đã xóa người dùng' });
    } catch (error) {
        next(error);
    }
};