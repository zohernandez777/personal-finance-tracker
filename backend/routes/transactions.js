const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Get all transactions for logged-in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const transactions = await pool.query(
            `SELECT t.*, c.name as category_name, a.account_name 
             FROM transactions t
             JOIN categories c ON t.category_id = c.id
             JOIN accounts a ON t.account_id = a.id
             WHERE t.user_id = $1
             ORDER BY t.date DESC`,
            [req.userId]
        );
        res.json(transactions.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new transaction
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { amount, date, description, account_id, category_id } = req.body;

        const newTransaction = await pool.query(
            `INSERT INTO transactions (amount, date, description, user_id, account_id, category_id) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [amount, date, description, req.userId, account_id, category_id]
        );

        res.status(201).json(newTransaction.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a transaction
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        
        await pool.query(
            'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
            [id, req.userId]
        );

        res.json({ message: 'Transaction deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;