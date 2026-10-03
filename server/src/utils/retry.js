import { logger } from './logger.js';

/**
 * Retry an async function with exponential backoff.
 * @param {Function} fn - Async function to retry
 * @param {Object} opts - Options
 * @param {number} opts.retries - Max retries (default 3)
 * @param {number} opts.baseDelay - Base delay in ms (default 1000)
 * @param {string} opts.label - Label for logging
 */
export const retryWithBackoff = async (fn, opts = {}) => {
  const { retries = 3, baseDelay = 1000, label = 'operation' } = opts;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) {
        logger.error(`${label} failed after ${retries} attempts:`, error.message);
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn(`${label} attempt ${attempt} failed. Retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
};
