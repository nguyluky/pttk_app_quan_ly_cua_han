document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('mainContent');

    function loadRevenue() {
        mainContent.innerHTML = `
            <div class="container">
                <div class="row mb-4">
                    <div class="col-md-12">
                        <div class="card">
                            <div class="card-body">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h5 class="card-title">Thống kê doanh thu</h5>
                                    <div class="d-flex gap-2">
                                        <select class="form-select" id="periodSelect">
                                            <option value="day">Hôm nay</option>
                                            <option value="week">Tuần này</option>
                                            <option value="month">Tháng này</option>
                                            <option value="year">Năm nay</option>
                                            <option value="custom">Tùy chọn</option>
                                        </select>
                                        <div id="customDateRange" style="display: none;">
                                            <input type="date" class="form-control" id="startDate">
                                            <input type="date" class="form-control" id="endDate">
                                        </div>
                                    </div>
                                </div>
                                <div class="row g-4 mb-4">
                                    <div class="col-md-4">
                                        <div class="card bg-primary text-white">
                                            <div class="card-body">
                                                <h6 class="card-subtitle mb-2">Tổng doanh thu</h6>
                                                <h4 class="card-title" id="totalRevenue">0 đ</h4>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="card bg-success text-white">
                                            <div class="card-body">
                                                <h6 class="card-subtitle mb-2">Số đơn hàng</h6>
                                                <h4 class="card-title" id="totalOrders">0</h4>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="card bg-info text-white">
                                            <div class="card-body">
                                                <h6 class="card-subtitle mb-2">Trung bình/đơn</h6>
                                                <h4 class="card-title" id="averageOrder">0 đ</h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="row mb-4">
                                    <div class="col-md-8">
                                        <canvas id="revenueChart"></canvas>
                                    </div>
                                    <div class="col-md-4">
                                        <canvas id="productChart"></canvas>
                                    </div>
                                </div>
                                <div class="table-responsive">
                                    <table class="table">
                                        <thead>
                                            <tr>
                                                <th>Ngày</th>
                                                <th>Số đơn</th>
                                                <th>Doanh thu</th>
                                                <th>Lợi nhuận</th>
                                            </tr>
                                        </thead>
                                        <tbody id="revenueList">
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize charts
        initializeCharts();
        
        // Add event listeners
        document.getElementById('periodSelect').addEventListener('change', handlePeriodChange);
        document.getElementById('startDate').addEventListener('change', loadRevenueData);
        document.getElementById('endDate').addEventListener('change', loadRevenueData);
        
        // Load initial data
        loadRevenueData();
    }

    function handlePeriodChange(e) {
        const customDateRange = document.getElementById('customDateRange');
        if (e.target.value === 'custom') {
            customDateRange.style.display = 'flex';
        } else {
            customDateRange.style.display = 'none';
            loadRevenueData();
        }
    }

    let revenueChart = null;
    let productChart = null;

    function initializeCharts() {
        const revenueCtx = document.getElementById('revenueChart').getContext('2d');
        const productCtx = document.getElementById('productChart').getContext('2d');

        revenueChart = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Doanh thu',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Biểu đồ doanh thu'
                    }
                }
            }
        });

        productChart = new Chart(productCtx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        'rgb(255, 99, 132)',
                        'rgb(54, 162, 235)',
                        'rgb(255, 205, 86)',
                        'rgb(75, 192, 192)',
                        'rgb(153, 102, 255)'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Top sản phẩm bán chạy'
                    }
                }
            }
        });
    }

    async function loadRevenueData() {
        const period = document.getElementById('periodSelect').value;
        let startDate = document.getElementById('startDate').value;
        let endDate = document.getElementById('endDate').value;

        if (period !== 'custom') {
            const dates = calculateDateRange(period);
            startDate = dates.startDate;
            endDate = dates.endDate;
        }

        try {
            const response = await axios.get(`${API_URL}/api/revenue/statistics`, {
                params: { startDate, endDate }
            });

            updateDashboardData(response.data);
            updateCharts(response.data);
            updateRevenueTable(response.data.dailyRevenue);
        } catch (error) {
            console.error('Error loading revenue data:', error);
            alert('Không thể tải dữ liệu doanh thu');
        }
    }

    function calculateDateRange(period) {
        const now = new Date();
        let startDate = new Date();
        let endDate = now;

        switch (period) {
            case 'day':
                startDate = now;
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }

    function updateDashboardData(data) {
        document.getElementById('totalRevenue').textContent = 
            data.totalRevenue.toLocaleString('vi-VN') + ' đ';
        document.getElementById('totalOrders').textContent = 
            data.totalOrders.toLocaleString('vi-VN');
        document.getElementById('averageOrder').textContent = 
            (data.totalRevenue / data.totalOrders || 0).toLocaleString('vi-VN') + ' đ';
    }

    function updateCharts(data) {
        // Update revenue chart
        revenueChart.data.labels = data.dailyRevenue.map(item => item.date);
        revenueChart.data.datasets[0].data = data.dailyRevenue.map(item => item.revenue);
        revenueChart.update();

        // Update product chart
        productChart.data.labels = data.topProducts.map(item => item.name);
        productChart.data.datasets[0].data = data.topProducts.map(item => item.quantity);
        productChart.update();
    }

    function updateRevenueTable(dailyRevenue) {
        const revenueList = document.getElementById('revenueList');
        revenueList.innerHTML = dailyRevenue.map(item => `
            <tr>
                <td>${new Date(item.date).toLocaleDateString('vi-VN')}</td>
                <td>${item.orders.toLocaleString('vi-VN')}</td>
                <td>${item.revenue.toLocaleString('vi-VN')} đ</td>
                <td>${item.profit.toLocaleString('vi-VN')} đ</td>
            </tr>
        `).join('');
    }

    // Initialize revenue page when loaded
    if (document.querySelector('[data-page="revenue"]')) {
        loadRevenue();
    }
});