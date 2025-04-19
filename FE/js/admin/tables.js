let tables = [];

async function loadTablesContent() {
    const contentDiv = document.getElementById('mainContent');
    
    try {
        // Load tables data
        const response = await axios.get('/tables');
        tables = response.data;

        contentDiv.innerHTML = `
            <div class="d-flex justify-content-between mb-3">
                <div class="d-flex gap-2">
                    <input type="text" class="form-control" id="searchTable" placeholder="Tìm bàn...">
                    <select class="form-select" id="statusFilter">
                        <option value="all">Tất cả trạng thái</option>
                        <option value="available">Trống</option>
                        <option value="occupied">Đang sử dụng</option>
                        <option value="reserved">Đã đặt</option>
                    </select>
                </div>
                <button class="btn btn-primary" onclick="showTableForm()">
                    <i class="bi bi-plus"></i> Thêm bàn
                </button>
            </div>

            <div class="row g-4" id="tablesGrid">
                ${renderTablesGrid()}
            </div>
        `;

        setupTableEventListeners();
    } catch (error) {
        console.error('Error loading tables:', error);
        contentDiv.innerHTML = '<div class="alert alert-danger">Có lỗi xảy ra khi tải dữ liệu bàn. Vui lòng thử lại.</div>';
    }
}

function renderTablesGrid(filter = '') {
    let filteredTables = tables;
    
    // Apply search filter
    if (filter) {
        filteredTables = tables.filter(table => 
            table.name.toLowerCase().includes(filter.toLowerCase()) ||
            table.description?.toLowerCase().includes(filter.toLowerCase())
        );
    }

    // Apply status filter
    const statusFilter = document.getElementById('statusFilter')?.value;
    if (statusFilter && statusFilter !== 'all') {
        filteredTables = filteredTables.filter(table => table.status === statusFilter);
    }

    return filteredTables.map(table => {
        const statusClasses = {
            available: 'success',
            occupied: 'danger',
            reserved: 'warning'
        };
        const statusTexts = {
            available: 'Trống',
            occupied: 'Đang sử dụng',
            reserved: 'Đã đặt'
        };

        return `
            <div class="col-md-3">
                <div class="card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-0">${table.name}</h5>
                            <span class="badge bg-${statusClasses[table.status]}">
                                ${statusTexts[table.status]}
                            </span>
                        </div>
                        <p class="card-text small text-muted mb-3">
                            ${table.description || 'Không có mô tả'}
                        </p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-muted small">
                                Sức chứa: ${table.capacity} người
                            </span>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="showTableForm('${table._id}')">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="deleteTable('${table._id}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function setupTableEventListeners() {
    // Search tables
    document.getElementById('searchTable').addEventListener('input', (e) => {
        document.getElementById('tablesGrid').innerHTML = renderTablesGrid(e.target.value);
    });

    // Filter by status
    document.getElementById('statusFilter').addEventListener('change', () => {
        document.getElementById('tablesGrid').innerHTML = renderTablesGrid(
            document.getElementById('searchTable').value
        );
    });
}

function showTableForm(tableId = null) {
    const table = tableId ? tables.find(t => t._id === tableId) : null;
    const modal = document.getElementById('formModal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');

    modalTitle.textContent = table ? 'Sửa thông tin bàn' : 'Thêm bàn mới';
    modalBody.innerHTML = `
        <form id="tableForm">
            <div class="mb-3">
                <label class="form-label">Tên bàn</label>
                <input type="text" class="form-control" id="tableName" required value="${table?.name || ''}">
            </div>
            <div class="mb-3">
                <label class="form-label">Sức chứa</label>
                <input type="number" class="form-control" id="tableCapacity" required 
                    min="1" value="${table?.capacity || '4'}">
            </div>
            <div class="mb-3">
                <label class="form-label">Mô tả</label>
                <textarea class="form-control" id="tableDescription" rows="2">${table?.description || ''}</textarea>
            </div>
            <div class="mb-3">
                <label class="form-label">Trạng thái</label>
                <select class="form-select" id="tableStatus" required>
                    <option value="available" ${table?.status === 'available' ? 'selected' : ''}>Trống</option>
                    <option value="occupied" ${table?.status === 'occupied' ? 'selected' : ''}>Đang sử dụng</option>
                    <option value="reserved" ${table?.status === 'reserved' ? 'selected' : ''}>Đã đặt</option>
                </select>
            </div>
            <div class="form-check mb-3">
                <input type="checkbox" class="form-check-input" id="tableActive" 
                    ${table?.active ?? true ? 'checked' : ''}>
                <label class="form-check-label">Đang hoạt động</label>
            </div>
            <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary">
                    ${table ? 'Cập nhật' : 'Thêm'} bàn
                </button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            </div>
        </form>
    `;

    // Setup form submission
    document.getElementById('tableForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveTable(tableId);
    });

    // Show modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

async function saveTable(tableId) {
    try {
        const tableData = {
            name: document.getElementById('tableName').value,
            capacity: parseInt(document.getElementById('tableCapacity').value),
            description: document.getElementById('tableDescription').value,
            status: document.getElementById('tableStatus').value,
            active: document.getElementById('tableActive').checked
        };

        if (tableId) {
            await axios.put(`/tables/${tableId}`, tableData);
        } else {
            await axios.post('/tables', tableData);
        }

        // Reload tables and close modal
        await loadTablesContent();
        bootstrap.Modal.getInstance(document.getElementById('formModal')).hide();
        
        // Show success message
        alert(tableId ? 'Đã cập nhật thông tin bàn!' : 'Đã thêm bàn mới!');
    } catch (error) {
        console.error('Error saving table:', error);
        alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
}

async function deleteTable(tableId) {
    if (!confirm('Bạn có chắc muốn xóa bàn này?')) {
        return;
    }

    try {
        await axios.delete(`/tables/${tableId}`);
        await loadTablesContent();
        alert('Đã xóa bàn!');
    } catch (error) {
        console.error('Error deleting table:', error);
        alert('Có lỗi xảy ra khi xóa bàn. Vui lòng thử lại.');
    }
}