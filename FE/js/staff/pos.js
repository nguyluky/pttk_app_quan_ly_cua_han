// State management
let state = {
    products: [],
    categories: [],
    tables: [],
    cart: [],
    selectedTable: null,
    appliedCoupon: null
};

// Initialize the POS system
document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        loadProducts(),
        loadCategories(),
        loadTables()
    ]);
    
    setupEventListeners();
    updateUI();
});

// Load data from API
async function loadProducts() {
    try {
        const response = await axios.get('/api/products');
        state.products = response.data;
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Không thể tải danh sách sản phẩm');
    }
}

async function loadCategories() {
    try {
        const response = await axios.get('/api/categories');
        state.categories = response.data;
        renderCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
        alert('Không thể tải danh mục sản phẩm');
    }
}

async function loadTables() {
    try {
        const response = await axios.get('/api/tables');
        state.tables = response.data;
        renderTables();
    } catch (error) {
        console.error('Error loading tables:', error);
        alert('Không thể tải danh sách bàn');
    }
}

// Render functions
function renderProducts(filter = '') {
    const productGrid = document.getElementById('productGrid');
    const filteredProducts = state.products.filter(product => 
        product.name.toLowerCase().includes(filter.toLowerCase()) ||
        product.code.toLowerCase().includes(filter.toLowerCase())
    );

    productGrid.innerHTML = filteredProducts.map(product => `
        <div class="col-md-3 col-sm-6">
            <div class="card h-100" onclick="addToCart('${product._id}')">
                <img src="${product.image || '../public/default-product.png'}" 
                    class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h6 class="card-title mb-1">${product.name}</h6>
                    <p class="card-text text-primary mb-0">
                        ${utils.formatCurrency(product.price)}
                    </p>
                    <small class="text-muted">
                        Còn ${product.quantity} ${product.unit}
                    </small>
                </div>
            </div>
        </div>
    `).join('');
}

function renderCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = `
        <option value="">Tất cả danh mục</option>
        ${state.categories.map(category => `
            <option value="${category._id}">${category.name}</option>
        `).join('')}
    `;
}

function renderTables() {
    const tableSelect = document.getElementById('tableSelect');
    tableSelect.innerHTML = `
        <option value="">Chọn bàn</option>
        ${state.tables.map(table => `
            <option value="${table._id}">${table.name}</option>
        `).join('')}
    `;
}

function renderCart() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = state.cart.map(item => `
        <div class="card mb-2">
            <div class="card-body p-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-0">${item.name}</h6>
                        <small class="text-muted">
                            ${utils.formatCurrency(item.price)} x ${item.quantity}
                        </small>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <span class="text-primary fw-bold">
                            ${utils.formatCurrency(item.price * item.quantity)}
                        </span>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" 
                                onclick="updateCartItem('${item._id}', ${item.quantity - 1})">
                                <i class="bi bi-dash"></i>
                            </button>
                            <button class="btn btn-outline-primary" 
                                onclick="updateCartItem('${item._id}', ${item.quantity + 1})">
                                <i class="bi bi-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    updateTotals();
}

// Cart operations
function addToCart(productId) {
    const product = state.products.find(p => p._id === productId);
    if (!product) return;

    const existingItem = state.cart.find(item => item._id === productId);
    if (existingItem) {
        updateCartItem(productId, existingItem.quantity + 1);
    } else {
        state.cart.push({
            _id: product._id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
        renderCart();
    }
}

function updateCartItem(productId, newQuantity) {
    if (newQuantity <= 0) {
        state.cart = state.cart.filter(item => item._id !== productId);
    } else {
        const product = state.products.find(p => p._id === productId);
        if (!product || newQuantity > product.quantity) {
            alert('Số lượng vượt quá tồn kho');
            return;
        }
        
        const item = state.cart.find(item => item._id === productId);
        if (item) {
            item.quantity = newQuantity;
        }
    }
    renderCart();
}

function clearCart() {
    state.cart = [];
    state.appliedCoupon = null;
    document.getElementById('couponCode').value = '';
    renderCart();
}

// Payment processing
async function processPayment() {
    if (state.cart.length === 0) {
        alert('Vui lòng chọn sản phẩm trước khi thanh toán');
        return;
    }

    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    document.getElementById('paymentTotal').value = utils.formatCurrency(calculateTotal());
    paymentModal.show();
}

async function confirmPayment() {
    try {
        utils.showLoading();
        
        const paymentMethod = document.getElementById('paymentMethod').value;
        const order = {
            items: state.cart,
            tableId: state.selectedTable,
            couponCode: state.appliedCoupon,
            note: document.getElementById('orderNote').value,
            paymentMethod,
            total: calculateTotal()
        };

        if (paymentMethod === 'cash') {
            const cashReceived = parseFloat(document.getElementById('cashReceived').value);
            if (isNaN(cashReceived) || cashReceived < order.total) {
                alert('Số tiền không hợp lệ');
                return;
            }
            order.cashReceived = cashReceived;
            order.changeAmount = cashReceived - order.total;
        }

        const response = await axios.post('/api/orders', order);
        
        // Print receipt
        await printReceipt(response.data);
        
        // Clear cart and close modal
        clearCart();
        bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
        
        alert('Thanh toán thành công!');
    } catch (error) {
        console.error('Payment error:', error);
        alert('Có lỗi xảy ra khi thanh toán');
    } finally {
        utils.hideLoading();
    }
}

// Event listeners
function setupEventListeners() {
    // Search products
    document.getElementById('searchProduct').addEventListener('input', (e) => {
        renderProducts(e.target.value);
    });

    // Filter by category
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
        const categoryId = e.target.value;
        state.products = state.products.filter(product => 
            !categoryId || product.categoryId === categoryId
        );
        renderProducts();
    });

    // Table selection
    document.getElementById('tableSelect').addEventListener('change', (e) => {
        state.selectedTable = e.target.value;
    });

    // Apply coupon
    document.getElementById('couponCode').addEventListener('change', async (e) => {
        const code = e.target.value.trim();
        if (!code) {
            state.appliedCoupon = null;
            renderCart();
            return;
        }

        try {
            const response = await axios.post('/api/coupons/validate', { code });
            state.appliedCoupon = response.data;
            renderCart();
        } catch (error) {
            console.error('Coupon error:', error);
            alert('Mã giảm giá không hợp lệ');
            e.target.value = '';
            state.appliedCoupon = null;
            renderCart();
        }
    });

    // Clear cart
    document.getElementById('btnClearCart').addEventListener('click', () => {
        if (confirm('Xóa tất cả sản phẩm khỏi giỏ hàng?')) {
            clearCart();
        }
    });

    // Save order
    document.getElementById('btnSaveOrder').addEventListener('click', async () => {
        try {
            if (state.cart.length === 0) {
                alert('Vui lòng chọn sản phẩm trước khi lưu đơn');
                return;
            }

            utils.showLoading();
            
            const order = {
                items: state.cart,
                tableId: state.selectedTable,
                couponCode: state.appliedCoupon,
                note: document.getElementById('orderNote').value,
                status: 'pending'
            };

            await axios.post('/api/orders', order);
            clearCart();
            alert('Đã lưu đơn hàng thành công!');
        } catch (error) {
            console.error('Save order error:', error);
            alert('Có lỗi xảy ra khi lưu đơn hàng');
        } finally {
            utils.hideLoading();
        }
    });

    // Payment
    document.getElementById('btnPayment').addEventListener('click', processPayment);
    document.getElementById('btnConfirmPayment').addEventListener('click', confirmPayment);
    
    // Calculate change amount
    document.getElementById('cashReceived').addEventListener('input', (e) => {
        const cashReceived = parseFloat(e.target.value);
        const total = calculateTotal();
        const change = cashReceived >= total ? cashReceived - total : 0;
        document.getElementById('changeAmount').textContent = 
            `Tiền thừa: ${utils.formatCurrency(change)}`;
    });

    // Toggle cash payment fields
    document.getElementById('paymentMethod').addEventListener('change', (e) => {
        const cashPaymentGroup = document.getElementById('cashPaymentGroup');
        cashPaymentGroup.style.display = e.target.value === 'cash' ? 'block' : 'none';
    });
}

// Utility functions
function calculateTotal() {
    const subtotal = state.cart.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
    );

    let discount = 0;
    if (state.appliedCoupon) {
        if (state.appliedCoupon.type === 'percentage') {
            discount = subtotal * (state.appliedCoupon.value / 100);
        } else {
            discount = state.appliedCoupon.value;
        }
    }

    return Math.max(subtotal - discount, 0);
}

function updateTotals() {
    const subtotal = state.cart.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
    );

    let discount = 0;
    if (state.appliedCoupon) {
        if (state.appliedCoupon.type === 'percentage') {
            discount = subtotal * (state.appliedCoupon.value / 100);
        } else {
            discount = state.appliedCoupon.value;
        }
    }

    const total = Math.max(subtotal - discount, 0);

    document.getElementById('subtotal').textContent = utils.formatCurrency(subtotal);
    document.getElementById('discount').textContent = 
        discount > 0 ? `-${utils.formatCurrency(discount)}` : '-0đ';
    document.getElementById('total').textContent = utils.formatCurrency(total);
}

async function printReceipt(order) {
    // Create receipt content
    const receiptWindow = window.open('', '_blank');
    
    receiptWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Hóa đơn</title>
            <style>
                body { font-family: monospace; line-height: 1.5; }
                .text-center { text-align: center; }
                .mb-1 { margin-bottom: 10px; }
                .divider { border-top: 1px dashed #000; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="text-center mb-1">
                <h3>HÓA ĐƠN BÁN HÀNG</h3>
                <p>${new Date().toLocaleString('vi-VN')}</p>
            </div>

            <div class="divider"></div>

            <div>
                ${order.items.map(item => `
                    <div>
                        ${item.name}<br>
                        ${item.quantity} x ${utils.formatCurrency(item.price)} = ${utils.formatCurrency(item.price * item.quantity)}
                    </div>
                `).join('<br>')}
            </div>

            <div class="divider"></div>

            <div>
                <div>Tạm tính: ${utils.formatCurrency(order.subtotal)}</div>
                ${order.discount > 0 ? 
                    `<div>Giảm giá: -${utils.formatCurrency(order.discount)}</div>` : 
                    ''}
                <div><strong>Tổng cộng: ${utils.formatCurrency(order.total)}</strong></div>
                ${order.paymentMethod === 'cash' ? `
                    <div>Tiền khách đưa: ${utils.formatCurrency(order.cashReceived)}</div>
                    <div>Tiền thừa: ${utils.formatCurrency(order.changeAmount)}</div>
                ` : ''}
            </div>

            <div class="divider"></div>

            <div class="text-center">
                <p>Cảm ơn quý khách và hẹn gặp lại!</p>
            </div>
        </body>
        </html>
    `);

    receiptWindow.document.close();
    receiptWindow.print();
}