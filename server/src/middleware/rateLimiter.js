import rateLimit from 'express-rate-limit';
import config from '../config/index.js';

export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      message: 'Too many requests. Please try again later.',
      code: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for AI analysis endpoint
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: {
      message: 'AI analysis rate limit reached. Please wait before requesting again.',
      code: 429,
    },
  },
});
