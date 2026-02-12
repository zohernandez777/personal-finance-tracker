const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Get all accounts for logged-in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const accounts = await pool.query(
            'SELECT * FROM accounts WHERE user_id = $1 ORDER BY account_name',
            [req.userId]
        );
        res.json(accounts.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new account
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { account_name, balance } = req.body;

        const newAccount = await pool.query(
            'INSERT INTO accounts (account_name, user_id, balance) VALUES ($1, $2, $3) RETURNING *',
            [account_name, req.userId, balance || 0]
        );

        res.status(201).json(newAccount.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;