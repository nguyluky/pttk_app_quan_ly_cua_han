const Store = require('../models/storeModel');
const asyncHandler = require('express-async-handler');

// @desc    Create a new store
// @route   POST /api/stores
// @access  Public
const createStore = asyncHandler(async (req, res) => {
    const { name, address, phone, email, businessType } = req.body;

    if (!name || !address || !phone) {
        res.status(400);
        throw new Error('Please provide name, address and phone');
    }

    const store = await Store.create({
        name,
        address,
        phone,
        email,
        businessType: businessType || 'restaurant',
        settings: {
            currency: 'VND',
            taxRate: 10,
            receiptFooter: 'Cảm ơn quý khách!'
        }
    });

    res.status(201).json(store);
});

// @desc    Get all stores
// @route   GET /api/stores
// @access  Private/Admin
const getStores = asyncHandler(async (req, res) => {
    const stores = await Store.find({});
    res.json(stores);
});

// @desc    Get store by ID
// @route   GET /api/stores/:id
// @access  Private
const getStoreById = asyncHandler(async (req, res) => {
    const store = await Store.findById(req.params.id);
    
    if (store) {
        res.json(store);
    } else {
        res.status(404);
        throw new Error('Store not found');
    }
});

module.exports = {
    createStore,
    getStores,
    getStoreById
};