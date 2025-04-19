let inventory = [];
let products = [];

async function loadInventoryContent() {
    const contentDiv = document.getElementById('mainContent');
    
    try {
        // Load products and inventory data
        const [productsResponse, inventoryResponse] = await Promise.all([
            axios.get('/products'),
            axios.get('/inventory')
        ]);
        
        products = productsResponse.data;
        inventory = inventoryResponse.data;

        contentDiv.innerHTML = `
            <div class="d-flex justify-content-between mb-3">
                <div class="d-flex gap-2">
                    <input type="text" class="form-control" id="searchInventory" placeholder="Tìm sản phẩm...">
                    <select class="form-select" id="stockFilter">
                        <option value="all">Tất cả</option>
                        <option value="low">Sắp hết hàng</option>
                        <option value="out">Hết hàng</option>
                    </select>
                </div>
                <button class="btn btn-primary" onclick="showInventoryForm()">
                    <i class="bi bi-plus"></i> Nhập hàng
                </button>
            </div>

            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Tồn kho</th>
                            <th>Đã bán</th>
                            <th>Trạng thái</th>
                            <th>Cập nhật cuối</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="inventoryTableBody">
                        ${renderInventoryTable()}
                    </tbody>
                </table>
            </div>
        `;

        setupInventoryEventListeners();
    } catch (error) {
        console.error('Error loading inventory:', error);
        contentDiv.innerHTML = '<div class="alert alert-danger">Có lỗi xảy ra khi tải dữ liệu kho hàng. Vui lòng thử lại.</div>';
    }
}

function renderInventoryTable(filter = '') {
    let filteredInventory = inventory;
    
    // Apply search filter
    if (filter) {
        filteredInventory = inventory.filter(item => {
            const product = products.find(p => p._id === item.productId);
            return product.name.toLowerCase().includes(filter.toLowerCase());
        });
    }

    // Apply stock filter
    const stockFilter = document.getElementById('stockFilter')?.value;
    if (stockFilter === 'low') {
        filteredInventory = filteredInventory.filter(item => item.quantity > 0 && item.quantity <= item.minStock);
    } else if (stockFilter === 'out') {
        filteredInventory = filteredInventory.filter(item => item.quantity === 0);
    }

    return filteredInventory.map(item => {
        const product = products.find(p => p._id === item.productId);
        const status = item.quantity === 0 ? 'danger' : 
                      item.quantity <= item.minStock ? 'warning' : 'success';
        const statusText = item.quantity === 0 ? 'Hết hàng' : 
                          item.quantity <= item.minStock ? 'Sắp hết' : 'Còn hàng';

        return `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 40px; height: 40px; object-fit: cover;">` : ''}
                        <div>
                            <div>${product.name}</div>
                            <small class="text-muted">${product.code || ''}</small>
                        </div>
                    </div>
                </td>
                <td>${item.quantity}</td>
                <td>${item.sold || 0}</td>
                <td>
                    <span class="badge bg-${status}">
                        ${statusText}
                    </span>
                </td>
                <td>${new Date(item.updatedAt).toLocaleDateString('vi-VN')}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="showInventoryForm('${item._id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-secondary" onclick="showInventoryHistory('${item._id}')">
                            <i class="bi bi-clock-history"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function setupInventoryEventListeners() {
    // Search inventory
    document.getElementById('searchInventory').addEventListener('input', (e) => {
        document.getElementById('inventoryTableBody').innerHTML = renderInventoryTable(e.target.value);
    });

    // Stock filter
    document.getElementById('stockFilter').addEventListener('change', () => {
        document.getElementById('inventoryTableBody').innerHTML = renderInventoryTable(
            document.getElementById('searchInventory').value
        );
    });
}

function showInventoryForm(inventoryId = null) {
    const inventoryItem = inventoryId ? inventory.find(i => i._id === inventoryId) : null;
    const modal = document.getElementById('formModal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');

    modalTitle.textContent = inventoryId ? 'Cập nhật tồn kho' : 'Nhập hàng';
    modalBody.innerHTML = `
        <form id="inventoryForm">
            ${!inventoryId ? `
                <div class="mb-3">
                    <label class="form-label">Sản phẩm</label>
                    <select class="form-select" id="inventoryProduct" required>
                        <option value="">Chọn sản phẩm</option>
                        ${products.map(product => `
                            <option value="${product._id}">${product.name}</option>
                        `).join('')}
                    </select>
                </div>
            ` : ''}
            <div class="mb-3">
                <label class="form-label">Số lượng ${inventoryId ? 'thêm/giảm' : 'nhập'}</label>
                <input type="number" class="form-control" id="inventoryQuantity" required>
                ${inventoryId ? '<small class="text-muted">Nhập số âm để giảm số lượng</small>' : ''}
            </div>
            <div class="mb-3">
                <label class="form-label">Ghi chú</label>
                <textarea class="form-control" id="inventoryNote" rows="2"></textarea>
            </div>
            <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary">
                    ${inventoryId ? 'Cập nhật' : 'Nhập'} kho
                </button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            </div>
        </form>
    `;

    // Setup form submission
    document.getElementById('inventoryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateInventory(inventoryId);
    });

    // Show modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

async function updateInventory(inventoryId) {
    try {
        const inventoryData = {
            productId: inventoryId ? undefined : document.getElementById('inventoryProduct').value,
            quantity: parseInt(document.getElementById('inventoryQuantity').value),
            note: document.getElementById('inventoryNote').value
        };

        if (inventoryId) {
            await axios.put(`/inventory/${inventoryId}`, inventoryData);
        } else {
            await axios.post('/inventory', inventoryData);
        }

        // Reload inventory and close modal
        await loadInventoryContent();
        bootstrap.Modal.getInstance(document.getElementById('formModal')).hide();
        
        // Show success message
        alert(inventoryId ? 'Đã cập nhật tồn kho!' : 'Đã nhập hàng thành công!');
    } catch (error) {
        console.error('Error updating inventory:', error);
        alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
}

async function showInventoryHistory(inventoryId) {
    const modal = document.getElementById('formModal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');
    const item = inventory.find(i => i._id === inventoryId);
    const product = products.find(p => p._id === item.productId);

    try {
        const response = await axios.get(`/inventory/${inventoryId}/history`);
        const history = response.data;

        modalTitle.textContent = `Lịch sử - ${product.name}`;
        modalBody.innerHTML = `
            <div class="list-group list-group-flush">
                ${history.map(entry => `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">
                                    ${entry.quantity >= 0 ? '+' : ''}${entry.quantity}
                                </h6>
                                <small class="text-muted">
                                    ${new Date(entry.createdAt).toLocaleString('vi-VN')}
                                </small>
                            </div>
                            <small>${entry.note || ''}</small>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="mt-3">
                <button type="button" class="btn btn-secondary w-100" data-bs-dismiss="modal">Đóng</button>
            </div>
        `;

        // Show modal
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();
    } catch (error) {
        console.error('Error loading inventory history:', error);
        alert('Có lỗi xảy ra khi tải lịch sử. Vui lòng thử lại.');
    }
}