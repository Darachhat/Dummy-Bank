// backend/src/controllers/accountsController.js
const knex = require('../db/knex');
const usersService = require('../services/usersService');

/**
 * GET /api/accounts
 * Return accounts for the logged-in user.
 */
exports.listMyAccounts = async (req, res) => {
  try {
    const userId = req.user.id;
    if (knex) {
      const rows = await knex('accounts').where({ user_id: userId }).select('*').orderBy('created_at','desc');
      return res.json({ success: true, accounts: rows });
    } else {
      // fallback to in-memory usersService
      const accounts = usersService.getAccountsForUser(userId);
      return res.json({ success: true, accounts });
    }
  } catch (err) {
    console.error('Error listing accounts:', err.message);
    res.status(500).json({ success: false, message: 'Failed to list accounts', error: err.message });
  }
};

/**
 * GET /api/users/:id/accounts
 * Return accounts for a specified user (useful to select recipient account).
 * Protected route.
 */
exports.listAccountsByUser = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ success:false, message:'Invalid user id' });

    if (knex) {
      const rows = await knex('accounts').where({ user_id: userId }).select('*').orderBy('created_at','desc');
      return res.json({ success: true, accounts: rows });
    } else {
      const accounts = usersService.getAccountsForUser(userId);
      return res.json({ success: true, accounts });
    }
  } catch (err) {
    console.error('Error listing accounts by user:', err.message);
    res.status(500).json({ success: false, message: 'Failed to list accounts', error: err.message });
  }
};