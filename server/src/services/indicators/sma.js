/**
 * Simple Moving Average
 * @param {number[]} data - Array of closing prices
 * @param {number} period - SMA period
 * @returns {number} SMA value
 */
export const calculateSMA = (data, period) => {
  if (!data || data.length < period) return null;
  const slice = data.slice(-period);
  return slice.reduce((sum, val) => sum + val, 0) / period;
};

/**
 * SMA series (for charting)
 */
export const calculateSMASeries = (data, period) => {
  if (!data || data.length < period) return [];
  const result = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const avg = slice.reduce((sum, v) => sum + v, 0) / period;
    result.push(avg);
  }
  return result;
};
