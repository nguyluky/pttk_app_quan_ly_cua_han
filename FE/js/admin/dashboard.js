let currentPage = 'dashboard';

// Initialize dashboard
async function initializeDashboard() {
    try {
        // Load user info
        const user = JSON.parse(localStorage.getItem('user'));
        document.getElementById('userName').textContent = user.name;

        // Set up navigation
        setupNavigation();
        
        // Load initial dashboard content
        await loadDashboardContent();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        alert('Có lỗi khi tải dữ liệu. Vui lòng thử lại.');
    }
}

function setupNavigation() {
    // Handle navigation clicks
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const page = e.target.closest('.nav-link').dataset.page;
            await changePage(page);
        });
    });

    // Handle logout
    document.getElementById('btnLogout').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    });
}

async function changePage(page) {
    // Update active state
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-page="${page}"]`).classList.add('active');

    // Update page title
    const titles = {
        dashboard: 'Tổng quan',
        products: 'Quản lý sản phẩm',
        categories: 'Quản lý danh mục',
        inventory: 'Quản lý kho hàng',
        orders: 'Quản lý đơn hàng',
        promotions: 'Quản lý khuyến mãi',
        staff: 'Quản lý nhân viên',
        schedules: 'Lịch làm việc'
    };
    document.getElementById('pageTitle').textContent = titles[page];

    // Load page content
    currentPage = page;
    await loadPageContent(page);
}

async function loadPageContent(page) {
    const contentDiv = document.getElementById('mainContent');
    contentDiv.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

    try {
        switch (page) {
            case 'dashboard':
                await loadDashboardContent();
                break;
            case 'products':
                await loadProductsContent();
                break;
            case 'categories':
                await loadCategoriesContent();
                break;
            case 'inventory':
                await loadInventoryContent();
                break;
            case 'orders':
                await loadOrdersContent();
                break;
            case 'promotions':
                await loadPromotionsContent();
                break;
            case 'staff':
                await loadStaffContent();
                break;
            case 'schedules':
                await loadSchedulesContent();
                break;
        }
    } catch (error) {
        console.error('Error loading page content:', error);
        contentDiv.innerHTML = '<div class="alert alert-danger">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.</div>';
    }
}

async function loadDashboardContent() {
    const contentDiv = document.getElementById('mainContent');
    
    try {
        // Load summary data
        const [orderStats, revenueStats, inventoryStats] = await Promise.all([
            axios.get('/orders/stats'),
            axios.get('/orders/revenue'),
            axios.get('/inventory/stats')
        ]);

        contentDiv.innerHTML = `
            <div class="row g-3 mb-4">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Đơn hàng hôm nay</h5>
                            <p class="card-text display-6">${orderStats.data.today}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Doanh thu hôm nay</h5>
                            <p class="card-text display-6">${revenueStats.data.today.toLocaleString()}đ</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Sản phẩm sắp hết</h5>
                            <p class="card-text display-6">${inventoryStats.data.lowStock}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-8">
                    <div class="card mb-4">
                        <div class="card-body">
                            <h5 class="card-title">Biểu đồ doanh thu</h5>
                            <canvas id="revenueChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Sản phẩm bán chạy</h5>
                            <div class="list-group list-group-flush">
                                ${orderStats.data.topProducts.map(product => `
                                    <div class="list-group-item">
                                        <h6 class="mb-1">${product.name}</h6>
                                        <small class="text-muted">Đã bán: ${product.quantity}</small>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize revenue chart
        const ctx = document.getElementById('revenueChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: revenueStats.data.chart.labels,
                datasets: [{
                    label: 'Doanh thu',
                    data: revenueStats.data.chart.data,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => value.toLocaleString() + 'đ'
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading dashboard content:', error);
        contentDiv.innerHTML = '<div class="alert alert-danger">Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.</div>';
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', initializeDashboard);