const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new AppError('Authentication required', 401);
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    next(err.name === 'JsonWebTokenError' ? new AppError('Invalid token', 401) : err);
  }
};
