export const API_BASE = '/api';

export const SUPPORTED_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT',
  'LINKUSDT', 'UNIUSDT', 'ATOMUSDT', 'LTCUSDT', 'NEARUSDT',
  'APTUSDT', 'ARBUSDT', 'OPUSDT', 'SUIUSDT', 'TONUSDT',
];

export const TIMEFRAMES = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1H', value: '1h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1d' },
];

export const SYMBOL_NAMES = {
  BTCUSDT: 'Bitcoin', ETHUSDT: 'Ethereum', BNBUSDT: 'BNB',
  SOLUSDT: 'Solana', XRPUSDT: 'XRP', ADAUSDT: 'Cardano',
  DOGEUSDT: 'Dogecoin', AVAXUSDT: 'Avalanche', DOTUSDT: 'Polkadot',
  MATICUSDT: 'Polygon', LINKUSDT: 'Chainlink', UNIUSDT: 'Uniswap',
  ATOMUSDT: 'Cosmos', LTCUSDT: 'Litecoin', NEARUSDT: 'NEAR',
  APTUSDT: 'Aptos', ARBUSDT: 'Arbitrum', OPUSDT: 'Optimism',
  SUIUSDT: 'Sui', TONUSDT: 'TON',
};

export const formatCurrency = (value, decimals = 2) => {
  if (value == null || isNaN(value)) return '$0.00';
  if (Math.abs(value) >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (Math.abs(value) >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${Number(value).toFixed(decimals)}`;
};

export const formatNumber = (value, decimals = 2) => {
  if (value == null || isNaN(value)) return '0';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatPercent = (value) => {
  if (value == null || isNaN(value)) return '0.00%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${Number(value).toFixed(2)}%`;
};
