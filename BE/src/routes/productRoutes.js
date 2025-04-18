const express = require('express');
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    updateInventory
} = require('../controllers/productController');
const { protect, manager, sameStore } = require('../middleware/authMiddleware');

const router = express.Router();

// Tất cả các routes đều cần đăng nhập
router.use(protect);

// Routes cơ bản
router.route('/')
    .post(manager, sameStore, createProduct)
    .get(getProducts);

router.route('/:id')
    .get(getProductById)
    .put(manager, sameStore, updateProduct)
    .delete(manager, sameStore, deleteProduct);

// Route quản lý tồn kho
router.route('/:id/inventory')
    .put(manager, sameStore, updateInventory);

module.exports = router;