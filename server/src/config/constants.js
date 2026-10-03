export const SUPPORTED_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'MATICUSDT',
  'LINKUSDT', 'UNIUSDT', 'ATOMUSDT', 'LTCUSDT', 'NEARUSDT',
  'APTUSDT', 'ARBUSDT', 'OPUSDT', 'SUIUSDT', 'TONUSDT',
];

export const VALID_INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d'];

export const TREND_CLASS = {
  BULLISH: 'bullish',
  BEARISH: 'bearish',
  SIDEWAYS: 'sideways',
};

export const SETUP_TYPES = {
  BREAKOUT: 'breakout',
  PULLBACK: 'pullback',
  OVERBOUGHT: 'overbought_warning',
  OVERSOLD: 'oversold_warning',
  TREND_CONTINUATION: 'trend_continuation',
  REVERSAL: 'reversal_possibility',
  NO_TRADE: 'no_trade_zone',
};

export const ALERT_TYPES = {
  RSI_OVERBOUGHT: 'rsi_overbought',
  RSI_OVERSOLD: 'rsi_oversold',
  BREAKOUT: 'breakout',
  TREND_CHANGE: 'trend_change',
  VOLUME_SPIKE: 'volume_spike',
};

export const SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
};

// CoinGecko ID mapping for fallback
export const SYMBOL_TO_COINGECKO = {
  BTCUSDT: 'bitcoin',
  ETHUSDT: 'ethereum',
  BNBUSDT: 'binancecoin',
  SOLUSDT: 'solana',
  XRPUSDT: 'ripple',
  ADAUSDT: 'cardano',
  DOGEUSDT: 'dogecoin',
  AVAXUSDT: 'avalanche-2',
  DOTUSDT: 'polkadot',
  MATICUSDT: 'matic-network',
  LINKUSDT: 'chainlink',
  UNIUSDT: 'uniswap',
  ATOMUSDT: 'cosmos',
  LTCUSDT: 'litecoin',
  NEARUSDT: 'near',
  APTUSDT: 'aptos',
  ARBUSDT: 'arbitrum',
  OPUSDT: 'optimism',
  SUIUSDT: 'sui',
  TONUSDT: 'the-open-network',
};
