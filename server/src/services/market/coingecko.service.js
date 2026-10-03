import axios from 'axios';
import config from '../../config/index.js';
import { SYMBOL_TO_COINGECKO } from '../../config/constants.js';
import { retryWithBackoff } from '../../utils/retry.js';
import { logger } from '../../utils/logger.js';

const client = axios.create({
  baseURL: config.coingeckoBaseUrl,
  timeout: 15000,
});

export const coingeckoService = {
  /**
   * Get market data for a symbol (fallback)
   */
  async getMarketData(symbol) {
    const coinId = SYMBOL_TO_COINGECKO[symbol];
    if (!coinId) {
      throw new Error(`No CoinGecko mapping for ${symbol}`);
    }

    return retryWithBackoff(
      async () => {
        const { data } = await client.get('/coins/markets', {
          params: {
            vs_currency: 'usd',
            ids: coinId,
            sparkline: false,
          },
        });

        if (!data || data.length === 0) throw new Error('No data returned');
        const coin = data[0];

        return {
          symbol,
          price: coin.current_price,
          change24h: coin.price_change_percentage_24h,
          volume24h: coin.total_volume,
          high24h: coin.high_24h,
          low24h: coin.low_24h,
          marketCap: coin.market_cap,
          quoteVolume: coin.total_volume,
        };
      },
      { label: `CoinGecko market ${symbol}`, retries: 2 }
    );
  },

  /**
   * Get price history (fallback for candles)
   * Returns OHLC data
   */
  async getOHLC(symbol, days = 7) {
    const coinId = SYMBOL_TO_COINGECKO[symbol];
    if (!coinId) {
      throw new Error(`No CoinGecko mapping for ${symbol}`);
    }

    return retryWithBackoff(
      async () => {
        const { data } = await client.get(`/coins/${coinId}/ohlc`, {
          params: { vs_currency: 'usd', days },
        });

        return data.map((d) => ({
          time: Math.floor(d[0] / 1000),
          open: d[1],
          high: d[2],
          low: d[3],
          close: d[4],
          volume: 0, // OHLC endpoint doesn't include volume
        }));
      },
      { label: `CoinGecko OHLC ${symbol}`, retries: 2 }
    );
  },
};
