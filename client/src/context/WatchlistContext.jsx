import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { watchlistApi } from '../services/market.api';

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const [symbols, setSymbols] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWatchlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await watchlistApi.getWatchlist();
      if (res.data) {
        setSymbols(res.data.symbols || []);
        setPrices(res.data.prices || []);
      }
    } catch (err) {
      console.error('Watchlist fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addSymbol = useCallback(async (symbol) => {
    try {
      await watchlistApi.addSymbol(symbol);
      fetchWatchlist();
    } catch (err) {
      console.error('Add to watchlist failed:', err.message);
    }
  }, [fetchWatchlist]);

  const removeSymbol = useCallback(async (symbol) => {
    try {
      await watchlistApi.removeSymbol(symbol);
      fetchWatchlist();
    } catch (err) {
      console.error('Remove from watchlist failed:', err.message);
    }
  }, [fetchWatchlist]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  return (
    <WatchlistContext.Provider value={{ symbols, prices, loading, fetchWatchlist, addSymbol, removeSymbol }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export const useWatchlist = () => {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used within WatchlistProvider');
  return ctx;
};
