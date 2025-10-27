const transactionsService = require('../services/transactionsService');

exports.listTransactions = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 100;
    const txs = await transactionsService.getTransactions({ limit });
    res.json({ success: true, transactions: txs });
  } catch (err) {
    console.error('Error listing transactions:', err);
    res.status(500).json({ success: false, message: 'Failed to list transactions', error: err.message });
  }
};