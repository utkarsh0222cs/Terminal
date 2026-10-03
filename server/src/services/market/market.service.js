import { binanceService } from './binance.service.js';
import { coingeckoService } from './coingecko.service.js';
import { cache } from '../cache.service.js';
import config from '../../config/index.js';
import { logger } from '../../utils/logger.js';

export const marketService = {
  /**
   * Get current market data for a symbol.
   * Tries Binance first, falls back to CoinGecko.
   */
  async getMarketData(symbol) {
    const cacheKey = `market:${symbol}`;
    const cached = cache.get(cacheKey);
    if (cached) return { ...cached, _cached: true, _cacheAge: cache.getAge(cacheKey) };

    try {
      const data = await binanceService.getTicker(symbol);
      cache.set(cacheKey, data, config.cache.priceTTL);
      return { ...data, _source: 'binance' };
    } catch (err) {
      logger.warn(`Binance ticker failed for ${symbol}, trying CoinGecko...`);
      try {
        const data = await coingeckoService.getMarketData(symbol);
        cache.set(cacheKey, data, config.cache.priceTTL);
        return { ...data, _source: 'coingecko' };
      } catch (fallbackErr) {
        logger.error(`All market data sources failed for ${symbol}`);
        throw new Error(`Unable to fetch market data for ${symbol}`);
      }
    }
  },

  /**
   * Get candlestick data.
   * Tries Binance first, falls back to CoinGecko OHLC.
   */
  async getCandles(symbol, interval = '1h', limit = 200) {
    const cacheKey = `candles:${symbol}:${interval}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const data = await binanceService.getCandles(symbol, interval, limit);
      cache.set(cacheKey, data, config.cache.candleTTL);
      return data;
    } catch (err) {
      logger.warn(`Binance candles failed for ${symbol}, trying CoinGecko...`);
      try {
        const daysMap = { '1m': 1, '5m': 1, '15m': 1, '1h': 7, '4h': 30, '1d': 90 };
        const data = await coingeckoService.getOHLC(symbol, daysMap[interval] || 7);
        cache.set(cacheKey, data, config.cache.candleTTL);
        return data;
      } catch (fallbackErr) {
        logger.error(`All candle sources failed for ${symbol}`);
        throw new Error(`Unable to fetch candle data for ${symbol}`);
      }
    }
  },

  /**
   * Get prices for multiple symbols (watchlist)
   */
  async getMultiplePrices(symbols) {
    try {
      return await binanceService.getAllTickers(symbols);
    } catch (err) {
      logger.error('Failed to fetch multiple prices');
      return symbols.map((s) => ({
        symbol: s,
        price: 0,
        change24h: 0,
        volume24h: 0,
        _error: true,
      }));
    }
  },
};
