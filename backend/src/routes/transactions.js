const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/transactions', authMiddleware, transactionsController.listTransactions);

module.exports = router;