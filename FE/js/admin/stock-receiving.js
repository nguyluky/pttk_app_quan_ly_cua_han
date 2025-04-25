document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('mainContent');

    function loadStockReceiving() {
        mainContent.innerHTML = `
            <div class="container">
                <div class="row mb-4">
                    <div class="col">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h5 class="card-title">Nhập hàng</h5>
                                    <button class="btn btn-primary" id="btnNewReceiving">Tạo phiếu nhập</button>
                                </div>
                                <div class="table-responsive">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>Mã phiếu</th>
                                                <th>Ngày nhập</th>
                                                <th>Nhà cung cấp</th>
                                                <th>Tổng tiền</th>
                                                <th>Trạng thái</th>
                                                <th>Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody id="receivingList">
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal nhập hàng -->
            <div class="modal fade" id="receivingModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Phiếu nhập hàng</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="receivingForm">
                                <div class="mb-3">
                                    <label class="form-label">Nhà cung cấp</label>
                                    <input type="text" class="form-control" id="supplier" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Sản phẩm</label>
                                    <div id="productsList">
                                        <div class="row product-entry mb-2">
                                            <div class="col">
                                                <select class="form-select product-select" required>
                                                    <option value="">Chọn sản phẩm</option>
                                                </select>
                                            </div>
                                            <div class="col">
                                                <input type="number" class="form-control quantity" placeholder="Số lượng" required>
                                            </div>
                                            <div class="col">
                                                <input type="number" class="form-control price" placeholder="Đơn giá" required>
                                            </div>
                                            <div class="col-auto">
                                                <button type="button" class="btn btn-danger remove-product">Xóa</button>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="button" class="btn btn-secondary mt-2" id="addProduct">Thêm sản phẩm</button>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Ghi chú</label>
                                    <textarea class="form-control" id="notes"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                            <button type="button" class="btn btn-primary" id="saveReceiving">Lưu phiếu</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        document.getElementById('btnNewReceiving').addEventListener('click', showReceivingModal);
        document.getElementById('addProduct').addEventListener('click', addProductRow);
        document.getElementById('saveReceiving').addEventListener('click', saveReceiving);
        
        // Load initial data
        loadReceivingList();
        loadProducts();
    }

    async function loadReceivingList() {
        try {
            const response = await axios.get(`${API_URL}/api/inventory/receiving`);
            const receivingList = document.getElementById('receivingList');
            receivingList.innerHTML = response.data.map(item => `
                <tr>
                    <td>${item.id}</td>
                    <td>${new Date(item.date).toLocaleDateString()}</td>
                    <td>${item.supplier}</td>
                    <td>${item.total.toLocaleString('vi-VN')} đ</td>
                    <td><span class="badge bg-${item.status === 'completed' ? 'success' : 'warning'}">${item.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-info view-receiving" data-id="${item.id}">Xem</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('Error loading receiving list:', error);
            alert('Không thể tải danh sách phiếu nhập');
        }
    }

    async function loadProducts() {
        try {
            const response = await axios.get(`${API_URL}/api/products`);
            const products = response.data;
            const productSelects = document.querySelectorAll('.product-select');
            
            productSelects.forEach(select => {
                select.innerHTML = `
                    <option value="">Chọn sản phẩm</option>
                    ${products.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                `;
            });
        } catch (error) {
            console.error('Error loading products:', error);
            alert('Không thể tải danh sách sản phẩm');
        }
    }

    function showReceivingModal() {
        const modal = new bootstrap.Modal(document.getElementById('receivingModal'));
        modal.show();
    }

    function addProductRow() {
        const productsList = document.getElementById('productsList');
        const newRow = document.createElement('div');
        newRow.className = 'row product-entry mb-2';
        newRow.innerHTML = `
            <div class="col">
                <select class="form-select product-select" required>
                    <option value="">Chọn sản phẩm</option>
                </select>
            </div>
            <div class="col">
                <input type="number" class="form-control quantity" placeholder="Số lượng" required>
            </div>
            <div class="col">
                <input type="number" class="form-control price" placeholder="Đơn giá" required>
            </div>
            <div class="col-auto">
                <button type="button" class="btn btn-danger remove-product">Xóa</button>
            </div>
        `;
        productsList.appendChild(newRow);
        loadProducts();

        newRow.querySelector('.remove-product').addEventListener('click', () => {
            newRow.remove();
        });
    }

    async function saveReceiving() {
        const form = document.getElementById('receivingForm');
        if (!form.checkValidity()) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        const products = Array.from(document.querySelectorAll('.product-entry')).map(row => ({
            productId: row.querySelector('.product-select').value,
            quantity: parseInt(row.querySelector('.quantity').value),
            price: parseFloat(row.querySelector('.price').value)
        }));

        const receivingData = {
            supplier: document.getElementById('supplier').value,
            products: products,
            notes: document.getElementById('notes').value,
            date: new Date().toISOString()
        };

        try {
            await axios.post(`${API_URL}/api/inventory/receiving`, receivingData);
            alert('Lưu phiếu nhập thành công');
            bootstrap.Modal.getInstance(document.getElementById('receivingModal')).hide();
            loadReceivingList();
        } catch (error) {
            console.error('Error saving receiving:', error);
            alert('Không thể lưu phiếu nhập');
        }
    }

    // Initialize stock receiving page when loaded
    if (document.querySelector('[data-page="stock-receiving"]')) {
        loadStockReceiving();
    }
});