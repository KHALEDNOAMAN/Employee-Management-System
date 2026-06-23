module.exports = (err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, error: { code: err.code || 'INTERNAL_ERROR', message: err.isOperational ? err.message : 'Internal server error' } });
};
