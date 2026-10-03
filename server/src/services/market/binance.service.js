import axios from 'axios';
import config from '../../config/index.js';
import { retryWithBackoff } from '../../utils/retry.js';
import { parseBinanceKline } from '../../utils/formatters.js';
import { logger } from '../../utils/logger.js';

const client = axios.create({
  baseURL: config.binanceBaseUrl,
  timeout: 10000,
});

export const binanceService = {
  /**
   * Get 24hr ticker stats for a symbol
   */
  async getTicker(symbol) {
    return retryWithBackoff(
      async () => {
        const { data } = await client.get('/api/v3/ticker/24hr', {
          params: { symbol },
        });
        return {
          symbol: data.symbol,
          price: parseFloat(data.lastPrice),
          change24h: parseFloat(data.priceChangePercent),
          volume24h: parseFloat(data.volume) * parseFloat(data.lastPrice),
          high24h: parseFloat(data.highPrice),
          low24h: parseFloat(data.lowPrice),
          quoteVolume: parseFloat(data.quoteVolume),
          trades: data.count,
        };
      },
      { label: `Binance ticker ${symbol}`, retries: 3 }
    );
  },

  /**
   * Get candlestick/kline data
   */
  async getCandles(symbol, interval = '1h', limit = 200) {
    return retryWithBackoff(
      async () => {
        const { data } = await client.get('/api/v3/klines', {
          params: { symbol, interval, limit },
        });
        return data.map(parseBinanceKline);
      },
      { label: `Binance klines ${symbol} ${interval}`, retries: 3 }
    );
  },

  /**
   * Get current price only (lightweight)
   */
  async getPrice(symbol) {
    return retryWithBackoff(
      async () => {
        const { data } = await client.get('/api/v3/ticker/price', {
          params: { symbol },
        });
        return {
          symbol: data.symbol,
          price: parseFloat(data.price),
        };
      },
      { label: `Binance price ${symbol}`, retries: 2 }
    );
  },

  /**
   * Get all tickers (for watchlist overview)
   */
  async getAllTickers(symbols) {
    return retryWithBackoff(
      async () => {
        const { data } = await client.get('/api/v3/ticker/24hr');
        const symbolSet = new Set(symbols);
        return data
          .filter((t) => symbolSet.has(t.symbol))
          .map((t) => ({
            symbol: t.symbol,
            price: parseFloat(t.lastPrice),
            change24h: parseFloat(t.priceChangePercent),
            volume24h: parseFloat(t.quoteVolume),
          }));
      },
      { label: 'Binance all tickers', retries: 2 }
    );
  },
};
