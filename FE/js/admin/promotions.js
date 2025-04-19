let promotions = [];

async function loadPromotionsContent() {
    const contentDiv = document.getElementById('mainContent');
    
    try {
        // Load promotions
        const response = await axios.get('/promotions');
        promotions = response.data;

        contentDiv.innerHTML = `
            <div class="d-flex justify-content-between mb-3">
                <div class="d-flex gap-2">
                    <input type="text" class="form-control" id="searchPromotion" placeholder="Tìm khuyến mãi...">
                    <select class="form-select" id="statusFilter">
                        <option value="all">Tất cả trạng thái</option>
                        <option value="active">Đang diễn ra</option>
                        <option value="upcoming">Sắp diễn ra</option>
                        <option value="expired">Đã kết thúc</option>
                    </select>
                </div>
                <button class="btn btn-primary" onclick="showPromotionForm()">
                    <i class="bi bi-plus"></i> Thêm khuyến mãi
                </button>
            </div>

            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Tên khuyến mãi</th>
                            <th>Mã</th>
                            <th>Giảm giá</th>
                            <th>Thời gian</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="promotionsTableBody">
                        ${renderPromotionsTable()}
                    </tbody>
                </table>
            </div>
        `;

        setupPromotionEventListeners();
    } catch (error) {
        console.error('Error loading promotions:', error);
        contentDiv.innerHTML = '<div class="alert alert-danger">Có lỗi xảy ra khi tải dữ liệu khuyến mãi. Vui lòng thử lại.</div>';
    }
}

function renderPromotionsTable(filter = '') {
    let filteredPromotions = promotions;
    
    // Apply search filter
    if (filter) {
        filteredPromotions = promotions.filter(promo => 
            promo.name.toLowerCase().includes(filter.toLowerCase()) ||
            promo.code.toLowerCase().includes(filter.toLowerCase())
        );
    }

    // Apply status filter
    const statusFilter = document.getElementById('statusFilter')?.value;
    if (statusFilter && statusFilter !== 'all') {
        const now = new Date();
        filteredPromotions = filteredPromotions.filter(promo => {
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);
            
            switch (statusFilter) {
                case 'active':
                    return now >= startDate && now <= endDate;
                case 'upcoming':
                    return now < startDate;
                case 'expired':
                    return now > endDate;
                default:
                    return true;
            }
        });
    }

    return filteredPromotions.map(promotion => {
        const now = new Date();
        const startDate = new Date(promotion.startDate);
        const endDate = new Date(promotion.endDate);
        let status, statusClass;

        if (now < startDate) {
            status = 'Sắp diễn ra';
            statusClass = 'warning';
        } else if (now > endDate) {
            status = 'Đã kết thúc';
            statusClass = 'secondary';
        } else {
            status = 'Đang diễn ra';
            statusClass = 'success';
        }

        return `
            <tr>
                <td>
                    <div class="fw-bold">${promotion.name}</div>
                    <small class="text-muted">${promotion.description || ''}</small>
                </td>
                <td><code>${promotion.code}</code></td>
                <td>
                    ${promotion.type === 'percentage' ? 
                        `${promotion.value}%` : 
                        `${promotion.value.toLocaleString()}đ`}
                </td>
                <td>
                    <div>${new Date(promotion.startDate).toLocaleDateString('vi-VN')}</div>
                    <small class="text-muted">đến ${new Date(promotion.endDate).toLocaleDateString('vi-VN')}</small>
                </td>
                <td>
                    <span class="badge bg-${statusClass}">
                        ${status}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="showPromotionForm('${promotion._id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deletePromotion('${promotion._id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function setupPromotionEventListeners() {
    // Search promotions
    document.getElementById('searchPromotion').addEventListener('input', (e) => {
        document.getElementById('promotionsTableBody').innerHTML = renderPromotionsTable(e.target.value);
    });

    // Filter by status
    document.getElementById('statusFilter').addEventListener('change', () => {
        document.getElementById('promotionsTableBody').innerHTML = renderPromotionsTable(
            document.getElementById('searchPromotion').value
        );
    });
}

function showPromotionForm(promotionId = null) {
    const promotion = promotionId ? promotions.find(p => p._id === promotionId) : null;
    const modal = document.getElementById('formModal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');

    modalTitle.textContent = promotion ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi mới';
    modalBody.innerHTML = `
        <form id="promotionForm">
            <div class="mb-3">
                <label class="form-label">Tên khuyến mãi</label>
                <input type="text" class="form-control" id="promotionName" required value="${promotion?.name || ''}">
            </div>
            <div class="mb-3">
                <label class="form-label">Mã khuyến mãi</label>
                <input type="text" class="form-control" id="promotionCode" required value="${promotion?.code || ''}"
                    pattern="[A-Za-z0-9]+" title="Chỉ cho phép chữ cái và số, không dấu cách">
            </div>
            <div class="mb-3">
                <label class="form-label">Loại giảm giá</label>
                <select class="form-select" id="promotionType" required>
                    <option value="percentage" ${promotion?.type === 'percentage' ? 'selected' : ''}>Phần trăm</option>
                    <option value="fixed" ${promotion?.type === 'fixed' ? 'selected' : ''}>Số tiền cố định</option>
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">Giá trị giảm</label>
                <input type="number" class="form-control" id="promotionValue" required 
                    min="0" max="100" value="${promotion?.value || ''}">
                <div class="form-text" id="valueHelp">
                    ${promotion?.type === 'fixed' ? 'Nhập số tiền giảm' : 'Nhập phần trăm giảm (0-100)'}
                </div>
            </div>
            <div class="row mb-3">
                <div class="col">
                    <label class="form-label">Ngày bắt đầu</label>
                    <input type="datetime-local" class="form-control" id="promotionStart" required
                        value="${promotion?.startDate ? new Date(promotion.startDate).toISOString().slice(0, 16) : ''}">
                </div>
                <div class="col">
                    <label class="form-label">Ngày kết thúc</label>
                    <input type="datetime-local" class="form-control" id="promotionEnd" required
                        value="${promotion?.endDate ? new Date(promotion.endDate).toISOString().slice(0, 16) : ''}">
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">Điều kiện áp dụng</label>
                <div class="input-group mb-2">
                    <span class="input-group-text">Giá trị tối thiểu</span>
                    <input type="number" class="form-control" id="promotionMinAmount" 
                        value="${promotion?.minAmount || '0'}">
                </div>
                <div class="input-group">
                    <span class="input-group-text">Giảm tối đa</span>
                    <input type="number" class="form-control" id="promotionMaxDiscount"
                        value="${promotion?.maxDiscount || '0'}">
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">Mô tả</label>
                <textarea class="form-control" id="promotionDescription" rows="2">${promotion?.description || ''}</textarea>
            </div>
            <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary">
                    ${promotion ? 'Cập nhật' : 'Thêm'} khuyến mãi
                </button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            </div>
        </form>
    `;

    // Setup type change handler
    document.getElementById('promotionType').addEventListener('change', (e) => {
        const valueInput = document.getElementById('promotionValue');
        const valueHelp = document.getElementById('valueHelp');
        if (e.target.value === 'percentage') {
            valueInput.max = 100;
            valueHelp.textContent = 'Nhập phần trăm giảm (0-100)';
        } else {
            valueInput.removeAttribute('max');
            valueHelp.textContent = 'Nhập số tiền giảm';
        }
    });

    // Setup form submission
    document.getElementById('promotionForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await savePromotion(promotionId);
    });

    // Show modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

async function savePromotion(promotionId) {
    try {
        const promotionData = {
            name: document.getElementById('promotionName').value,
            code: document.getElementById('promotionCode').value.toUpperCase(),
            type: document.getElementById('promotionType').value,
            value: parseFloat(document.getElementById('promotionValue').value),
            startDate: document.getElementById('promotionStart').value,
            endDate: document.getElementById('promotionEnd').value,
            minAmount: parseFloat(document.getElementById('promotionMinAmount').value) || 0,
            maxDiscount: parseFloat(document.getElementById('promotionMaxDiscount').value) || 0,
            description: document.getElementById('promotionDescription').value
        };

        if (promotionId) {
            await axios.put(`/promotions/${promotionId}`, promotionData);
        } else {
            await axios.post('/promotions', promotionData);
        }

        // Reload promotions and close modal
        await loadPromotionsContent();
        bootstrap.Modal.getInstance(document.getElementById('formModal')).hide();
        
        // Show success message
        alert(promotionId ? 'Đã cập nhật khuyến mãi!' : 'Đã thêm khuyến mãi mới!');
    } catch (error) {
        console.error('Error saving promotion:', error);
        alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
}

async function deletePromotion(promotionId) {
    if (!confirm('Bạn có chắc muốn xóa khuyến mãi này?')) {
        return;
    }

    try {
        await axios.delete(`/promotions/${promotionId}`);
        await loadPromotionsContent();
        alert('Đã xóa khuyến mãi!');
    } catch (error) {
        console.error('Error deleting promotion:', error);
        alert('Có lỗi xảy ra khi xóa khuyến mãi. Vui lòng thử lại.');
    }
}