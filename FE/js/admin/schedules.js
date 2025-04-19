let schedules = [];
let staff = [];
let shifts = [];

async function loadSchedulesContent() {
    const contentDiv = document.getElementById('mainContent');
    
    try {
        // Load all necessary data
        const [schedulesResponse, staffResponse, shiftsResponse] = await Promise.all([
            axios.get('/schedules'),
            axios.get('/users/staff'),
            axios.get('/shifts')
        ]);
        
        schedules = schedulesResponse.data;
        staff = staffResponse.data;
        shifts = shiftsResponse.data;

        // Get the current week's dates
        const weekDates = getWeekDates();

        contentDiv.innerHTML = `
            <div class="d-flex justify-content-between mb-3">
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-secondary" onclick="changeWeek(-1)">
                        <i class="bi bi-chevron-left"></i>
                    </button>
                    <div class="btn-group">
                        <button class="btn btn-outline-primary" id="weekDisplay"></button>
                        <button class="btn btn-outline-primary" onclick="goToCurrentWeek()">Tuần này</button>
                    </div>
                    <button class="btn btn-outline-secondary" onclick="changeWeek(1)">
                        <i class="bi bi-chevron-right"></i>
                    </button>
                </div>
                <button class="btn btn-primary" onclick="showScheduleForm()">
                    <i class="bi bi-plus"></i> Thêm ca làm việc
                </button>
            </div>

            <div class="table-responsive">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th style="min-width: 150px;">Nhân viên</th>
                            ${weekDates.map(date => `
                                <th style="min-width: 130px;">
                                    ${date.toLocaleDateString('vi-VN', { weekday: 'short' })}<br>
                                    ${date.toLocaleDateString('vi-VN')}
                                </th>
                            `).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${renderScheduleTable(weekDates)}
                    </tbody>
                </table>
            </div>
        `;

        updateWeekDisplay();
        setupScheduleEventListeners();
    } catch (error) {
        console.error('Error loading schedules:', error);
        contentDiv.innerHTML = '<div class="alert alert-danger">Có lỗi xảy ra khi tải lịch làm việc. Vui lòng thử lại.</div>';
    }
}

function getWeekDates(date = new Date()) {
    const curr = new Date(date);
    const week = [];
    
    // Start from Monday
    curr.setDate(curr.getDate() - curr.getDay() + 1);
    
    for (let i = 0; i < 7; i++) {
        week.push(new Date(curr));
        curr.setDate(curr.getDate() + 1);
    }
    
    return week;
}

function renderScheduleTable(weekDates) {
    return staff.map(employee => `
        <tr>
            <td>
                <div class="fw-bold">${employee.name}</div>
                <small class="text-muted">${employee.role}</small>
            </td>
            ${weekDates.map(date => {
                const daySchedules = schedules.filter(s => 
                    s.userId === employee._id && 
                    new Date(s.date).toDateString() === date.toDateString()
                );
                
                return `
                    <td class="position-relative ${isToday(date) ? 'bg-light' : ''}">
                        ${daySchedules.map(schedule => {
                            const shift = shifts.find(s => s._id === schedule.shiftId);
                            return `
                                <div class="p-1 mb-1 rounded bg-info bg-opacity-10">
                                    <small>${shift.name}</small>
                                    <br>
                                    <small class="text-muted">
                                        ${shift.startTime} - ${shift.endTime}
                                    </small>
                                    <button class="btn btn-sm btn-link text-danger position-absolute top-0 end-0" 
                                            onclick="deleteSchedule('${schedule._id}')">
                                        <i class="bi bi-x"></i>
                                    </button>
                                </div>
                            `;
                        }).join('') || `
                            <button class="btn btn-sm btn-link w-100" 
                                    onclick="showScheduleForm(null, '${employee._id}', '${date.toISOString()}')">
                                <i class="bi bi-plus"></i>
                            </button>
                        `}
                    </td>
                `;
            }).join('')}
        </tr>
    `).join('');
}

function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

let currentWeekOffset = 0;

function changeWeek(offset) {
    currentWeekOffset += offset;
    const date = new Date();
    date.setDate(date.getDate() + (currentWeekOffset * 7));
    const weekDates = getWeekDates(date);
    document.querySelector('tbody').innerHTML = renderScheduleTable(weekDates);
    updateWeekDisplay();
}

function goToCurrentWeek() {
    currentWeekOffset = 0;
    const weekDates = getWeekDates();
    document.querySelector('tbody').innerHTML = renderScheduleTable(weekDates);
    updateWeekDisplay();
}

function updateWeekDisplay() {
    const date = new Date();
    date.setDate(date.getDate() + (currentWeekOffset * 7));
    const weekDates = getWeekDates(date);
    const startDate = weekDates[0].toLocaleDateString('vi-VN');
    const endDate = weekDates[6].toLocaleDateString('vi-VN');
    document.getElementById('weekDisplay').textContent = `${startDate} - ${endDate}`;
}

function showScheduleForm(scheduleId = null, presetUserId = null, presetDate = null) {
    const schedule = scheduleId ? schedules.find(s => s._id === scheduleId) : null;
    const modal = document.getElementById('formModal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');

    modalTitle.textContent = schedule ? 'Sửa ca làm việc' : 'Thêm ca làm việc';
    modalBody.innerHTML = `
        <form id="scheduleForm">
            <div class="mb-3">
                <label class="form-label">Nhân viên</label>
                <select class="form-select" id="scheduleUser" required>
                    <option value="">Chọn nhân viên</option>
                    ${staff.map(employee => `
                        <option value="${employee._id}" 
                            ${(schedule?.userId || presetUserId) === employee._id ? 'selected' : ''}>
                            ${employee.name}
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">Ngày</label>
                <input type="date" class="form-control" id="scheduleDate" required 
                    value="${schedule ? schedule.date.split('T')[0] : 
                           presetDate ? new Date(presetDate).toISOString().split('T')[0] : 
                           new Date().toISOString().split('T')[0]}">
            </div>
            <div class="mb-3">
                <label class="form-label">Ca làm việc</label>
                <select class="form-select" id="scheduleShift" required>
                    <option value="">Chọn ca</option>
                    ${shifts.map(shift => `
                        <option value="${shift._id}" ${schedule?.shiftId === shift._id ? 'selected' : ''}>
                            ${shift.name} (${shift.startTime} - ${shift.endTime})
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">Ghi chú</label>
                <textarea class="form-control" id="scheduleNote" rows="2">${schedule?.note || ''}</textarea>
            </div>
            <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary">
                    ${schedule ? 'Cập nhật' : 'Thêm'} ca làm việc
                </button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            </div>
        </form>
    `;

    // Setup form submission
    document.getElementById('scheduleForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSchedule(scheduleId);
    });

    // Show modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

async function saveSchedule(scheduleId) {
    try {
        const scheduleData = {
            userId: document.getElementById('scheduleUser').value,
            date: document.getElementById('scheduleDate').value,
            shiftId: document.getElementById('scheduleShift').value,
            note: document.getElementById('scheduleNote').value
        };

        if (scheduleId) {
            await axios.put(`/schedules/${scheduleId}`, scheduleData);
        } else {
            await axios.post('/schedules', scheduleData);
        }

        // Reload schedules and close modal
        await loadSchedulesContent();
        bootstrap.Modal.getInstance(document.getElementById('formModal')).hide();
        
        // Show success message
        alert(scheduleId ? 'Đã cập nhật ca làm việc!' : 'Đã thêm ca làm việc!');
    } catch (error) {
        console.error('Error saving schedule:', error);
        alert('Có lỗi xảy ra. Vui lòng thử lại.');
    }
}

async function deleteSchedule(scheduleId) {
    if (!confirm('Bạn có chắc muốn xóa ca làm việc này?')) {
        return;
    }

    try {
        await axios.delete(`/schedules/${scheduleId}`);
        await loadSchedulesContent();
        alert('Đã xóa ca làm việc!');
    } catch (error) {
        console.error('Error deleting schedule:', error);
        alert('Có lỗi xảy ra khi xóa ca làm việc. Vui lòng thử lại.');
    }
}

function setupScheduleEventListeners() {
    // Add any additional event listeners here
}