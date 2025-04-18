const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

/**
 * @desc    Tạo sản phẩm mới
 * @route   POST /api/products
 * @access  Private/Manager, Admin
 */
exports.createProduct = async (req, res, next) => {
    try {
        const {
            name,
            description,
            price,
            image,
            categoryId,
            storeId,
            sku,
            barcode,
            isAvailable,
            trackInventory,
            inventoryQuantity,
            lowInventoryThreshold,
            options,
            toppings
        } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!name || !price || !categoryId || !storeId) {
            res.status(400);
            throw new Error('Vui lòng điền đầy đủ thông tin sản phẩm');
        }

        // Kiểm tra danh mục tồn tại
        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
            res.status(400);
            throw new Error('Danh mục không tồn tại');
        }

        // Tạo sản phẩm mới
        const product = await Product.create({
            name,
            description,
            price,
            image,
            categoryId,
            storeId,
            sku,
            barcode,
            isAvailable,
            trackInventory,
            inventoryQuantity: inventoryQuantity || 0,
            lowInventoryThreshold,
            options,
            toppings
        });

        res.status(201).json(product);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Lấy tất cả sản phẩm (theo cửa hàng và có thể theo danh mục)
 * @route   GET /api/products
 * @access  Private
 */
exports.getProducts = async (req, res, next) => {
    try {
        const { storeId, categoryId } = req.query;

        // Kiểm tra storeId có được cung cấp
        if (!storeId) {
            res.status(400);
            throw new Error('Vui lòng cung cấp ID cửa hàng');
        }

        let query = { storeId };

        // Nếu có categoryId thì thêm vào query
        if (categoryId) {
            query.categoryId = categoryId;
        }

        const products = await Product.find(query)
            .populate('categoryId', 'name')
            .populate('toppings', 'name price');

        res.json(products);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Lấy sản phẩm theo ID
 * @route   GET /api/products/:id
 * @access  Private
 */
exports.getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('categoryId', 'name')
            .populate('toppings', 'name price');

        if (!product) {
            res.status(404);
            throw new Error('Không tìm thấy sản phẩm');
        }

        res.json(product);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cập nhật sản phẩm
 * @route   PUT /api/products/:id
 * @access  Private/Manager, Admin
 */
exports.updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404);
            throw new Error('Không tìm thấy sản phẩm');
        }

        const {
            name,
            description,
            price,
            image,
            categoryId,
            sku,
            barcode,
            isAvailable,
            trackInventory,
            inventoryQuantity,
            lowInventoryThreshold,
            options,
            toppings
        } = req.body;

        // Kiểm tra danh mục tồn tại nếu có cập nhật
        if (categoryId && categoryId !== product.categoryId.toString()) {
            const categoryExists = await Category.findById(categoryId);
            if (!categoryExists) {
                res.status(400);
                throw new Error('Danh mục không tồn tại');
            }
        }

        // Cập nhật thông tin sản phẩm
        product.name = name || product.name;
        product.description = description !== undefined ? description : product.description;
        product.price = price !== undefined ? price : product.price;
        product.image = image || product.image;
        product.categoryId = categoryId || product.categoryId;
        product.sku = sku || product.sku;
        product.barcode = barcode || product.barcode;
        product.isAvailable = isAvailable !== undefined ? isAvailable : product.isAvailable;
        product.trackInventory = trackInventory !== undefined ? trackInventory : product.trackInventory;
        product.inventoryQuantity = inventoryQuantity !== undefined ? inventoryQuantity : product.inventoryQuantity;
        product.lowInventoryThreshold = lowInventoryThreshold !== undefined ? lowInventoryThreshold : product.lowInventoryThreshold;

        // Cập nhật options nếu có
        if (options) {
            product.options = options;
        }

        // Cập nhật toppings nếu có
        if (toppings) {
            product.toppings = toppings;
        }

        const updatedProduct = await product.save();

        res.json(updatedProduct);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Xóa sản phẩm
 * @route   DELETE /api/products/:id
 * @access  Private/Manager, Admin
 */
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404);
            throw new Error('Không tìm thấy sản phẩm');
        }

        await product.remove();
        res.json({ message: 'Đã xóa sản phẩm' });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cập nhật tình trạng tồn kho sản phẩm
 * @route   PUT /api/products/:id/inventory
 * @access  Private/Manager, Admin
 */
exports.updateInventory = async (req, res, next) => {
    try {
        const { quantity, adjustment } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            res.status(404);
            throw new Error('Không tìm thấy sản phẩm');
        }

        // Nếu cung cấp số lượng cụ thể
        if (quantity !== undefined) {
            product.inventoryQuantity = quantity;
        }
        // Nếu cung cấp số lượng thay đổi
        else if (adjustment) {
            product.inventoryQuantity += adjustment;
        } else {
            res.status(400);
            throw new Error('Vui lòng cung cấp quantity hoặc adjustment');
        }

        // Đảm bảo số lượng không âm
        if (product.inventoryQuantity < 0) {
            product.inventoryQuantity = 0;
        }

        const updatedProduct = await product.save();

        res.json({
            _id: updatedProduct._id,
            name: updatedProduct.name,
            inventoryQuantity: updatedProduct.inventoryQuantity,
            lowInventoryThreshold: updatedProduct.lowInventoryThreshold,
            trackInventory: updatedProduct.trackInventory
        });
    } catch (error) {
        next(error);
    }
};