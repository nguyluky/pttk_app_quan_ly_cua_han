const express = require('express');
const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { protect, manager, sameStore } = require('../middleware/authMiddleware');

const router = express.Router();

// Tất cả các routes đều cần đăng nhập
router.use(protect);

// Routes cơ bản
router.route('/')
    .post(manager, sameStore, createCategory)
    .get(getCategories);

router.route('/:id')
    .get(getCategoryById)
    .put(manager, sameStore, updateCategory)
    .delete(manager, sameStore, deleteCategory);

module.exports = router;