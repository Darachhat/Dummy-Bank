const jwt = require('jsonwebtoken');
const usersService = require('../services/usersService');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Missing token' });
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = usersService.findById(payload.sub);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid token user' });
    req.user = { id: user.id, name: user.name, phone: user.phone };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

module.exports = authMiddleware;