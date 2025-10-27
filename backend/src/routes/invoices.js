const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/invoices', invoiceController.getInvoices);

router.post('/payments', authMiddleware, invoiceController.payInvoice);

module.exports = router;