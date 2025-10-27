// Replace existing file with this updated version
const externalApi = require('../services/externalApiService');
const knex = require('../db/knex');
const usersService = require('../services/usersService');
const transactionsService = require('../services/transactionsService');

exports.getInvoices = async (req, res) => {
  try {
    const invoices = await externalApi.getInvoices();
    res.json({ success: true, invoices });
  } catch (err) {
    console.error('Error fetching invoices:', err.message || err);
    res.status(502).json({ success: false, message: 'Failed to fetch invoices', error: err.message });
  }
};

exports.payInvoice = async (req, res) => {
  try {
    const payerId = req.user && req.user.id;
    const { invoiceNo, amount, toUserId, toAccountId, fromAccountId, pincode } = req.body;

    if (!invoiceNo || !pincode) return res.status(400).json({ success: false, message: 'invoiceNo and pincode required' });

    // Verify pincode for authenticated user
    const okPin = usersService.verifyPincode(payerId, pincode);
    if (!okPin) return res.status(403).json({ success: false, message: 'Invalid pincode' });

    // Validate fromAccount belongs to payer
    const fromAcc = usersService.findAccountById(fromAccountId);
    if (!fromAcc || Number(fromAcc.user_id) !== Number(payerId)) {
      return res.status(400).json({ success: false, message: 'Invalid fromAccountId' });
    }

    // Optionally validate toAccount if provided
    const toAcc = toAccountId ? usersService.findAccountById(toAccountId) : null;

    const paymentResult = {
      invoiceNo,
      amount: amount || null,
      status: 'PAID',
      paidAt: new Date().toISOString(),
      transactionId: `txn_${Math.random().toString(36).substring(2, 10)}`,
      fromUserId: payerId,
      toUserId: toUserId || null,
      fromAccountId: fromAccountId || null,
      toAccountId: toAccountId || null,
      metadata: { source: 'dummy-bank-backend' }
    };

    // Persist to DB payments table (including account ids)
    if (knex) {
      try {
        const insertData = {
          invoice_no: invoiceNo,
          amount: amount || null,
          status: paymentResult.status,
          transaction_id: paymentResult.transactionId,
          paid_at: paymentResult.paidAt ? new Date(paymentResult.paidAt) : null,
          from_account_id: paymentResult.fromAccountId,
          to_account_id: paymentResult.toAccountId,
          metadata: JSON.stringify({ fromUserId: payerId, toUserId, fromAccountId, toAccountId }),
          created_at: new Date()
        };
        const result = await knex('payments').insert(insertData);
        paymentResult.id = Array.isArray(result) ? result[0] : result;
      } catch (dbErr) {
        console.error('DB insert failed:', dbErr.message);
      }
    }

    // Update in-memory account balances (demo only)
    try {
      if (paymentResult.amount) {
        usersService.updateAccountBalance(fromAccountId, -Number(paymentResult.amount));
        if (toAccountId) usersService.updateAccountBalance(toAccountId, Number(paymentResult.amount));
      }
    } catch (e) {
      console.warn('Failed to update in-memory account balances:', e.message);
    }

    // Record transaction
    try {
      const recorded = await transactionsService.recordTransaction({
        invoiceNo: paymentResult.invoiceNo,
        amount: paymentResult.amount,
        status: paymentResult.status,
        transactionId: paymentResult.transactionId,
        paidAt: paymentResult.paidAt,
        fromUserId: paymentResult.fromUserId,
        toUserId: paymentResult.toUserId,
        fromAccountId: paymentResult.fromAccountId,
        toAccountId: paymentResult.toAccountId,
        metadata: paymentResult.metadata,
        created_at: new Date()
      });
      if (recorded && recorded.id) paymentResult.id = recorded.id;
    } catch (recErr) {
      console.error('Failed to record transaction to transactionsService:', recErr.message);
    }

    return res.json({ success: true, payment: paymentResult });
  } catch (err) {
    console.error('Error processing payment:', err);
    return res.status(500).json({ success: false, message: 'Payment failed', error: err.message });
  }
};