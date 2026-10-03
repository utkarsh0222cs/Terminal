import { marketService } from '../services/market/market.service.js';
import { computeAllIndicators } from '../services/indicators/index.js';
import { signalService } from '../services/signal.service.js';
import { createResponse } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';

export const analysisController = {
  async getAnalysis(req, res, next) {
    try {
      const { symbol } = req.params;
      const upperSymbol = symbol.toUpperCase();

      // Get market data + candles
      const [marketData, candles] = await Promise.all([
        marketService.getMarketData(upperSymbol),
        marketService.getCandles(upperSymbol, '1h', 200),
      ]);

      // Compute indicators
      const indicators = computeAllIndicators(candles);

      // Generate signals
      const signals = signalService.generateSignals(marketData, indicators);

      res.json(createResponse({
        symbol: upperSymbol,
        market: marketData,
        indicators,
        signals,
        timestamp: new Date().toISOString(),
      }));
    } catch (err) {
      next(err);
    }
  },
};
