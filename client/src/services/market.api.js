import api from './api';

export const marketApi = {
  getMarketData: (symbol) => api.get(`/market/${symbol}`),
  getCandles: (symbol, interval = '1h', limit = 200) =>
    api.get(`/market/${symbol}/candles`, { params: { interval, limit } }),
};

export const analysisApi = {
  getAnalysis: (symbol) => api.get(`/analysis/${symbol}`),
};

export const aiApi = {
  getAIAnalysis: (symbol) => api.get(`/ai-analysis/${symbol}`),
};

export const watchlistApi = {
  getWatchlist: () => api.get('/watchlist'),
  addSymbol: (symbol) => api.post('/watchlist', { symbol }),
  removeSymbol: (symbol) => api.delete(`/watchlist/${symbol}`),
};

export const alertApi = {
  getAlerts: (params) => api.get('/alerts', { params }),
  getAlertsBySymbol: (symbol) => api.get(`/alerts/${symbol}`),
  acknowledge: (id) => api.patch(`/alerts/${id}/acknowledge`),
};
