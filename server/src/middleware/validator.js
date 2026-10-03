import { query, param, body, validationResult } from 'express-validator';
import { SUPPORTED_SYMBOLS, VALID_INTERVALS } from '../config/constants.js';
import { createErrorResponse } from '../utils/helpers.js';

export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(
      createErrorResponse(errors.array().map((e) => e.msg).join(', '), 400)
    );
  }
  next();
};

export const validateSymbol = [
  param('symbol')
    .trim()
    .toUpperCase()
    .notEmpty()
    .withMessage('Symbol is required'),
  handleValidation,
];

export const validateCandleQuery = [
  param('symbol').trim().toUpperCase().notEmpty().withMessage('Symbol is required'),
  query('interval')
    .optional()
    .isIn(VALID_INTERVALS)
    .withMessage(`Interval must be one of: ${VALID_INTERVALS.join(', ')}`),
  query('limit')
    .optional()
    .isInt({ min: 10, max: 1000 })
    .withMessage('Limit must be between 10 and 1000'),
  handleValidation,
];

export const validateWatchlistAdd = [
  body('symbol')
    .trim()
    .toUpperCase()
    .notEmpty()
    .withMessage('Symbol is required'),
  handleValidation,
];
