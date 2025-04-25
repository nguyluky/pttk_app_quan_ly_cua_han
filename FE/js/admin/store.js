document.addEventListener('DOMContentLoaded', function() {
    const mainContent = document.getElementById('mainContent');

    function loadStoreManagement() {
        mainContent.innerHTML = `
            <div class="container">
                <div class="row mb-4">
                    <div class="col">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Thông tin cửa hàng</h5>
                                <form id="storeInfoForm">
                                    <div class="mb-3">
                                        <label class="form-label">Tên cửa hàng</label>
                                        <input type="text" class="form-control" id="storeName">
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Địa chỉ</label>
                                        <input type="text" class="form-control" id="storeAddress">
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Số điện thoại</label>
                                        <input type="tel" class="form-control" id="storePhone">
                                    </div>
                                    <button type="submit" class="btn btn-primary">Cập nhật thông tin</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Cài đặt hệ thống</h5>
                                <div class="mb-3">
                                    <label class="form-label">Giờ mở cửa</label>
                                    <input type="time" class="form-control" id="openingTime">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Giờ đóng cửa</label>
                                    <input type="time" class="form-control" id="closingTime">
                                </div>
                                <button class="btn btn-primary" id="saveSettings">Lưu cài đặt</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        document.getElementById('storeInfoForm').addEventListener('submit', updateStoreInfo);
        document.getElementById('saveSettings').addEventListener('click', saveSettings);
        loadStoreData();
    }

    async function loadStoreData() {
        try {
            const response = await axios.get(`${API_URL}/api/store/info`);
            const storeData = response.data;
            
            document.getElementById('storeName').value = storeData.name;
            document.getElementById('storeAddress').value = storeData.address;
            document.getElementById('storePhone').value = storeData.phone;
            document.getElementById('openingTime').value = storeData.openingTime;
            document.getElementById('closingTime').value = storeData.closingTime;
        } catch (error) {
            console.error('Error loading store data:', error);
            alert('Không thể tải thông tin cửa hàng');
        }
    }

    async function updateStoreInfo(e) {
        e.preventDefault();
        const storeData = {
            name: document.getElementById('storeName').value,
            address: document.getElementById('storeAddress').value,
            phone: document.getElementById('storePhone').value
        };

        try {
            await axios.put(`${API_URL}/api/store/update`, storeData);
            alert('Cập nhật thông tin thành công');
        } catch (error) {
            console.error('Error updating store info:', error);
            alert('Không thể cập nhật thông tin cửa hàng');
        }
    }

    async function saveSettings() {
        const settings = {
            openingTime: document.getElementById('openingTime').value,
            closingTime: document.getElementById('closingTime').value
        };

        try {
            await axios.put(`${API_URL}/api/store/settings`, settings);
            alert('Lưu cài đặt thành công');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Không thể lưu cài đặt');
        }
    }

    // Initialize store management page when loaded
    if (document.querySelector('[data-page="store"]')) {
        loadStoreManagement();
    }
});