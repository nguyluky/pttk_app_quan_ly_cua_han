const Category = require('../models/categoryModel');

/**
 * @desc    Tạo danh mục mới
 * @route   POST /api/categories
 * @access  Private/Manager, Admin
 */
exports.createCategory = async (req, res, next) => {
    try {
        const { name, description, image, storeId, order } = req.body;

        // Kiểm tra tên danh mục là bắt buộc
        if (!name) {
            res.status(400);
            throw new Error('Tên danh mục là bắt buộc');
        }

        // Tạo danh mục mới
        const category = await Category.create({
            name,
            description,
            image,
            storeId,
            order,
        });

        res.status(201).json(category);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Lấy tất cả danh mục (theo cửa hàng)
 * @route   GET /api/categories
 * @access  Private
 */
exports.getCategories = async (req, res, next) => {
    try {
        const { storeId } = req.query;

        // Kiểm tra storeId có được cung cấp
        if (!storeId) {
            res.status(400);
            throw new Error('Vui lòng cung cấp ID cửa hàng');
        }

        // Tìm tất cả danh mục của cửa hàng
        const categories = await Category.find({
            storeId,
            isActive: true
        }).sort({ order: 1, name: 1 });

        res.json(categories);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Lấy danh mục theo ID
 * @route   GET /api/categories/:id
 * @access  Private
 */
exports.getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            res.status(404);
            throw new Error('Không tìm thấy danh mục');
        }

        res.json(category);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cập nhật danh mục
 * @route   PUT /api/categories/:id
 * @access  Private/Manager, Admin
 */
exports.updateCategory = async (req, res, next) => {
    try {
        const { name, description, image, isActive, order } = req.body;
        const category = await Category.findById(req.params.id);

        if (!category) {
            res.status(404);
            throw new Error('Không tìm thấy danh mục');
        }

        // Cập nhật thông tin danh mục
        category.name = name || category.name;
        category.description = description !== undefined ? description : category.description;
        category.image = image || category.image;
        category.isActive = isActive !== undefined ? isActive : category.isActive;
        category.order = order !== undefined ? order : category.order;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Xóa danh mục
 * @route   DELETE /api/categories/:id
 * @access  Private/Manager, Admin
 */
exports.deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            res.status(404);
            throw new Error('Không tìm thấy danh mục');
        }

        await category.remove();
        res.json({ message: 'Đã xóa danh mục' });
    } catch (error) {
        next(error);
    }
};