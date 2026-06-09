const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });

const generateRefreshToken = () => crypto.randomBytes(40).toString('hex');

const hashRefreshToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
};
