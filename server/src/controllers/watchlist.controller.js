import { watchlistService } from '../services/watchlist.service.js';
import { marketService } from '../services/market/market.service.js';
import { createResponse } from '../utils/helpers.js';

export const watchlistController = {
  async getWatchlist(req, res, next) {
    try {
      const watchlist = await watchlistService.getWatchlist();

      // Fetch prices for all watchlist symbols
      let prices = [];
      if (watchlist.symbols && watchlist.symbols.length > 0) {
        prices = await marketService.getMultiplePrices(watchlist.symbols);
      }

      res.json(createResponse({
        symbols: watchlist.symbols,
        prices,
      }));
    } catch (err) {
      next(err);
    }
  },

  async addSymbol(req, res, next) {
    try {
      const { symbol } = req.body;
      const watchlist = await watchlistService.addSymbol(symbol);
      res.json(createResponse(watchlist));
    } catch (err) {
      next(err);
    }
  },

  async removeSymbol(req, res, next) {
    try {
      const { symbol } = req.params;
      const watchlist = await watchlistService.removeSymbol(symbol);
      res.json(createResponse(watchlist));
    } catch (err) {
      next(err);
    }
  },
};
