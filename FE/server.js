const express = require('express');
const path = require('path');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Configure API proxy
app.use('/api', createProxyMiddleware({
    target: 'http://localhost:5000',
    changeOrigin: true,
    pathRewrite: {
        '^/api': '/api' // Keep /api prefix when forwarding to backend
    },
    onError: (err, req, res) => {
        res.status(500).json({ message: 'Proxy Error', error: err.message });
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
    if (req.path.startsWith('/admin/')) {
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