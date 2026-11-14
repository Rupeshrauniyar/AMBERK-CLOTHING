const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.amberk_token) {
    token = req.cookies.amberk_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please log in.' },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'amberk_jwt_super_secret_key_2026');
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { code: 'USER_INACTIVE', message: 'User account is inactive or no longer exists.' },
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'TOKEN_INVALID', message: 'Session expired or token invalid. Please log in again.' },
    });
  }
};

const optionalAuth = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.amberk_token) {
    token = req.cookies.amberk_token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'amberk_jwt_super_secret_key_2026');
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    } catch {
      // Ignored for optional auth
    }
  }

  next();
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this administrative action.',
        },
      });
    }
    next();
  };
};

module.exports = {
  protect,
  optionalAuth,
  restrictTo,
};

