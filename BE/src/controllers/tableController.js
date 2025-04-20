const asyncHandler = require('express-async-handler');
const Table = require('../models/tableModel');

// Lấy tất cả bàn theo cửa hàng
const getTables = asyncHandler(async (req, res) => {
    const { storeId } = req.query;

    const filter = { isActive: true };
    if (storeId) filter.storeId = storeId;

    const tables = await Table.find(filter)
        .sort('tableNumber');

    res.json(tables);
});

// Lấy tất cả bàn theo ID cửa hàng
const getTablesByStoreId = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const tables = await Table.find({
        storeId: id,
        isActive: true
    }).sort('tableNumber');

    if (tables.length === 0) {
        return res.status(200).json([]);
    }

    res.json(tables);
});

// Lấy thông tin một bàn
const getTableById = asyncHandler(async (req, res) => {
    const table = await Table.findById(req.params.id);

    if (table) {
        res.json(table);
    } else {
        res.status(404);
        throw new Error('Không tìm thấy bàn');
    }
});

// Tạo bàn mới
const createTable = asyncHandler(async (req, res) => {
    const { tableNumber, capacity, location, storeId } = req.body;

    const tableExists = await Table.findOne({
        tableNumber,
        storeId,
        isActive: true
    });

    if (tableExists) {
        res.status(400);
        throw new Error('Số bàn đã tồn tại');
    }

    const table = await Table.create({
        tableNumber,
        capacity,
        location,
        storeId,
        status: 'available'
    });

    res.status(201).json(table);
});

// Cập nhật trạng thái bàn
const updateTableStatus = asyncHandler(async (req, res) => {
    const { status, currentOrderId } = req.body;

    const table = await Table.findById(req.params.id);

    if (table) {
        table.status = status || table.status;
        if (currentOrderId !== undefined) {
            table.currentOrderId = currentOrderId;
        }

        const updatedTable = await table.save();
        res.json(updatedTable);
    } else {
        res.status(404);
        throw new Error('Không tìm thấy bàn');
    }
});

// Cập nhật thông tin bàn
const updateTable = asyncHandler(async (req, res) => {
    const { tableNumber, capacity, location, isActive } = req.body;

    const table = await Table.findById(req.params.id);

    if (table) {
        table.tableNumber = tableNumber || table.tableNumber;
        table.capacity = capacity || table.capacity;
        table.location = location || table.location;

        if (isActive !== undefined) {
            table.isActive = isActive;
        }

        const updatedTable = await table.save();
        res.json(updatedTable);
    } else {
        res.status(404);
        throw new Error('Không tìm thấy bàn');
    }
});

module.exports = {
    getTables,
    getTableById,
    createTable,
    updateTableStatus,
    updateTable,
    getTablesByStoreId
};