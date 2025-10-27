
const express = require('express');
const router = express.Router();
const accountsController = require('../controllers/accountsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/accounts', authMiddleware, accountsController.listMyAccounts);

router.get('/users/:id/accounts', authMiddleware, accountsController.listAccountsByUser);

module.exports = router;