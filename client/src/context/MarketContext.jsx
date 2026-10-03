import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { marketApi, aiApi } from '../services/market.api';

const MarketContext = createContext(null);

export function MarketProvider({ children }) {
  const [activeSymbol, setActiveSymbol] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('1h');
  const [marketData, setMarketData] = useState(null);
  const [candles, setCandles] = useState([]);
  const [indicators, setIndicators] = useState(null);
  const [signals, setSignals] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState({ market: false, candles: false, ai: false });
  const [errors, setErrors] = useState({ market: null, candles: null, ai: null });
  const [lastUpdated, setLastUpdated] = useState(null);
  const abortRef = useRef(null);

  const fetchMarketData = useCallback(async (symbol = activeSymbol) => {
    setLoading(prev => ({ ...prev, market: true }));
    setErrors(prev => ({ ...prev, market: null }));
    try {
      const res = await marketApi.getMarketData(symbol);
      setMarketData(res.data);
      if (res.data.indicators) setIndicators(res.data.indicators);
      setLastUpdated(new Date());
    } catch (err) {
      setErrors(prev => ({ ...prev, market: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, market: false }));
    }
  }, [activeSymbol]);

  const fetchCandles = useCallback(async (symbol = activeSymbol, tf = timeframe) => {
    setLoading(prev => ({ ...prev, candles: true }));
    setErrors(prev => ({ ...prev, candles: null }));
    try {
      const res = await marketApi.getCandles(symbol, tf);
      setCandles(res.data || []);
    } catch (err) {
      setErrors(prev => ({ ...prev, candles: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, candles: false }));
    }
  }, [activeSymbol, timeframe]);

  const fetchAIAnalysis = useCallback(async (symbol = activeSymbol) => {
    setLoading(prev => ({ ...prev, ai: true }));
    setErrors(prev => ({ ...prev, ai: null }));
    try {
      const res = await aiApi.getAIAnalysis(symbol);
      if (res.data) {
        setSignals(res.data.signals);
        setIndicators(res.data.indicators);
        setAiAnalysis(res.data.aiAnalysis);
        setMarketData(prev => prev ? { ...prev, ...res.data.market } : res.data.market);
        setLastUpdated(new Date());
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, ai: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, ai: false }));
    }
  }, [activeSymbol]);

  const switchSymbol = useCallback((symbol) => {
    setActiveSymbol(symbol);
    setMarketData(null);
    setCandles([]);
    setIndicators(null);
    setSignals(null);
    setAiAnalysis(null);
    setErrors({ market: null, candles: null, ai: null });
  }, []);

  return (
    <MarketContext.Provider value={{
      activeSymbol, timeframe, marketData, candles, indicators, signals, aiAnalysis,
      loading, errors, lastUpdated,
      setActiveSymbol: switchSymbol, setTimeframe,
      fetchMarketData, fetchCandles, fetchAIAnalysis,
    }}>
      {children}
    </MarketContext.Provider>
  );
}

export const useMarket = () => {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be used within MarketProvider');
  return ctx;
};
