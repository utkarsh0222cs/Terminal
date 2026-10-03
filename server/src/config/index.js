import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/sigma-terminal',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  binanceBaseUrl: process.env.BINANCE_BASE_URL || 'https://api.binance.com',
  coingeckoBaseUrl: process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',

  // Cache TTLs (ms)
  cache: {
    priceTTL: 30 * 1000,       // 30s
    candleTTL: 5 * 60 * 1000,  // 5min
    analysisTTL: 60 * 1000,    // 60s
  },

  // Rate limits
  rateLimit: {
    windowMs: 60 * 1000,
    maxRequests: 100,
  },

  // Indicator defaults
  indicators: {
    smaPeriods: [20, 50],
    emaFast: 12,
    emaSlow: 26,
    rsiPeriod: 14,
    macdFast: 12,
    macdSlow: 26,
    macdSignal: 9,
    atrPeriod: 14,
  },
};

export default config;
