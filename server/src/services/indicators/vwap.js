/**
 * Volume Weighted Average Price
 * @param {Array<{high: number, low: number, close: number, volume: number}>} candles
 * @returns {number} VWAP value
 */
export const calculateVWAP = (candles) => {
  if (!candles || candles.length === 0) return null;

  let cumulativeTPV = 0; // Typical Price * Volume
  let cumulativeVolume = 0;

  for (const candle of candles) {
    const typicalPrice = (candle.high + candle.low + candle.close) / 3;
    cumulativeTPV += typicalPrice * candle.volume;
    cumulativeVolume += candle.volume;
  }

  if (cumulativeVolume === 0) return null;
  return Math.round((cumulativeTPV / cumulativeVolume) * 100) / 100;
};
