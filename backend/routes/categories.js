const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// Get all categories for a user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const categories = await pool.query(
            'SELECT * FROM categories ORDER BY name'
        );
        res.json(categories.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new category
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, type } = req.body;

        // Validate type
        if (type !== 'income' && type !== 'expense') {
            return res.status(400).json({ message: 'Type must be income or expense' });
        }

        const newCategory = await pool.query(
            'INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING *',
            [name, type]
        );

        res.status(201).json(newCategory.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;