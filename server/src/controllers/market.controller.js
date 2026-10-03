import { marketService } from '../services/market/market.service.js';
import { computeAllIndicators } from '../services/indicators/index.js';
import { createResponse, createErrorResponse } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';

export const marketController = {
  async getMarketData(req, res, next) {
    try {
      const { symbol } = req.params;
      const marketData = await marketService.getMarketData(symbol.toUpperCase());

      // Also compute indicators for the stats cards
      let indicators = null;
      try {
        const candles = await marketService.getCandles(symbol.toUpperCase(), '1h', 200);
        indicators = computeAllIndicators(candles);
      } catch (err) {
        logger.warn(`Indicator computation failed for ${symbol}:`, err.message);
      }

      res.json(createResponse({
        ...marketData,
        indicators,
      }));
    } catch (err) {
      next(err);
    }
  },

  async getCandles(req, res, next) {
    try {
      const { symbol } = req.params;
      const interval = req.query.interval || '1h';
      const limit = parseInt(req.query.limit, 10) || 200;

      const candles = await marketService.getCandles(symbol.toUpperCase(), interval, limit);
      res.json(createResponse(candles, { symbol, interval, limit, count: candles.length }));
    } catch (err) {
      next(err);
    }
  },
};
