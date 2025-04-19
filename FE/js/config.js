// API Configuration
const API_BASE_URL = 'http://localhost:5000'; // Changed to match backend port and added /api prefix

// Axios Configuration
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add authentication token to requests if available
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Handle unauthorized responses
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Utility Functions
const formatCurrency = (amount) => {
    return amount.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND'
    });
};

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

const formatDateTime = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Loading Spinner
const showLoading = () => {
    const spinner = document.createElement('div');
    spinner.className = 'spinner-overlay';
    spinner.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang tải...</span>
        </div>
    `;
    document.body.appendChild(spinner);
};

const hideLoading = () => {
    const spinner = document.querySelector('.spinner-overlay');
    if (spinner) {
        spinner.remove();
    }
};

// Error Handling
const handleError = (error, customMessage = 'Có lỗi xảy ra. Vui lòng thử lại.') => {
    console.error('Error:', error);
    let message = customMessage;

    if (error.response) {
        // Server error response
        message = error.response.data.message || customMessage;
    } else if (error.request) {
        // No response from server
        message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
    }

    alert(message);
};

// Form Validation
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const validatePassword = (password) => {
    return password.length >= 6;
};

// Authentication Check
const requireAuth = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
        window.location.href = '/';
        return false;
    }

    return JSON.parse(user);
};

// Role-based Access Control
const checkRole = (allowedRoles) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return allowedRoles.includes(user.role);
};

// Export functions for use in other files
window.utils = {
    formatCurrency,
    formatDate,
    formatDateTime,
    showLoading,
    hideLoading,
    handleError,
    validateEmail,
    validatePassword,
    requireAuth,
    checkRole
};