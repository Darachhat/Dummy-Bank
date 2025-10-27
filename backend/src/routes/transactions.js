// backend/src/routes/transactions.js
const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/transactions (protected)
router.get('/transactions', authMiddleware, transactionsController.listTransactions);

module.exports = router;