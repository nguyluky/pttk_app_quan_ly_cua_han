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

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Quản lý sản phẩm
 */

// Tất cả các routes đều cần đăng nhập
router.use(protect);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Tạo sản phẩm mới
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - categoryId
 *               - storeId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên sản phẩm
 *               description:
 *                 type: string
 *                 description: Mô tả sản phẩm
 *               price:
 *                 type: number
 *                 description: Giá sản phẩm
 *               image:
 *                 type: string
 *                 description: URL hình ảnh sản phẩm
 *               categoryId:
 *                 type: string
 *                 description: ID của danh mục
 *               storeId:
 *                 type: string
 *                 description: ID cửa hàng
 *               sku:
 *                 type: string
 *                 description: Mã SKU
 *               barcode:
 *                 type: string
 *                 description: Mã vạch
 *               isAvailable:
 *                 type: boolean
 *                 description: Trạng thái sản phẩm có thể bán
 *               trackInventory:
 *                 type: boolean
 *                 description: Theo dõi tồn kho
 *               inventoryQuantity:
 *                 type: number
 *                 description: Số lượng trong kho
 *               lowInventoryThreshold:
 *                 type: number
 *                 description: Ngưỡng cảnh báo hết hàng
 *               options:
 *                 type: array
 *                 description: Các tùy chọn cho sản phẩm
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     values:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *               toppings:
 *                 type: array
 *                 description: ID các sản phẩm topping
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Sản phẩm đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập
 *
 *   get:
 *     summary: Lấy danh sách sản phẩm theo cửa hàng và danh mục
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: storeId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID cửa hàng
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: ID danh mục (tùy chọn)
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       400:
 *         description: Thiếu storeId
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

// Routes cơ bản
router.route('/')
    .post(manager, sameStore, createProduct)
    .get(getProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Lấy thông tin sản phẩm theo ID
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của sản phẩm
 *     responses:
 *       200:
 *         description: Thông tin sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 *   put:
 *     summary: Cập nhật thông tin sản phẩm
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của sản phẩm
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên sản phẩm
 *               description:
 *                 type: string
 *                 description: Mô tả sản phẩm
 *               price:
 *                 type: number
 *                 description: Giá sản phẩm
 *               image:
 *                 type: string
 *                 description: URL hình ảnh sản phẩm
 *               categoryId:
 *                 type: string
 *                 description: ID của danh mục
 *               sku:
 *                 type: string
 *                 description: Mã SKU
 *               barcode:
 *                 type: string
 *                 description: Mã vạch
 *               isAvailable:
 *                 type: boolean
 *                 description: Trạng thái sản phẩm có thể bán
 *               trackInventory:
 *                 type: boolean
 *                 description: Theo dõi tồn kho
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     values:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *               toppings:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Sản phẩm đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 *   delete:
 *     summary: Xóa sản phẩm
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của sản phẩm
 *     responses:
 *       200:
 *         description: Sản phẩm đã được xóa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sản phẩm đã được xóa
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

router.route('/:id')
    .get(getProductById)
    .put(manager, sameStore, updateProduct)
    .delete(manager, sameStore, deleteProduct);

/**
 * @swagger
 * /products/{id}/inventory:
 *   put:
 *     summary: Cập nhật thông tin tồn kho của sản phẩm
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của sản phẩm
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inventoryQuantity
 *             properties:
 *               inventoryQuantity:
 *                 type: number
 *                 description: Số lượng mới trong kho
 *               trackInventory:
 *                 type: boolean
 *                 description: Bật/tắt theo dõi tồn kho
 *               lowInventoryThreshold:
 *                 type: number
 *                 description: Ngưỡng cảnh báo hết hàng
 *     responses:
 *       200:
 *         description: Đã cập nhật tồn kho của sản phẩm
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

// Route quản lý tồn kho
router.route('/:id/inventory')
    .put(manager, sameStore, updateInventory);

module.exports = router;