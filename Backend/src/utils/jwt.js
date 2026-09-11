const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_default_key_2026';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret_default_key_2026';

const generateAccessToken = (payload) => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, ACCESS_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
