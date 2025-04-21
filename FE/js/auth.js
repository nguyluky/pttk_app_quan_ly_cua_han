// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
        const userData = JSON.parse(user);
        redirectToUserDashboard(userData.role);
    }
});

// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!utils.validateEmail(email)) {
        alert('Email không hợp lệ');
        return;
    }

    if (!utils.validatePassword(password)) {
        alert('Mật khẩu phải có ít nhất 6 ký tự');
        return;
    }

    try {
        utils.showLoading();

        const response = await axios.post('/api/auth/login', {
            email,
            password
        });

        const { token, ...user } = response.data;
        
        // Save auth data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Configure axios defaults after login
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Redirect based on role
        redirectToUserDashboard(user.role);
    } catch (error) {
        console.error('Login error:', error);
        let message = 'Có lỗi xảy ra khi đăng nhập';

        if (error.response) {
            switch (error.response.status) {
                case 401:
                    message = 'Mật khẩu không chính xác';
                    break;
                case 404:
                    message = 'Tài khoản không tồn tại';
                    break;
                default:
                    message = error.response.data.message || message;
            }
        }

        alert(message);
    }
});

// Handle forgot password form submission
document.getElementById('forgotPasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;

    if (!utils.validateEmail(email)) {
        alert('Email không hợp lệ');
        return;
    }

    try {
        utils.showLoading();

        await axios.post('/auth/forgot-password', { email });
        alert('Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn');

        // Redirect to login page
        window.location.href = '/';
    } catch (error) {
        console.error('Forgot password error:', error);
        let message = 'Có lỗi xảy ra khi gửi yêu cầu';

        if (error.response && error.response.status === 404) {
            message = 'Email không tồn tại trong hệ thống';
        }

        alert(message);
    } finally {
        utils.hideLoading();
    }
});

// Handle reset password form submission
document.getElementById('resetPasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!utils.validatePassword(password)) {
        alert('Mật khẩu phải có ít nhất 6 ký tự');
        return;
    }

    if (password !== confirmPassword) {
        alert('Mật khẩu xác nhận không khớp');
        return;
    }

    // Get token from URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
        alert('Liên kết đặt lại mật khẩu không hợp lệ');
        window.location.href = '/';
        return;
    }

    try {
        utils.showLoading();

        await axios.post('/auth/reset-password', {
            token,
            password
        });

        alert('Mật khẩu đã được đặt lại thành công');
        window.location.href = '/';
    } catch (error) {
        console.error('Reset password error:', error);
        let message = 'Có lỗi xảy ra khi đặt lại mật khẩu';

        if (error.response) {
            switch (error.response.status) {
                case 400:
                    message = 'Liên kết đặt lại mật khẩu đã hết hạn';
                    break;
                default:
                    message = error.response.data.message || message;
            }
        }

        alert(message);
    } finally {
        utils.hideLoading();
    }
});

// Handle change password form submission
document.getElementById('changePasswordForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!utils.validatePassword(newPassword)) {
        alert('Mật khẩu mới phải có ít nhất 6 ký tự');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('Mật khẩu xác nhận không khớp');
        return;
    }

    try {
        utils.showLoading();

        await axios.post('/auth/change-password', {
            currentPassword,
            newPassword
        });

        alert('Mật khẩu đã được thay đổi thành công');
        window.location.reload();
    } catch (error) {
        console.error('Change password error:', error);
        let message = 'Có lỗi xảy ra khi thay đổi mật khẩu';

        if (error.response && error.response.status === 401) {
            message = 'Mật khẩu hiện tại không chính xác';
        }

        alert(message);
    } finally {
        utils.hideLoading();
    }
});

// Handle logout
const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
};

// Redirect user based on role
const redirectToUserDashboard = (role) => {
    switch (role) {
        case 'admin':
            window.location.href = '/admin/dashboard.html';
            break;
        case 'manager':
        case 'staff':
            window.location.href = '/staff/pos.html';
            break;
        default:
            alert('Vai trò không hợp lệ');
            handleLogout();
    }
};

// Export functions for use in other files
window.auth = {
    handleLogout,
    redirectToUserDashboard
};