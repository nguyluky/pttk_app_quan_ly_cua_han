const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    createStore,
    getStores,
    getStoreById
} = require('../controllers/storeController');

// Public route to create store
router.post('/', createStore);

// Protected routes
router.get('/', protect, admin, getStores);
router.get('/:id', protect, getStoreById);

module.exports = router;