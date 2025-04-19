let staff = [];
let shifts = [];

async function loadStaffContent() {
    const contentDiv = document.getElementById('mainContent');
    
    try {
        // Load staff and shifts data
        const [staffResponse, shiftsResponse] = await Promise.all([
            axios.get('/users/staff'),
            axios.get('/shifts')
        ]);
        
        staff = staffResponse.data;
        shifts = shiftsResponse.data;

        contentDiv.innerHTML = `
            <div class="d-flex justify-content-between mb-3">
                <div class="d-flex gap-2">
                    <input type="text" class="form-control" id="searchStaff" placeholder="Tìm nhân viên...">
                    <select class="form-select" id="roleFilter">
                        <option value="all">Tất cả vai trò</option>
                        <option value="manager">Quản lý</option>
                        <option value="staff">Nhân viên</option>
                    </select>
                </div>
                <button class="btn btn-primary" onclick="showStaffForm()">
                    <i class="bi bi-plus"></i> Thêm nhân viên
                </button>
            </div>

            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Nhân viên</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Ca làm việc</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="staffTableBody">
                        ${renderStaffTable()}
                    </tbody>
                </table>
            </div>
        `;

        setupStaffEventListeners();
    } catch (error) {
        console.error('Error loading staff:', error);
        contentDiv.innerHTML = '<div class="alert alert-danger">Có lỗi xảy ra khi tải dữ liệu nhân viên. Vui lòng thử lại.</div>';
    }
}

function renderStaffTable(filter = '') {
    let filteredStaff = staff;
    
    // Apply search filter
    if (filter) {
        filteredStaff = staff.filter(employee => 
            employee.name.toLowerCase().includes(filter.toLowerCase()) ||
            employee.email.toLowerCase().includes(filter.toLowerCase())
        );
    }

    // Apply role filter
    const roleFilter = document.getElementById('roleFilter')?.value;
    if (roleFilter && roleFilter !== 'all') {
        filteredStaff = filteredStaff.filter(employee => employee.role === roleFilter);
    }

    return filteredStaff.map(employee => `
        <tr>
            <td>
                <div class="d-flex align-items-center gap-2">
                    <div class="rounded-circle bg-secondary bg-opacity-10 p-2">
                        <i class="bi bi-person"></i>
                    </div>
                    <div>
                        <div class="fw-bold">${employee.name}</div>
                        <small class="text-muted">ID: ${employee._id.slice(-6)}</small>
                    </div>
                </div>
            </td>
            <td>${employee.email}</td>
            <td>
                <span class="badge ${employee.role === 'manager' ? 'bg-info' : 'bg-secondary'}">
                    ${employee.role === 'manager' ? 'Quản lý' : 'Nhân viên'}
                </span>
            </td>
            <td>
                ${employee.defaultShifts?.map(shiftId => {
                    const shift = shifts.find(s => s._id === shiftId);
                    return shift ? `<span class="badge bg-light text-dark me-1">${shift.name}</span>` : '';
                }).join('') || ''}
            </td>
            <td>
                <span class="badge ${employee.active ? 'bg-success' : 'bg-secondary'}">
                    ${employee.active ? 'Đang làm việc' : 'Đã nghỉ việc'}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="showStaffForm('${employee._id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteStaff('${employee._id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function setupStaffEventListeners() {
    // Search staff
    document.getElementById('searchStaff').addEventListener('input', (e) => {
        document.getElementById('staffTableBody').innerHTML = renderStaffTable(e.target.value);
    });

    // Filter by role
    document.getElementById('roleFilter').addEventListener('change', () => {
        document.getElementById('staffTableBody').innerHTML = renderStaffTable(
            document.getElementById('searchStaff').value
        );
    });
}

function showStaffForm(staffId = null) {
    const employee = staffId ? staff.find(s => s._id === staffId) : null;
    const modal = document.getElementById('formModal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');

    modalTitle.textContent = employee ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới';
    modalBody.innerHTML = `
        <form id="staffForm">
            <div class="mb-3">
                <label class="form-label">Họ tên</label>
                <input type="text" class="form-control" id="staffName" required value="${employee?.name || ''}">
            </div>
            <div class="mb-3">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" id="staffEmail" required value="${employee?.email || ''}">
            </div>
            ${!employee ? `
                <div class="mb-3">
                    <label class="form-label">Mật khẩu</label>
                    <input type="password" class="form-control" id="staffPassword" required>
                </div>
            ` : ''}
            <div class="mb-3">
                <label class="form-label">Vai trò</label>
                <select class="form-select" id="staffRole" required>
                    <option value="staff" ${employee?.role === 'staff' ? 'selected' : ''}>Nhân viên</option>
                    <option value="manager" ${employee?.role === 'manager' ? 'selected' : ''}>Quản lý</option>
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">Ca làm việc mặc định</label>
                <div class="row g-2">
                    ${shifts.map(shift => `
                        <div class="col-md-6">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" 
                                    value="${shift._id}" id="shift${shift._id}"
                                    ${employee?.defaultShifts?.includes(shift._id) ? 'checked' : ''}>
                                <label class="form-check-label" for="shift${shift._id}">
                                    ${shift.name} (${shift.startTime} - ${shift.endTime})
                                </label>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="form-check mb-3">
                <input type="checkbox" class="form-check-input" id="staffActive" 
                    ${employee?.active ?? true ? 'checked' : ''}>
                <label class="form-check-label">Đang làm việc</label>
            </div>
            <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary">
                    ${employee ? 'Cập nhật' : 'Thêm'} nhân viên
                </button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            </div>
        </form>
    `;

    // Setup form submission
    document.getElementById('staffForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveStaff(staffId);
    });

    // Show modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

async function saveStaff(staffId) {
    try {
        const staffData = {
            name: document.getElementById('staffName').value,
            email: document.getElementById('staffEmail').value,
            role: document.getElementById('staffRole').value,
            active: document.getElementById('staffActive').checked,
            defaultShifts: Array.from(document.querySelectorAll('input[type="checkbox"][id^="shift"]:checked'))
                .map(cb => cb.value)
        };

        if (!staffId) {
            staffData.password = document.getElementById('staffPassword').value;
        }

        if (staffId) {
            await axios.put(`/users/${staffId}`, staffData);
        } else {
            await axios.post('/users', staffData);
        }

        // Reload staff and close modal
        await loadStaffContent();
        bootstrap.Modal.getInstance(document.getElementById('formModal')).hide();
        
        // Show success message
        alert(staffId ? 'Đã cập nhật thông tin nhân viên!' : 'Đã thêm nhân viên mới!');
    } catch (error) {
        console.error('Error saving staff:', error);
        alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
}

async function deleteStaff(staffId) {
    if (!confirm('Bạn có chắc muốn xóa nhân viên này?')) {
        return;
    }

    try {
        await axios.delete(`/users/${staffId}`);
        await loadStaffContent();
        alert('Đã xóa nhân viên!');
    } catch (error) {
        console.error('Error deleting staff:', error);
        alert('Có lỗi xảy ra khi xóa nhân viên. Vui lòng thử lại.');
    }
}