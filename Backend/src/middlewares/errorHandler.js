const logger = require('../config/logger');
const ApiResponse = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack || err.message || err);

  // Zod Validation Errors
  if (err.name === 'ZodError') {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return ApiResponse.error(res, 'Validation Error', 422, formattedErrors);
  }

  // Prisma Errors
  if (err.code === 'P2002') {
    const target = err.meta?.target || 'field';
    return ApiResponse.error(res, `A record with this ${target} already exists.`, 409);
  }

  if (err.code === 'P2025') {
    return ApiResponse.error(res, 'Requested resource was not found.', 404);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return ApiResponse.error(res, message, statusCode);
};

module.exports = errorHandler;
