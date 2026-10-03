/**
 * Average True Range
 * @param {Array<{high: number, low: number, close: number}>} candles
 * @param {number} period - ATR period (default 14)
 * @returns {number} ATR value
 */
export const calculateATR = (candles, period = 14) => {
  if (!candles || candles.length < period + 1) return null;

  const trueRanges = [];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }

  if (trueRanges.length < period) return null;

  // Initial ATR = simple average of first 'period' true ranges
  let atr = trueRanges.slice(0, period).reduce((s, v) => s + v, 0) / period;

  // Smooth using Wilder's method
  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
  }

  return Math.round(atr * 100) / 100;
};
