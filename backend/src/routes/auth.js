const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const usersService = require('../services/usersService');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ success: false, message: 'phone and password required' });

    const user = await usersService.authenticate(phone, password);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ success: true, token, user });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
});

module.exports = router;