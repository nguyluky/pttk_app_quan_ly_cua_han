let categories = [];

async function loadCategoriesContent() {
    const contentDiv = document.getElementById('mainContent');
    
    try {
        // Load categories
        const response = await axios.get('/categories');
        categories = response.data;

        contentDiv.innerHTML = `
            <div class="d-flex justify-content-between mb-3">
                <input type="text" class="form-control w-25" id="searchCategory" placeholder="Tìm danh mục...">
                <button class="btn btn-primary" onclick="showCategoryForm()">
                    <i class="bi bi-plus"></i> Thêm danh mục
                </button>
            </div>

            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Tên danh mục</th>
                            <th>Mô tả</th>
                            <th>Số sản phẩm</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="categoriesTableBody">
                        ${renderCategoriesTable()}
                    </tbody>
                </table>
            </div>
        `;

        // Setup event listeners
        setupCategoryEventListeners();
    } catch (error) {
        console.error('Error loading categories:', error);
        contentDiv.innerHTML = '<div class="alert alert-danger">Có lỗi xảy ra khi tải dữ liệu danh mục. Vui lòng thử lại.</div>';
    }
}

function renderCategoriesTable() {
    return categories.map(category => `
        <tr>
            <td>${category.name}</td>
            <td>${category.description || ''}</td>
            <td>${category.productCount || 0}</td>
            <td>
                <span class="badge ${category.active ? 'bg-success' : 'bg-secondary'}">
                    ${category.active ? 'Đang dùng' : 'Đã ẩn'}
                </span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="showCategoryForm('${category._id}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteCategory('${category._id}')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function setupCategoryEventListeners() {
    // Search categories
    document.getElementById('searchCategory').addEventListener('input', (e) => {
        const search = e.target.value.toLowerCase();
        const filtered = categories.filter(category => 
            category.name.toLowerCase().includes(search) ||
            (category.description && category.description.toLowerCase().includes(search))
        );
        document.getElementById('categoriesTableBody').innerHTML = filtered.map(category => `
            <tr>
                <td>${category.name}</td>
                <td>${category.description || ''}</td>
                <td>${category.productCount || 0}</td>
                <td>
                    <span class="badge ${category.active ? 'bg-success' : 'bg-secondary'}">
                        ${category.active ? 'Đang dùng' : 'Đã ẩn'}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="showCategoryForm('${category._id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteCategory('${category._id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    });
}

function showCategoryForm(categoryId = null) {
    const category = categoryId ? categories.find(c => c._id === categoryId) : null;
    const modal = document.getElementById('formModal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');

    modalTitle.textContent = category ? 'Sửa danh mục' : 'Thêm danh mục mới';
    modalBody.innerHTML = `
        <form id="categoryForm">
            <div class="mb-3">
                <label class="form-label">Tên danh mục</label>
                <input type="text" class="form-control" id="categoryName" required value="${category?.name || ''}">
            </div>
            <div class="mb-3">
                <label class="form-label">Mô tả</label>
                <textarea class="form-control" id="categoryDescription" rows="3">${category?.description || ''}</textarea>
            </div>
            <div class="form-check mb-3">
                <input type="checkbox" class="form-check-input" id="categoryActive" ${category?.active ? 'checked' : ''}>
                <label class="form-check-label">Đang sử dụng</label>
            </div>
            <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary">
                    ${category ? 'Cập nhật' : 'Thêm'} danh mục
                </button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            </div>
        </form>
    `;

    // Setup form submission
    document.getElementById('categoryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveCategory(categoryId);
    });

    // Show modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

async function saveCategory(categoryId) {
    try {
        const categoryData = {
            name: document.getElementById('categoryName').value,
            description: document.getElementById('categoryDescription').value,
            active: document.getElementById('categoryActive').checked
        };

        if (categoryId) {
            await axios.put(`/categories/${categoryId}`, categoryData);
        } else {
            await axios.post('/categories', categoryData);
        }

        // Reload categories and close modal
        await loadCategoriesContent();
        bootstrap.Modal.getInstance(document.getElementById('formModal')).hide();
        
        // Show success message
        alert(categoryId ? 'Danh mục đã được cập nhật!' : 'Danh mục đã được thêm!');
    } catch (error) {
        console.error('Error saving category:', error);
        alert('Có lỗi xảy ra khi lưu danh mục. Vui lòng thử lại.');
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Bạn có chắc muốn xóa danh mục này? Điều này có thể ảnh hưởng đến các sản phẩm trong danh mục.')) {
        return;
    }

    try {
        await axios.delete(`/categories/${categoryId}`);
        await loadCategoriesContent();
        alert('Danh mục đã được xóa!');
    } catch (error) {
        console.error('Error deleting category:', error);
        alert('Có lỗi xảy ra khi xóa danh mục. Vui lòng thử lại.');
    }
}