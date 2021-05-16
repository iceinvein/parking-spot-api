const ErrorResponse = require('../utils/errorResponse');
const log = require('../logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new ErrorResponse('Item not found', 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error = new ErrorResponse('Duplicate Error', 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = {};
    Object.values(err.errors).forEach((el) => {
      errors[el.path] = el.message;
    });
    error = {
      statusCode: 400,
      message: errors,
    };
  }

  log.error(error.message);

  res.status(error.statusCode || 500).json({
    error: error.message || 'Server Error',
  });

  next();
};

module.exports = errorHandler;
