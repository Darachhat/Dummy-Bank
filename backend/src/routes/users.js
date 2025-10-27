const express = require('express');
const router = express.Router();
const usersService = require('../services/usersService');
const authMiddleware = require('../middleware/authMiddleware');

// Public endpoint to list users (for selecting recipient in Payment page)
router.get('/', authMiddleware, (req, res) => {
  const list = usersService.listUsers();
  res.json({ success: true, users: list });
});

// GET /api/users/me
router.get('/me', authMiddleware, (req, res) => {
  // return minimal user data and balance (from in-memory service)
  const user = usersService.findById(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const { id, name, phone, balance } = user;
  res.json({ success: true, user: { id, name, phone, balance } });
});

module.exports = router;