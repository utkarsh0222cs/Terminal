export const formatCurrency = (value, decimals = 2) => {
  if (value == null || isNaN(value)) return '$0.00';
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${Number(value).toFixed(decimals)}`;
};

export const formatPercent = (value, decimals = 2) => {
  if (value == null || isNaN(value)) return '0.00%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${Number(value).toFixed(decimals)}%`;
};

export const formatNumber = (value, decimals = 2) => {
  if (value == null || isNaN(value)) return '0';
  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const normalizeSymbol = (symbol) => {
  return symbol.toUpperCase().replace(/[^A-Z]/g, '');
};

export const parseBinanceKline = (kline) => ({
  time: Math.floor(kline[0] / 1000),
  open: parseFloat(kline[1]),
  high: parseFloat(kline[2]),
  low: parseFloat(kline[3]),
  close: parseFloat(kline[4]),
  volume: parseFloat(kline[5]),
});
