const express = require('express');
const path = require('path');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Proxy /api requests to backend server
app.use('/api', createProxyMiddleware({ 
    target: process.env.API_URL || 'http://localhost:5000/api',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '' // Remove /api prefix when forwarding to backend
    }
}));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Route handlers for HTML pages
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin/dashboard.html'));
});

app.get('/staff', (req, res) => {
    res.sendFile(path.join(__dirname, 'staff/pos.html'));
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle other routes
app.get('*', (req, res) => {
    // Check admin path access
    if (req.path.startsWith('/admin/')) {
        // The actual role check will happen in the frontend via redirectToUserDashboard
        res.sendFile(path.join(__dirname, 'admin/dashboard.html'));
    } else if (req.path.startsWith('/staff/')) {
        res.sendFile(path.join(__dirname, 'staff/pos.html'));
    } else {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`Frontend server đang chạy tại http://localhost:${PORT}`);
});