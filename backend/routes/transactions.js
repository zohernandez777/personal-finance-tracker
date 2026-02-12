const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Get all transactions for logged-in user

// Get transaction statistics/summary
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        // Total income
        const income = await pool.query(
            `SELECT COALESCE(SUM(t.amount), 0) as total
             FROM transactions t
             JOIN categories c ON t.category_id = c.id
             WHERE t.user_id = $1 AND c.type = 'income'`,
            [req.userId]
        );

        // Total expenses
        const expenses = await pool.query(
            `SELECT COALESCE(SUM(t.amount), 0) as total
             FROM transactions t
             JOIN categories c ON t.category_id = c.id
             WHERE t.user_id = $1 AND c.type = 'expense'`,
            [req.userId]
        );

        // Spending by category
        const byCategory = await pool.query(
            `SELECT c.name, c.type, COALESCE(SUM(t.amount), 0) as total
             FROM categories c
             LEFT JOIN transactions t ON c.id = t.category_id AND t.user_id = $1
             GROUP BY c.id, c.name, c.type
             ORDER BY total DESC`,
            [req.userId]
        );

        const totalIncome = parseFloat(income.rows[0].total);
        const totalExpenses = parseFloat(expenses.rows[0].total);

        res.json({
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
            byCategory: byCategory.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});



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

// Update a transaction
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, date, description, account_id, category_id } = req.body;

        const updatedTransaction = await pool.query(
            `UPDATE transactions 
             SET amount = $1, date = $2, description = $3, account_id = $4, category_id = $5
             WHERE id = $6 AND user_id = $7
             RETURNING *`,
            [amount, date, description, account_id, category_id, id, req.userId]
        );

        if (updatedTransaction.rows.length === 0) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json(updatedTransaction.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});



module.exports = router;