let orders = [];
let products = [];
let tables = [];

async function loadOrdersContent() {
    const contentDiv = document.getElementById('mainContent');
    
    try {
        // Load all necessary data
        const [ordersResponse, productsResponse, tablesResponse] = await Promise.all([
            axios.get('/orders'),
            axios.get('/products'),
            axios.get('/tables')
        ]);
        
        orders = ordersResponse.data;
        products = productsResponse.data;
        tables = tablesResponse.data;

        contentDiv.innerHTML = `
            <div class="d-flex justify-content-between mb-3">
                <div class="d-flex gap-2">
                    <input type="date" class="form-control" id="dateFilter" value="${new Date().toISOString().split('T')[0]}">
                    <select class="form-select" id="statusFilter">
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xác nhận</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>
                <div class="btn-group">
                    <button class="btn btn-outline-secondary" onclick="exportOrders()">
                        <i class="bi bi-download"></i> Xuất Excel
                    </button>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Thời gian</th>
                            <th>Bàn</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="ordersTableBody">
                        ${renderOrdersTable()}
                    </tbody>
                </table>
            </div>
        `;

        setupOrderEventListeners();
    } catch (error) {
        console.error('Error loading orders:', error);
        contentDiv.innerHTML = '<div class="alert alert-danger">Có lỗi xảy ra khi tải dữ liệu đơn hàng. Vui lòng thử lại.</div>';
    }
}

function renderOrdersTable(filter = {}) {
    let filteredOrders = orders;
    
    // Apply date filter
    if (filter.date) {
        const filterDate = new Date(filter.date);
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate.toDateString() === filterDate.toDateString();
        });
    }

    // Apply status filter
    if (filter.status && filter.status !== 'all') {
        filteredOrders = filteredOrders.filter(order => order.status === filter.status);
    }

    return filteredOrders.map(order => {
        const table = tables.find(t => t._id === order.tableId);
        const statusClasses = {
            pending: 'warning',
            processing: 'info',
            completed: 'success',
            cancelled: 'danger'
        };
        const statusTexts = {
            pending: 'Chờ xác nhận',
            processing: 'Đang xử lý',
            completed: 'Hoàn thành',
            cancelled: 'Đã hủy'
        };

        return `
            <tr>
                <td>
                    <div class="fw-bold">#${order.orderNumber || order._id.slice(-6)}</div>
                    <small class="text-muted">${order.items.length} món</small>
                </td>
                <td>
                    <div>${new Date(order.createdAt).toLocaleTimeString('vi-VN')}</div>
                    <small class="text-muted">${new Date(order.createdAt).toLocaleDateString('vi-VN')}</small>
                </td>
                <td>${table ? table.name : 'N/A'}</td>
                <td>${order.total.toLocaleString()}đ</td>
                <td>
                    <span class="badge bg-${statusClasses[order.status]}">
                        ${statusTexts[order.status]}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="showOrderDetails('${order._id}')">
                            <i class="bi bi-eye"></i>
                        </button>
                        ${order.status === 'pending' ? `
                            <button class="btn btn-outline-success" onclick="updateOrderStatus('${order._id}', 'processing')">
                                <i class="bi bi-check2"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="updateOrderStatus('${order._id}', 'cancelled')">
                                <i class="bi bi-x"></i>
                            </button>
                        ` : ''}
                        ${order.status === 'processing' ? `
                            <button class="btn btn-outline-success" onclick="updateOrderStatus('${order._id}', 'completed')">
                                <i class="bi bi-check2-all"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function setupOrderEventListeners() {
    // Date filter
    document.getElementById('dateFilter').addEventListener('change', filterOrders);
    
    // Status filter
    document.getElementById('statusFilter').addEventListener('change', filterOrders);
}

function filterOrders() {
    const dateFilter = document.getElementById('dateFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    document.getElementById('ordersTableBody').innerHTML = renderOrdersTable({
        date: dateFilter,
        status: statusFilter
    });
}

function showOrderDetails(orderId) {
    const order = orders.find(o => o._id === orderId);
    const table = tables.find(t => t._id === order.tableId);
    const modal = document.getElementById('formModal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');

    modalTitle.textContent = `Chi tiết đơn hàng #${order.orderNumber || order._id.slice(-6)}`;
    modalBody.innerHTML = `
        <div class="mb-3">
            <div class="row g-3">
                <div class="col-6">
                    <strong>Thời gian:</strong><br>
                    ${new Date(order.createdAt).toLocaleString('vi-VN')}
                </div>
                <div class="col-6">
                    <strong>Bàn:</strong><br>
                    ${table ? table.name : 'N/A'}
                </div>
                <div class="col-6">
                    <strong>Trạng thái:</strong><br>
                    <span class="badge bg-${order.status === 'completed' ? 'success' : 
                                         order.status === 'cancelled' ? 'danger' : 
                                         order.status === 'processing' ? 'info' : 'warning'}">
                        ${order.status === 'completed' ? 'Hoàn thành' :
                          order.status === 'cancelled' ? 'Đã hủy' :
                          order.status === 'processing' ? 'Đang xử lý' : 'Chờ xác nhận'}
                    </span>
                </div>
                <div class="col-6">
                    <strong>Phương thức thanh toán:</strong><br>
                    ${order.paymentMethod === 'cash' ? 'Tiền mặt' :
                      order.paymentMethod === 'card' ? 'Thẻ' : 'Chuyển khoản'}
                </div>
            </div>
        </div>

        <div class="mb-3">
            <strong>Các món:</strong>
            <div class="list-group list-group-flush mt-2">
                ${order.items.map(item => {
                    const product = products.find(p => p._id === item.productId);
                    return `
                        <div class="list-group-item">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 class="mb-0">${product.name}</h6>
                                    <small class="text-muted">${item.price.toLocaleString()}đ × ${item.quantity}</small>
                                </div>
                                <strong>${(item.price * item.quantity).toLocaleString()}đ</strong>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>

        <div class="mb-3">
            <div class="d-flex justify-content-between mb-2">
                <span>Tạm tính:</span>
                <span>${order.subtotal.toLocaleString()}đ</span>
            </div>
            ${order.discount ? `
                <div class="d-flex justify-content-between mb-2">
                    <span>Giảm giá:</span>
                    <span>-${order.discount.toLocaleString()}đ</span>
                </div>
            ` : ''}
            <div class="d-flex justify-content-between">
                <strong>Tổng cộng:</strong>
                <strong>${order.total.toLocaleString()}đ</strong>
            </div>
        </div>

        ${order.note ? `
            <div class="mb-3">
                <strong>Ghi chú:</strong>
                <p class="mb-0">${order.note}</p>
            </div>
        ` : ''}

        <div class="d-grid">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
        </div>
    `;

    // Show modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        await axios.put(`/orders/${orderId}/status`, { status: newStatus });
        await loadOrdersContent();
        alert('Đã cập nhật trạng thái đơn hàng!');
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Có lỗi xảy ra khi cập nhật trạng thái. Vui lòng thử lại.');
    }
}

async function exportOrders() {
    try {
        const dateFilter = document.getElementById('dateFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;

        const response = await axios.get('/orders/export', {
            params: {
                date: dateFilter,
                status: statusFilter !== 'all' ? statusFilter : undefined
            },
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `orders-${dateFilter || 'all'}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        console.error('Error exporting orders:', error);
        alert('Có lỗi xảy ra khi xuất dữ liệu. Vui lòng thử lại.');
    }
}