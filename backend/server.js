// Import packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');


// Load environment variables FIRST - before ANY other imports
require('dotenv').config();

console.log('DB_PASSWORD loaded:', process.env.DB_PASSWORD);
console.log('All ENV vars:', {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// NOW import files that need env vars
const pool = require('./db');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth');
const categoryRoutes = require('./routes/categories');
const accountRoutes = require('./routes/accounts');
const transactionRoutes = require('./routes/transactions');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
    res.send('Finance Tracker API is running!');
});

app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ success: true, time: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Protected route example
app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ 
        message: 'This is a protected route!',
        userId: req.userId 
    });
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});