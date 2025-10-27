const externalApi = require('../services/externalApiService');
const knex = require('../db/knex');
const usersService = require('../services/usersService');
const transactionsService = require('../services/transactionsService');

/**
 * GET /api/invoices
 */
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await externalApi.getInvoices();
    res.json({ success: true, invoices });
  } catch (err) {
    console.error('Error fetching invoices:', err.message || err);
    res.status(502).json({ success: false, message: 'Failed to fetch invoices', error: err.message });
  }
};

/**
 * POST /api/payments
 * Body: { invoiceNo: string, amount?: number, fromAccountId: number, pincode: string }
 * Auth: req.user (from auth middleware)
 */
exports.payInvoice = async (req, res) => {
  try {
    const payerId = req.user && req.user.id;
    const { invoiceNo, amount, fromAccountId, pincode } = req.body;
    if (!invoiceNo || !pincode) return res.status(400).json({ success: false, message: 'invoiceNo and pincode required' });
    if (!fromAccountId) return res.status(400).json({ success: false, message: 'fromAccountId required' });

    // Verify pincode for authenticated user
    const okPin = usersService.verifyPincode(payerId, pincode);
    if (!okPin) return res.status(403).json({ success: false, message: 'Invalid pincode' });

    // Validate fromAccount belongs to payer.
    // If knex is available, query the accounts table. Otherwise fallback to in-memory usersService.
    let fromAcc = null;
    try {
      if (knex) {
        fromAcc = await knex('accounts').where({ id: fromAccountId, user_id: payerId }).first();
      } else {
        fromAcc = usersService.findAccountById(fromAccountId);
        if (fromAcc && Number(fromAcc.user_id) !== Number(payerId)) fromAcc = null;
      }
    } catch (qErr) {
      console.error('Account lookup failed:', qErr.message);
      fromAcc = null;
    }

    if (!fromAcc) {
      return res.status(400).json({ success: false, message: 'Invalid fromAccountId' });
    }

    // Optional: check sufficient balance server-side (recommended)
    if (amount && Number(amount) > 0) {
      const bal = knex ? Number(fromAcc.balance || 0) : Number(fromAcc.balance || 0);
      if (!isNaN(bal) && bal < Number(amount)) {
        return res.status(400).json({ success: false, message: 'Insufficient balance in selected account' });
      }
    }

    const paymentResult = {
      invoiceNo,
      amount: amount || null,
      status: 'PAID',
      paidAt: new Date().toISOString(),
      transactionId: `txn_${Math.random().toString(36).substring(2, 10)}`,
      fromUserId: payerId,
      fromAccountId: fromAccountId,
      metadata: { source: 'dummy-bank-backend' }
    };

    // Persist to DB payments table (including from_account_id)
    if (knex) {
      try {
        const insertData = {
          invoice_no: invoiceNo,
          amount: amount || null,
          status: paymentResult.status,
          transaction_id: paymentResult.transactionId,
          paid_at: paymentResult.paidAt ? new Date(paymentResult.paidAt) : null,
          from_account_id: paymentResult.fromAccountId,
          metadata: JSON.stringify({ fromUserId: payerId, fromAccountId }),
          created_at: new Date()
        };
        const result = await knex('payments').insert(insertData);
        paymentResult.id = Array.isArray(result) ? result[0] : result;
      } catch (dbErr) {
        console.error('DB insert failed:', dbErr.message);
        // continue and return success but include warning
      }
    }

    // Update account balance: if using knex update DB, otherwise update in-memory
    try {
      if (paymentResult.amount) {
        if (knex) {
          // decrement sender account balance
          await knex('accounts').where({ id: fromAccountId }).decrement('balance', Number(paymentResult.amount));
        } else {
          usersService.updateAccountBalance(fromAccountId, -Number(paymentResult.amount));
        }
      }
    } catch (e) {
      console.warn('Failed to update account balance:', e.message);
    }

    // Record transaction via transactionsService
    try {
      const recorded = await transactionsService.recordTransaction({
        invoiceNo: paymentResult.invoiceNo,
        amount: paymentResult.amount,
        status: paymentResult.status,
        transactionId: paymentResult.transactionId,
        paidAt: paymentResult.paidAt,
        fromUserId: paymentResult.fromUserId,
        fromAccountId: paymentResult.fromAccountId,
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