# ERD của Hệ thống Quản lý Cửa hàng

Dựa trên các mô hình dữ liệu trong workspace của bạn, tôi đã tạo một sơ đồ quan hệ thực thể (ERD) cho hệ thống quản lý cửa hàng:

## Các thực thể chính:

1. **User (Người dùng)**
   - _id
   - name
   - email (unique)
   - password
   - phone
   - role (admin, manager, staff)
   - storeId (FK -> Store)
   - isActive
   - timestamps

2. **Store (Cửa hàng)**
   - _id
   - name
   - address
   - phone
   - email
   - taxId
   - logo
   - businessType (restaurant, cafe, retail, other)
   - owner (FK -> User)
   - isActive
   - settings (currency, taxRate, receiptFooter, allowOnlineOrder)
   - timestamps

3. **Product (Sản phẩm)**
   - _id
   - name
   - description
   - price
   - image
   - categoryId (FK -> Category)
   - storeId (FK -> Store)
   - sku
   - barcode
   - isAvailable
   - trackInventory
   - inventoryQuantity
   - lowInventoryThreshold
   - options (name, price)
   - toppings (FK -> Product)
   - timestamps

4. **Category (Danh mục)**
   - _id
   - name
   - description
   - image
   - storeId (FK -> Store)
   - isActive
   - order
   - timestamps

5. **Order (Đơn hàng)**
   - _id
   - orderNumber (unique)
   - storeId (FK -> Store)
   - customer (name, phone, email)
   - items (product, quantity, price, options, toppings, note, subtotal)
   - subtotal
   - tax
   - discount
   - discountType
   - couponCode
   - total
   - paymentMethod
   - paymentStatus
   - orderType
   - status
   - table
   - note
   - processedBy (FK -> User)
   - deliveryAddress
   - deliveryFee
   - timestamps

6. **Inventory (Kho hàng)**
   - _id
   - product (FK -> Product)
   - storeId (FK -> Store)
   - quantity
   - unit
   - lowStockThreshold
   - supplierInfo
   - notes
   - history (action, quantity, date, notes, user)
   - lastUpdatedBy (FK -> User)
   - lastUpdatedAt
   - timestamps

7. **Promotion (Khuyến mãi)**
   - _id
   - name
   - description
   - type (percentage, amount, buy_x_get_y, special)
   - value
   - buyQuantity
   - getQuantity
   - storeId (FK -> Store)
   - productIds (FK -> Product)
   - categoryIds (FK -> Category)
   - minOrderValue
   - isActive
   - startDate
   - endDate
   - daysOfWeek
   - startTime
   - endTime
   - image
   - priority
   - timestamps

8. **Coupon (Phiếu giảm giá)**
   - _id
   - code (unique)
   - type (percentage, amount)
   - value
   - minOrderValue
   - maxDiscount
   - storeId (FK -> Store)
   - isActive
   - usageLimit
   - usedCount
   - startDate
   - endDate
   - productIds (FK -> Product)
   - categoryIds (FK -> Category)
   - description
   - timestamps

9. **Table (Bàn)**
   - _id
   - name
   - capacity
   - status (available, occupied, reserved, cleaning)
   - area (indoor, outdoor, rooftop, vip, other)
   - storeId (FK -> Store)
   - positionX
   - positionY
   - currentOrderId (FK -> Order)
   - isActive
   - timestamps

## Mối quan hệ chính:

- User thuộc về một Store
- Store có nhiều User, Product, Category, Order, Inventory, Promotion, Coupon
- Product thuộc về một Store và một Category
- Order thuộc về một Store, được xử lý bởi một User
- Inventory liên kết với một Product và một Store
- Promotion và Coupon có thể áp dụng cho nhiều Product và Category
- Table thuộc về một Store và có thể liên kết với một Order hiện tại

Mô hình ERD này thể hiện cấu trúc cơ sở dữ liệu của hệ thống quản lý cửa hàng đa năng, có khả năng xử lý đơn hàng, quản lý tồn kho, khuyến mãi và các chức năng quản lý khác.