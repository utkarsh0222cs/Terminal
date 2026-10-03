import { marketService } from '../services/market/market.service.js';
import { computeAllIndicators } from '../services/indicators/index.js';
import { signalService } from '../services/signal.service.js';
import { aiService } from '../services/ai.service.js';
import { alertService } from '../services/alert.service.js';
import { createResponse } from '../utils/helpers.js';
import { isDatabaseConnected } from '../config/database.js';
import { logger } from '../utils/logger.js';

export const aiController = {
  async getAIAnalysis(req, res, next) {
    try {
      const { symbol } = req.params;
      const upperSymbol = symbol.toUpperCase();

      // Step 1: Get market data + candles
      const [marketData, candles] = await Promise.all([
        marketService.getMarketData(upperSymbol),
        marketService.getCandles(upperSymbol, '1h', 200),
      ]);

      // Step 2: Compute indicators
      const indicators = computeAllIndicators(candles);

      // Step 3: Generate signals
      const signals = signalService.generateSignals(marketData, indicators);

      // Step 4: Generate AI analysis
      const aiAnalysis = await aiService.generateAnalysis(marketData, indicators, signals);

      // Step 5: Check for alerts
      const newAlerts = alertService.checkAndGenerateAlerts(upperSymbol, indicators);
      if (newAlerts.length > 0) {
        await alertService.saveAlerts(newAlerts);
      }

      // Step 6: Persist analysis log (best-effort)
      if (isDatabaseConnected()) {
        try {
          const { default: AnalysisLog } = await import('../models/AnalysisLog.js');
          await AnalysisLog.create({
            symbol: upperSymbol,
            indicators,
            signals,
            aiAnalysis,
            modelUsed: aiAnalysis._model || 'fallback',
            source: aiAnalysis._source || 'unknown',
          });
        } catch (dbErr) {
          logger.warn('Failed to persist analysis log:', dbErr.message);
        }
      }

      res.json(createResponse({
        symbol: upperSymbol,
        market: {
          price: marketData.price,
          change24h: marketData.change24h,
          volume24h: marketData.volume24h,
          high24h: marketData.high24h,
          low24h: marketData.low24h,
        },
        indicators,
        signals,
        aiAnalysis,
        alerts: newAlerts,
        timestamp: new Date().toISOString(),
      }));
    } catch (err) {
      next(err);
    }
  },
};
