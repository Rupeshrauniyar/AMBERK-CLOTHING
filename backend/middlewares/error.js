const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let code = 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred on the server.';
  let details = undefined;

  // Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Resource not found with specified identifier: ${err.value}`;
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with that ${field} already exists.`;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  // Zod Validation Error
  if (err.name === 'ZodError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Request validation failed';
    details = err.errors;
  }

  // Multer Error
  if (err.name === 'MulterError') {
    statusCode = 400;
    code = 'FILE_UPLOAD_ERROR';
    message = err.message;
  }

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('[Error Caught]:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      ...(process.env.NODE_ENV === 'development' && statusCode === 500 ? { stack: err.stack } : {}),
    },
  });
};

module.exports = errorHandler;

