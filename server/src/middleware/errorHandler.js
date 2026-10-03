import { logger } from '../utils/logger.js';
import { createErrorResponse } from '../utils/helpers.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.path} — ${err.message}`);

  if (err.name === 'ValidationError') {
    return res.status(400).json(createErrorResponse(err.message, 400));
  }

  if (err.name === 'CastError') {
    return res.status(400).json(createErrorResponse('Invalid ID format', 400));
  }

  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    return res.status(503).json(createErrorResponse('External service unavailable', 503));
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json(createErrorResponse(message, statusCode));
};

export const notFoundHandler = (req, res) => {
  res.status(404).json(createErrorResponse(`Route not found: ${req.method} ${req.path}`, 404));
};
