/**
 * Exponential Moving Average
 * @param {number[]} data - Array of closing prices
 * @param {number} period - EMA period
 * @returns {number} Current EMA value
 */
export const calculateEMA = (data, period) => {
  if (!data || data.length < period) return null;

  const multiplier = 2 / (period + 1);

  // Start with SMA of first 'period' values
  let ema = data.slice(0, period).reduce((sum, v) => sum + v, 0) / period;

  // Apply EMA formula for remaining values
  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
  }

  return ema;
};

/**
 * EMA series (for charting)
 */
export const calculateEMASeries = (data, period) => {
  if (!data || data.length < period) return [];

  const multiplier = 2 / (period + 1);
  const result = [];

  let ema = data.slice(0, period).reduce((sum, v) => sum + v, 0) / period;
  result.push(ema);

  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
    result.push(ema);
  }

  return result;
};
