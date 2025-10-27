// Update to parse account ids if present in payments table metadata or columns
const knex = require('../db/knex');

let memoryStore = [];

async function recordTransaction(tx) {
  if (knex) {
    try {
      const insertData = {
        invoice_no: tx.invoiceNo,
        amount: tx.amount || null,
        status: tx.status || 'PAID',
        transaction_id: tx.transactionId,
        paid_at: tx.paidAt ? new Date(tx.paidAt) : null,
        from_account_id: tx.fromAccountId || null,
        to_account_id: tx.toAccountId || null,
        metadata: JSON.stringify(tx.metadata || {}),
        created_at: tx.created_at ? new Date(tx.created_at) : new Date()
      };
      const result = await knex('payments').insert(insertData);
      const id = Array.isArray(result) ? result[0] : result;
      return { ...tx, id };
    } catch (err) {
      console.warn('transactionsService: DB insert failed, falling back to memory:', err.message);
      const mem = { ...tx, id: memoryStore.length + 1, createdAt: new Date().toISOString() };
      memoryStore.unshift(mem);
      return mem;
    }
  } else {
    const mem = { ...tx, id: memoryStore.length + 1, createdAt: new Date().toISOString() };
    memoryStore.unshift(mem);
    return mem;
  }
}

async function getTransactions({ limit = 100 } = {}) {
  if (knex) {
    try {
      const rows = await knex('payments').select(
        'id',
        'invoice_no as invoiceNo',
        'amount',
        'status',
        'transaction_id as transactionId',
        'paid_at as paidAt',
        'from_account_id as fromAccountId',
        'to_account_id as toAccountId',
        'metadata',
        'created_at as createdAt'
      ).orderBy('created_at', 'desc').limit(limit);

      return rows.map(r => ({
        id: r.id,
        invoiceNo: r.invoiceNo,
        amount: r.amount,
        status: r.status,
        transactionId: r.transactionId,
        paidAt: r.paidAt ? new Date(r.paidAt).toISOString() : null,
        fromAccountId: r.fromAccountId || null,
        toAccountId: r.toAccountId || null,
        metadata: (() => {
          try { return r.metadata ? JSON.parse(r.metadata) : null; } catch (e) { return null; }
        })(),
        createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null
      }));
    } catch (err) {
      console.warn('transactionsService: DB read failed, returning memory store:', err.message);
      return memoryStore.slice(0, limit);
    }
  } else {
    return memoryStore.slice(0, limit);
  }
}

module.exports = { recordTransaction, getTransactions, _memoryStore: memoryStore };