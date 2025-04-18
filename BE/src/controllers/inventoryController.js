const asyncHandler = require('express-async-handler');
const Inventory = require('../models/inventoryModel');
const Product = require('../models/productModel');

// @desc    Lấy danh sách tất cả các mặt hàng trong kho
// @route   GET /api/inventory
// @access  Private
const getInventoryItems = asyncHandler(async (req, res) => {
    const inventoryItems = await Inventory.find({})
        .populate('product', 'name price image')
        .sort('product');
    res.json(inventoryItems);
});

// @desc    Lấy thông tin chi tiết một mặt hàng trong kho
// @route   GET /api/inventory/:id
// @access  Private
const getInventoryItemById = asyncHandler(async (req, res) => {
    const inventoryItem = await Inventory.findById(req.params.id)
        .populate('product', 'name price image category description');

    if (inventoryItem) {
        res.json(inventoryItem);
    } else {
        res.status(404);
        throw new Error('Không tìm thấy mặt hàng trong kho');
    }
});

// @desc    Tạo mới một mặt hàng trong kho
// @route   POST /api/inventory
// @access  Private/Admin
const createInventoryItem = asyncHandler(async (req, res) => {
    const {
        product,
        storeId,
        quantity,
        unit,
        lowStockThreshold,
        supplierInfo,
        notes
    } = req.body;

    // Kiểm tra xem sản phẩm có tồn tại không
    const productExists = await Product.findById(product);
    if (!productExists) {
        res.status(404);
        throw new Error('Không tìm thấy sản phẩm');
    }

    // Kiểm tra xem sản phẩm đã tồn tại trong kho của cửa hàng này chưa
    const existingInventory = await Inventory.findOne({
        product,
        storeId
    });

    if (existingInventory) {
        res.status(400);
        throw new Error('Sản phẩm đã tồn tại trong kho này');
    }

    const inventoryItem = new Inventory({
        product,
        storeId,
        quantity: quantity || 0,
        unit: unit || 'cái',
        lowStockThreshold: lowStockThreshold || 10,
        supplierInfo,
        notes,
        lastUpdatedBy: req.user._id
    });

    const createdInventoryItem = await inventoryItem.save();
    res.status(201).json(createdInventoryItem);
});

// @desc    Cập nhật thông tin mặt hàng trong kho
// @route   PUT /api/inventory/:id
// @access  Private/Admin
const updateInventoryItem = asyncHandler(async (req, res) => {
    const {
        quantity,
        unit,
        lowStockThreshold,
        supplierInfo,
        notes
    } = req.body;

    const inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
        res.status(404);
        throw new Error('Không tìm thấy mặt hàng trong kho');
    }

    inventoryItem.quantity = quantity !== undefined ? quantity : inventoryItem.quantity;
    inventoryItem.unit = unit || inventoryItem.unit;
    inventoryItem.lowStockThreshold = lowStockThreshold !== undefined ? lowStockThreshold : inventoryItem.lowStockThreshold;
    inventoryItem.supplierInfo = supplierInfo || inventoryItem.supplierInfo;
    inventoryItem.notes = notes !== undefined ? notes : inventoryItem.notes;
    inventoryItem.lastUpdatedBy = req.user._id;
    inventoryItem.lastUpdatedAt = Date.now();

    const updatedInventoryItem = await inventoryItem.save();
    res.json(updatedInventoryItem);
});

// @desc    Xóa mặt hàng khỏi kho
// @route   DELETE /api/inventory/:id
// @access  Private/Admin
const deleteInventoryItem = asyncHandler(async (req, res) => {
    const inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
        res.status(404);
        throw new Error('Không tìm thấy mặt hàng trong kho');
    }

    await inventoryItem.deleteOne();
    res.json({ message: 'Đã xóa mặt hàng khỏi kho' });
});

// @desc    Thêm số lượng cho mặt hàng trong kho
// @route   POST /api/inventory/:id/add
// @access  Private
const addInventoryStock = asyncHandler(async (req, res) => {
    const { quantity, notes } = req.body;

    if (!quantity || quantity <= 0) {
        res.status(400);
        throw new Error('Vui lòng nhập số lượng hợp lệ');
    }

    const inventoryItem = await Inventory.findById(req.params.id);
    if (!inventoryItem) {
        res.status(404);
        throw new Error('Không tìm thấy mặt hàng trong kho');
    }

    inventoryItem.quantity += Number(quantity);
    inventoryItem.lastUpdatedBy = req.user._id;
    inventoryItem.lastUpdatedAt = Date.now();

    // Thêm thông tin về nhập kho vào lịch sử nếu có ghi chú
    if (notes) {
        inventoryItem.history = inventoryItem.history || [];
        inventoryItem.history.push({
            action: 'add',
            quantity: Number(quantity),
            date: Date.now(),
            notes,
            user: req.user._id
        });
    }

    const updatedInventoryItem = await inventoryItem.save();
    res.json(updatedInventoryItem);
});

// @desc    Giảm số lượng mặt hàng trong kho
// @route   POST /api/inventory/:id/reduce
// @access  Private
const reduceInventoryStock = asyncHandler(async (req, res) => {
    const { quantity, notes } = req.body;

    if (!quantity || quantity <= 0) {
        res.status(400);
        throw new Error('Vui lòng nhập số lượng hợp lệ');
    }

    const inventoryItem = await Inventory.findById(req.params.id);
    if (!inventoryItem) {
        res.status(404);
        throw new Error('Không tìm thấy mặt hàng trong kho');
    }

    // Kiểm tra nếu số lượng muốn giảm lớn hơn số lượng hiện có
    if (inventoryItem.quantity < Number(quantity)) {
        res.status(400);
        throw new Error('Số lượng giảm lớn hơn số lượng hiện có trong kho');
    }

    inventoryItem.quantity -= Number(quantity);
    inventoryItem.lastUpdatedBy = req.user._id;
    inventoryItem.lastUpdatedAt = Date.now();

    // Thêm thông tin về xuất kho vào lịch sử nếu có ghi chú
    if (notes) {
        inventoryItem.history = inventoryItem.history || [];
        inventoryItem.history.push({
            action: 'reduce',
            quantity: Number(quantity),
            date: Date.now(),
            notes,
            user: req.user._id
        });
    }

    const updatedInventoryItem = await inventoryItem.save();
    res.json(updatedInventoryItem);
});

// @desc    Lấy danh sách các mặt hàng có số lượng thấp
// @route   GET /api/inventory/low-stock
// @access  Private
const getLowStockItems = asyncHandler(async (req, res) => {
    const lowStockItems = await Inventory.find({
        $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    }).populate('product', 'name price image');

    res.json(lowStockItems);
});

// @desc    Lấy danh sách kho hàng theo cửa hàng
// @route   GET /api/inventory/store/:storeId
// @access  Private
const getInventoryByStore = asyncHandler(async (req, res) => {
    const { storeId } = req.params;

    const inventoryItems = await Inventory.find({ storeId })
        .populate('product', 'name price image category')
        .sort('product');

    res.json(inventoryItems);
});

module.exports = {
    getInventoryItems,
    getInventoryItemById,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    addInventoryStock,
    reduceInventoryStock,
    getLowStockItems,
    getInventoryByStore
};