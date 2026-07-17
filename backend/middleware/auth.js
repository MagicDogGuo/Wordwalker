const jwt = require('jsonwebtoken');
const CONFIG = require('../config');

const auth = (req, res, next) => {
  try {
    // Get token from request header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Please provide an authentication token' });
    }

    // Verify token
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET);
    
    // Attach user info to request object
    req.user = {
      _id: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      username: decoded.name
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin privileges are required' });
  }
  next();
};

module.exports = { auth, isAdmin }; 