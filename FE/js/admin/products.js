let products = [];
let categories = [];

async function loadProductsContent() {
    const contentDiv = document.getElementById('mainContent');
    
    try {
        // Load categories for filter
        const categoriesResponse = await axios.get('/categories');
        categories = categoriesResponse.data;

        // Load products
        const productsResponse = await axios.get('/products');
        products = productsResponse.data;

        contentDiv.innerHTML = `
            <div class="d-flex justify-content-between mb-3">
                <div class="d-flex gap-2">
                    <input type="text" class="form-control" id="searchProduct" placeholder="Tìm sản phẩm...">
                    <select class="form-select" id="categoryFilter">
                        <option value="">Tất cả danh mục</option>
                        ${categories.map(cat => `
                            <option value="${cat._id}">${cat.name}</option>
                        `).join('')}
                    </select>
                </div>
                <button class="btn btn-primary" onclick="showProductForm()">
                    <i class="bi bi-plus"></i> Thêm sản phẩm
                </button>
            </div>

            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Tên sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Giá</th>
                            <th>Tồn kho</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="productsTableBody">
                        ${renderProductsTable()}
                    </tbody>
                </table>
            </div>
        `;

        // Setup event listeners
        setupProductEventListeners();
    } catch (error) {
        console.error('Error loading products:', error);
        contentDiv.innerHTML = '<div class="alert alert-danger">Có lỗi xảy ra khi tải dữ liệu sản phẩm. Vui lòng thử lại.</div>';
    }
}

function renderProductsTable() {
    return products.map(product => {
        const category = categories.find(c => c._id === product.category);
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
                <td>${category ? category.name : ''}</td>
                <td>${product.price.toLocaleString()}đ</td>
                <td>${product.stock || 0}</td>
                <td>
                    <span class="badge ${product.active ? 'bg-success' : 'bg-secondary'}">
                        ${product.active ? 'Đang bán' : 'Ngừng bán'}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="showProductForm('${product._id}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteProduct('${product._id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function setupProductEventListeners() {
    // Search products
    document.getElementById('searchProduct').addEventListener('input', filterProducts);
    
    // Filter by category
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
}

function filterProducts() {
    const search = document.getElementById('searchProduct').value.toLowerCase();
    const categoryId = document.getElementById('categoryFilter').value;
    
    const filtered = products.filter(product => {
        const matchesSearch = !search || 
            product.name.toLowerCase().includes(search) ||
            (product.code && product.code.toLowerCase().includes(search));
        const matchesCategory = !categoryId || product.category === categoryId;
        return matchesSearch && matchesCategory;
    });

    products = filtered;
    document.getElementById('productsTableBody').innerHTML = renderProductsTable();
}

function showProductForm(productId = null) {
    const product = productId ? products.find(p => p._id === productId) : null;
    const modal = document.getElementById('formModal');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');

    modalTitle.textContent = product ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới';
    modalBody.innerHTML = `
        <form id="productForm">
            <div class="mb-3">
                <label class="form-label">Tên sản phẩm</label>
                <input type="text" class="form-control" id="productName" required value="${product?.name || ''}">
            </div>
            <div class="mb-3">
                <label class="form-label">Mã sản phẩm</label>
                <input type="text" class="form-control" id="productCode" value="${product?.code || ''}">
            </div>
            <div class="mb-3">
                <label class="form-label">Danh mục</label>
                <select class="form-select" id="productCategory" required>
                    <option value="">Chọn danh mục</option>
                    ${categories.map(cat => `
                        <option value="${cat._id}" ${product?.category === cat._id ? 'selected' : ''}>
                            ${cat.name}
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">Giá</label>
                <input type="number" class="form-control" id="productPrice" required value="${product?.price || ''}">
            </div>
            <div class="mb-3">
                <label class="form-label">Hình ảnh URL</label>
                <input type="url" class="form-control" id="productImage" value="${product?.image || ''}">
            </div>
            <div class="mb-3">
                <label class="form-label">Mô tả</label>
                <textarea class="form-control" id="productDescription" rows="3">${product?.description || ''}</textarea>
            </div>
            <div class="form-check mb-3">
                <input type="checkbox" class="form-check-input" id="productActive" ${product?.active ? 'checked' : ''}>
                <label class="form-check-label">Đang bán</label>
            </div>
            <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary">
                    ${product ? 'Cập nhật' : 'Thêm'} sản phẩm
                </button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            </div>
        </form>
    `;

    // Setup form submission
    document.getElementById('productForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProduct(productId);
    });

    // Show modal
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
}

async function saveProduct(productId) {
    try {
        const productData = {
            name: document.getElementById('productName').value,
            code: document.getElementById('productCode').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            image: document.getElementById('productImage').value,
            description: document.getElementById('productDescription').value,
            active: document.getElementById('productActive').checked
        };

        if (productId) {
            await axios.put(`/products/${productId}`, productData);
        } else {
            await axios.post('/products', productData);
        }

        // Reload products and close modal
        await loadProductsContent();
        bootstrap.Modal.getInstance(document.getElementById('formModal')).hide();
        
        // Show success message
        alert(productId ? 'Sản phẩm đã được cập nhật!' : 'Sản phẩm đã được thêm!');
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Có lỗi xảy ra khi lưu sản phẩm. Vui lòng thử lại.');
    }
}

async function deleteProduct(productId) {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
        return;
    }

    try {
        await axios.delete(`/products/${productId}`);
        await loadProductsContent();
        alert('Sản phẩm đã được xóa!');
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Có lỗi xảy ra khi xóa sản phẩm. Vui lòng thử lại.');
    }
}