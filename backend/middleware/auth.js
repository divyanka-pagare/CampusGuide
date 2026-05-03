const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require login
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

// Optional auth - attaches user if token exists, doesn't block if not
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    }
  } catch (_) {}
  next();
};

// Role-based access
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized for this action`
      });
    }
    next();
  };
};

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

module.exports = { protect, optionalAuth, authorize, generateToken };
