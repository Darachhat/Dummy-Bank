// backend/src/routes/accounts.js
const express = require('express');
const router = express.Router();
const accountsController = require('../controllers/accountsController');
const authMiddleware = require('../middleware/authMiddleware');

// Get current user's accounts
router.get('/accounts', authMiddleware, accountsController.listMyAccounts);

// Get accounts for a specific user (recipient)
router.get('/users/:id/accounts', authMiddleware, accountsController.listAccountsByUser);

module.exports = router;