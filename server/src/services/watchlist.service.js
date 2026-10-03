import { isDatabaseConnected } from '../config/database.js';
import { logger } from '../utils/logger.js';

// In-memory fallback when MongoDB is not available
let inMemoryWatchlist = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'];

export const watchlistService = {
  async getWatchlist(userId = 'default') {
    if (!isDatabaseConnected()) {
      return { userId, symbols: inMemoryWatchlist };
    }

    try {
      const { default: Watchlist } = await import('../models/Watchlist.js');
      let watchlist = await Watchlist.findOne({ userId });
      if (!watchlist) {
        watchlist = await Watchlist.create({
          userId,
          symbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'],
        });
      }
      return watchlist;
    } catch (err) {
      logger.error('Watchlist fetch failed:', err.message);
      return { userId, symbols: inMemoryWatchlist };
    }
  },

  async addSymbol(symbol, userId = 'default') {
    const upperSymbol = symbol.toUpperCase();

    if (!isDatabaseConnected()) {
      if (!inMemoryWatchlist.includes(upperSymbol)) {
        inMemoryWatchlist.push(upperSymbol);
      }
      return { userId, symbols: inMemoryWatchlist };
    }

    try {
      const { default: Watchlist } = await import('../models/Watchlist.js');
      const watchlist = await Watchlist.findOneAndUpdate(
        { userId },
        { $addToSet: { symbols: upperSymbol } },
        { new: true, upsert: true }
      );
      return watchlist;
    } catch (err) {
      logger.error('Watchlist add failed:', err.message);
      if (!inMemoryWatchlist.includes(upperSymbol)) inMemoryWatchlist.push(upperSymbol);
      return { userId, symbols: inMemoryWatchlist };
    }
  },

  async removeSymbol(symbol, userId = 'default') {
    const upperSymbol = symbol.toUpperCase();

    if (!isDatabaseConnected()) {
      inMemoryWatchlist = inMemoryWatchlist.filter((s) => s !== upperSymbol);
      return { userId, symbols: inMemoryWatchlist };
    }

    try {
      const { default: Watchlist } = await import('../models/Watchlist.js');
      const watchlist = await Watchlist.findOneAndUpdate(
        { userId },
        { $pull: { symbols: upperSymbol } },
        { new: true }
      );
      return watchlist || { userId, symbols: [] };
    } catch (err) {
      logger.error('Watchlist remove failed:', err.message);
      inMemoryWatchlist = inMemoryWatchlist.filter((s) => s !== upperSymbol);
      return { userId, symbols: inMemoryWatchlist };
    }
  },
};
