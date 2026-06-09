/**
 * Legacy auth middleware — uses unified User model.
 * Maps req.userType for old restrictTo('restaurant'|'ngo').
 */
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password -refreshToken');
      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }
      req.userType = req.user.role;
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const restrictTo = (...types) => (req, res, next) => {
  if (!req.userType || !types.includes(req.userType)) {
    res.status(403);
    return next(new Error('You do not have permission to perform this action'));
  }
  next();
};

module.exports = { protect, restrictTo };
