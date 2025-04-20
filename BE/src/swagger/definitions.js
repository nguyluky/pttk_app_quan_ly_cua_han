/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - storeId
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của người dùng (MongoDB)
 *         name:
 *           type: string
 *           description: Tên đầy đủ của người dùng
 *         email:
 *           type: string
 *           description: Email người dùng (dùng để đăng nhập)
 *         password:
 *           type: string
 *           description: Mật khẩu (đã được mã hóa)
 *         phone:
 *           type: string
 *           description: Số điện thoại
 *         role:
 *           type: string
 *           enum: [admin, manager, staff]
 *           description: Vai trò của người dùng
 *         storeId:
 *           type: string
 *           description: ID cửa hàng mà người dùng thuộc về
 *         isActive:
 *           type: boolean
 *           description: Trạng thái hoạt động của tài khoản
 *
 *     Store:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - phone
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của cửa hàng (MongoDB)
 *         name:
 *           type: string
 *           description: Tên cửa hàng
 *         address:
 *           type: string
 *           description: Địa chỉ của cửa hàng
 *         phone:
 *           type: string
 *           description: Số điện thoại liên hệ
 *         email:
 *           type: string
 *           description: Email liên hệ
 *         businessType:
 *           type: string
 *           enum: [restaurant, cafe, retail, other]
 *           description: Loại hình kinh doanh
 *         isActive:
 *           type: boolean
 *           description: Trạng thái hoạt động
 *
 *     Category:
 *       type: object
 *       required:
 *         - name
 *         - storeId
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của danh mục (MongoDB)
 *         name:
 *           type: string
 *           description: Tên danh mục
 *         description:
 *           type: string
 *           description: Mô tả danh mục
 *         image:
 *           type: string
 *           description: URL hình ảnh danh mục
 *         storeId:
 *           type: string
 *           description: ID cửa hàng
 *         isActive:
 *           type: boolean
 *           description: Trạng thái kích hoạt
 *         order:
 *           type: integer
 *           description: Thứ tự sắp xếp
 *
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - categoryId
 *         - storeId
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của sản phẩm (MongoDB)
 *         name:
 *           type: string
 *           description: Tên sản phẩm
 *         description:
 *           type: string
 *           description: Mô tả sản phẩm
 *         price:
 *           type: number
 *           description: Giá sản phẩm
 *         image:
 *           type: string
 *           description: URL hình ảnh sản phẩm
 *         categoryId:
 *           type: string
 *           description: ID của danh mục
 *         storeId:
 *           type: string
 *           description: ID cửa hàng
 *         sku:
 *           type: string
 *           description: Mã SKU
 *         barcode:
 *           type: string
 *           description: Mã vạch
 *         isAvailable:
 *           type: boolean
 *           description: Trạng thái sản phẩm có thể bán
 *         trackInventory:
 *           type: boolean
 *           description: Theo dõi tồn kho
 *
 *     Order:
 *       type: object
 *       required:
 *         - orderItems
 *         - storeId
 *         - totalPrice
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của đơn hàng (MongoDB)
 *         user:
 *           type: string
 *           description: ID của người dùng tạo đơn hàng
 *         orderItems:
 *           type: array
 *           description: Danh sách các mặt hàng trong đơn hàng
 *           items:
 *             type: object
 *             properties:
 *               product:
 *                 type: string
 *                 description: ID của sản phẩm
 *               name:
 *                 type: string
 *                 description: Tên sản phẩm
 *               quantity:
 *                 type: integer
 *                 description: Số lượng sản phẩm
 *               price:
 *                 type: number
 *                 description: Giá của sản phẩm
 *         storeId:
 *           type: string
 *           description: ID cửa hàng
 *         tableId:
 *           type: string
 *           description: ID của bàn
 *         paymentMethod:
 *           type: string
 *           enum: [cash, card, momo, other]
 *           description: Phương thức thanh toán
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, cancelled]
 *           description: Trạng thái đơn hàng
 *         totalPrice:
 *           type: number
 *           description: Tổng tiền đơn hàng
 *         note:
 *           type: string
 *           description: Ghi chú đơn hàng
 *
 *     Inventory:
 *       type: object
 *       required:
 *         - product
 *         - storeId
 *         - quantity
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của mục lưu kho (MongoDB)
 *         product:
 *           type: string
 *           description: ID của sản phẩm
 *         storeId:
 *           type: string
 *           description: ID cửa hàng
 *         quantity:
 *           type: number
 *           description: Số lượng trong kho
 *         unit:
 *           type: string
 *           description: Đơn vị tính
 *         lowStockThreshold:
 *           type: number
 *           description: Ngưỡng cảnh báo hết hàng
 *
 *     Promotion:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - storeId
 *         - startDate
 *         - endDate
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của khuyến mãi (MongoDB)
 *         name:
 *           type: string
 *           description: Tên chương trình khuyến mãi
 *         description:
 *           type: string
 *           description: Mô tả khuyến mãi
 *         type:
 *           type: string
 *           enum: [percentage, amount, buy_x_get_y, special]
 *           description: Loại khuyến mãi
 *         value:
 *           type: number
 *           description: Giá trị khuyến mãi (% hoặc số tiền)
 *         storeId:
 *           type: string
 *           description: ID cửa hàng
 *         isActive:
 *           type: boolean
 *           description: Trạng thái kích hoạt
 *         startDate:
 *           type: string
 *           format: date
 *           description: Ngày bắt đầu
 *         endDate:
 *           type: string
 *           format: date
 *           description: Ngày kết thúc
 *
 *     Shift:
 *       type: object
 *       required:
 *         - storeId
 *         - name
 *         - startTime
 *         - endTime
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của ca làm việc (MongoDB)
 *         storeId:
 *           type: string
 *           description: ID cửa hàng
 *         name:
 *           type: string
 *           description: Tên ca làm việc
 *         startTime:
 *           type: string
 *           description: Giờ bắt đầu (HH:MM)
 *         endTime:
 *           type: string
 *           description: Giờ kết thúc (HH:MM)
 *         color:
 *           type: string
 *           description: Mã màu hiển thị
 *
 *     Schedule:
 *       type: object
 *       required:
 *         - userId
 *         - storeId
 *         - shiftId
 *         - date
 *         - createdBy
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của lịch làm việc (MongoDB)
 *         userId:
 *           type: string
 *           description: ID của nhân viên
 *         storeId:
 *           type: string
 *           description: ID cửa hàng
 *         shiftId:
 *           type: string
 *           description: ID ca làm việc
 *         date:
 *           type: string
 *           format: date
 *           description: Ngày làm việc
 *         status:
 *           type: string
 *           enum: [scheduled, confirmed, completed, absent, late]
 *           description: Trạng thái ca làm việc
 *         notes:
 *           type: string
 *           description: Ghi chú
 *         createdBy:
 *           type: string
 *           description: ID người tạo lịch
 *
 *     Table:
 *       type: object
 *       required:
 *         - tableNumber
 *         - capacity
 *         - storeId
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của bàn (MongoDB)
 *         tableNumber:
 *           type: string
 *           description: Số hoặc tên của bàn
 *         capacity:
 *           type: number
 *           description: Sức chứa tối đa của bàn (số người)
 *         status:
 *           type: string
 *           enum: [available, occupied, reserved, cleaning]
 *           description: Trạng thái hiện tại của bàn
 *         currentOrderId:
 *           type: string
 *           description: ID đơn hàng hiện đang sử dụng bàn
 *         storeId:
 *           type: string
 *           description: ID cửa hàng bàn thuộc về
 *         location:
 *           type: string
 *           description: Vị trí của bàn (ví dụ tầng 1, ngoài trời, v.v.)
 *         isActive:
 *           type: boolean
 *           description: Trạng thái kích hoạt của bàn
 *
 *     Reservation:
 *       type: object
 *       required:
 *         - customerName
 *         - customerPhone
 *         - tableId
 *         - reservationDate
 *         - numberOfGuests
 *         - storeId
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của đặt bàn (MongoDB)
 *         customerName:
 *           type: string
 *           description: Tên khách hàng đặt bàn
 *         customerPhone:
 *           type: string
 *           description: Số điện thoại khách hàng
 *         customerEmail:
 *           type: string
 *           description: Email khách hàng
 *         tableId:
 *           type: string
 *           description: ID của bàn được đặt
 *         reservationDate:
 *           type: string
 *           format: date-time
 *           description: Thời gian đặt bàn
 *         duration:
 *           type: number
 *           description: Thời gian dự kiến sử dụng (tính bằng phút)
 *         numberOfGuests:
 *           type: number
 *           description: Số lượng khách
 *         status:
 *           type: string
 *           enum: [pending, confirmed, completed, cancelled, no-show]
 *           description: Trạng thái đặt bàn
 *         specialRequests:
 *           type: string
 *           description: Yêu cầu đặc biệt
 *         storeId:
 *           type: string
 *           description: ID cửa hàng
 *         orderId:
 *           type: string
 *           description: ID đơn hàng liên kết với đặt bàn
 *
 *   responses:
 *     UnauthorizedError:
 *       description: Không có quyền truy cập
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Không được phép truy cập, token không hợp lệ
 *               error:
 *                 type: boolean
 *                 example: true
 *     NotFoundError:
 *       description: Không tìm thấy tài nguyên
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Không tìm thấy tài nguyên
 *               error:
 *                 type: boolean
 *                 example: true
 */