const express = require('express');
const {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} = require('../controllers/userController');
const { protect, admin, manager } = require('../middleware/authMiddleware');

const router = express.Router();

// Tất cả các routes đều cần đăng nhập
router.use(protect);

// Routes cho admin và manager
router.route('/')
    .post(manager, createUser)
    .get(manager, getUsers);

// Routes cho admin
router.route('/:id')
    .get(manager, getUserById)
    .put(manager, updateUser)
    .delete(admin, deleteUser);

module.exports = router;