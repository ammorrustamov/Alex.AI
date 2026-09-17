function errorHandler(err, req, res, next) {
  console.error('🔥 [API Error]', err.stack || err.message);

  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    }
  });
}

module.exports = errorHandler;
