const express = require('express');
const { login, getUserProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Xác thực người dùng và quản lý tài khoản
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Đăng nhập và nhận token JWT
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email người dùng
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mật khẩu
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID người dùng
 *                 name:
 *                   type: string
 *                   description: Tên người dùng
 *                 email:
 *                   type: string
 *                   description: Email người dùng
 *                 role:
 *                   type: string
 *                   description: Vai trò người dùng
 *                 storeId:
 *                   type: string
 *                   description: ID cửa hàng
 *                 token:
 *                   type: string
 *                   description: JWT token dùng cho xác thực
 *       401:
 *         description: Sai thông tin đăng nhập
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mật khẩu không đúng
 *                 error:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Tài khoản không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tài khoản không tồn tại
 *                 error:
 *                   type: boolean
 *                   example: true
 */
router.post('/login', login);

// Các routes yêu cầu đăng nhập
/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: ID người dùng
 *                 name:
 *                   type: string
 *                   description: Tên người dùng
 *                 email:
 *                   type: string
 *                   description: Email người dùng
 *                 role:
 *                   type: string
 *                   description: Vai trò người dùng
 *                 storeId:
 *                   type: string
 *                   description: ID cửa hàng
 *                 phone:
 *                   type: string
 *                   description: Số điện thoại
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.get('/profile', protect, getUserProfile);

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Đổi mật khẩu
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Mật khẩu hiện tại
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: Mật khẩu mới
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Đổi mật khẩu thành công
 *       400:
 *         description: Thiếu thông tin
 *       401:
 *         description: Mật khẩu hiện tại không đúng
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.put('/change-password', protect, changePassword);

module.exports = router;