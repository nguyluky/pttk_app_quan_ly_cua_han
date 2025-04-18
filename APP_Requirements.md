
PosApp là một phần mềm quản lý bán hàng được thiết kế cho nhiều loại hình kinh doanh như quán cà phê, nhà hàng và cửa hàng. Chức năng cốt lõi của nó là tối ưu hóa các hoạt động kinh doanh và giải quyết các thách thức quản lý thường gặp. Dưới đây là phân tích chi tiết về các chức năng của nó:

Yêu cầu bắt buộc:
- hệ thống được chia ra làm 2 phần chính phần BE sử lý lưu trữ và thông kê điêu phối.
- Nhiều quán ăn và buôn bán có thể sử dụng chung một cơ sở BE
- BE sử dụng ngôn ngữ nodejs và expressjs
- FE bao gồm giao diện điện thoại web và taplet, có 2 giao diện chính một co người quán lý 2 là nhân viên.
- FE thì sử dụng create-react-router và tailwind với daisyui

| Yêu Cầu                 | Mô Tả Chi Tiết                                                                                                                                                        |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nhập Đơn Hàng:          |                                                                                                                                                                       |
|                         | \- Hệ thống phải cho phép nhân viên nhập đơn hàng của khách hàng một cách nhanh chóng và chính xác.                                                                   |
|                         | \- Hệ thống nên hỗ trợ tìm kiếm các món ăn trong thực đơn.                                                                                                            |
|                         | \- Hệ thống phải cho phép tùy chỉnh các món ăn (ví dụ: thêm topping, chọn kích cỡ).                                                                                   |
|                         | \- Hệ thống nên hỗ trợ tách đơn hàng và gộp đơn hàng.                                                                                                                 |
| Xử Lý Thanh Toán:       |                                                                                                                                                                       |
|                         | \- Hệ thống phải hỗ trợ nhiều phương thức thanh toán (ví dụ: tiền mặt, thẻ tín dụng, thanh toán di động).                                                             |
|                         | \- Hệ thống phải có khả năng tính toán tổng số tiền phải trả, bao gồm thuế và giảm giá.                                                                               |
|                         | \- Hệ thống phải tạo hóa đơn cho khách hàng.                                                                                                                          |
| Quản Lý Thực Đơn:       |                                                                                                                                                                       |
|                         | \- Hệ thống phải cho phép quản trị viên thêm, chỉnh sửa và xóa các món ăn trong thực đơn.                                                                             |
|                         | \- Hệ thống nên hỗ trợ phân loại các món ăn trong thực đơn.                                                                                                           |
|                         | \- Hệ thống phải cho phép thiết lập giá cho các món ăn trong thực đơn.                                                                                                |
|                         | \- Hệ thống nên hỗ trợ thêm mô tả và hình ảnh cho các món ăn trong thực đơn.                                                                                          |
| Quản Lý Khuyến Mãi:     |                                                                                                                                                                       |
|                         | \- Hệ thống phải cho phép quản trị viên tạo và quản lý nhiều loại khuyến mãi khác nhau (ví dụ: giảm giá theo phần trăm, giảm giá theo số tiền cố định, ưu đãi combo). |
|                         | \- Hệ thống nên cho phép thiết lập ngày bắt đầu và ngày kết thúc cho các chương trình khuyến mãi.                                                                     |
|                         | \- Hệ thống nên cho phép áp dụng các chương trình khuyến mãi cho các món ăn cụ thể hoặc tổng giá trị đơn hàng.                                                        |
| Quản Lý Phiếu Giảm Giá: |                                                                                                                                                                       |
|                         | \- Hệ thống phải cho phép quản trị viên tạo các phiếu giảm giá duy nhất.                                                                                              |
|                         | \- Hệ thống nên cho phép thiết lập số tiền hoặc tỷ lệ giảm giá cho phiếu giảm giá.                                                                                    |
|                         | \- Hệ thống nên cho phép thiết lập ngày hết hạn cho phiếu giảm giá.                                                                                                   |
| Quản Lý Nhân Viên:      |                                                                                                                                                                       |
|                         | \- Hệ thống nên cho phép quản trị viên tạo và quản lý tài khoản nhân viên.                                                                                            |
|                         | \- Hệ thống nên cho phép phân công các vai trò và quyền hạn khác nhau cho các thành viên trong nhóm.                                                                  |
|                         | \- Hệ thống nên theo dõi hoạt động của nhân viên (ví dụ: đơn hàng đã nhận, giao dịch đã xử lý).                                                                       |
| Quản Lý Kho Hàng:       |                                                                                                                                                                       |
|                         | \- Hệ thống phải cho phép quản trị viên thêm, chỉnh sửa và xóa các mặt hàng trong kho.                                                                                |
|                         | \- Hệ thống nên theo dõi số lượng của từng mặt hàng trong kho.                                                                                                        |
|                         | \- Hệ thống nên cung cấp cảnh báo khi mức tồn kho thấp.                                                                                                               |
|                         | \- Hệ thống nên hỗ trợ theo dõi việc nhập, xuất và chuyển kho.                                                                                                        |
| Báo Cáo:                |                                                                                                                                                                       |
|                         | \- Hệ thống phải tạo báo cáo bán hàng (ví dụ: doanh số hàng ngày, hàng tuần, hàng tháng).                                                                             |
|                         | \- Hệ thống nên cung cấp báo cáo về các mặt hàng bán chạy nhất.                                                                                                       |
|                         | \- Hệ thống nên cung cấp dữ liệu và thông tin chi tiết về khách hàng.                                                                                                 |
|                         | \- Hệ thống nên tạo báo cáo tồn kho.                                                                                                                                  |
| Truy Cập Từ Xa:         |                                                                                                                                                                       |
|                         | \- Hệ thống nên cho phép người dùng được ủy quyền truy cập dữ liệu và các chức năng chính từ xa.                                                                      |
| Đồng Bộ Hóa Đơn Hàng:   |                                                                                                                                                                       |
|                         | \- Hệ thống phải đảm bảo đồng bộ hóa đơn hàng theo thời gian thực trên tất cả các thiết bị.                                                                           |
| Đặt Hàng Trực Tuyến:    |                                                                                                                                                                       |
|                         | \- Hệ thống nên cung cấp một nền tảng để khách hàng đặt hàng trực tuyến.                                                                                              |
|                         | \- Hệ thống đặt hàng trực tuyến nên hiển thị thực đơn và cho phép tùy chỉnh đơn hàng.                                                                                 |
|                         | \- Hệ thống nên tích hợp với các dịch vụ giao hàng để thực hiện đơn hàng.                                                                                             |
|                         | \- Hệ thống nên hỗ trợ xử lý thanh toán trực tuyến.                                                                                                                   |
| Tích Hợp:               |                                                                                                                                                                       |
|                         | \- Hệ thống nên tích hợp với máy in bếp.                                                                                                                              |
|                         | \- Hệ thống nên tích hợp với các nền tảng mạng xã hội (ví dụ: Facebook, Zalo) để đặt hàng trực tuyến.                                                                 |
| Yêu Cầu Phi Chức Năng:  |                                                                                                                                                                       |
| Hiệu Suất:              | \- Hệ thống phải phản hồi nhanh và xử lý một lượng lớn đơn hàng hiệu quả.                                                                                             |
| Khả Năng Mở Rộng:       | \- Hệ thống phải có khả năng mở rộng để đáp ứng sự phát triển của doanh nghiệp.                                                                                       |
| Bảo Mật:                | \- Hệ thống phải bảo vệ dữ liệu nhạy cảm, chẳng hạn như thông tin khách hàng và giao dịch tài chính.                                                                  |
| Tính Khả Dụng:          | \- Hệ thống phải có giao diện thân thiện với người dùng, dễ dàng cho nhân viên học và sử dụng.                                                                        |
| Độ Tin Cậy:             | \- Hệ thống phải đáng tin cậy và có sẵn để sử dụng trong giờ làm việc.  

