import { clamp } from '../../utils/helpers.js';

/**
 * Volatility score based on ATR and price range.
 * @param {Array<{high: number, low: number, close: number}>} candles
 * @param {number} atr - Pre-computed ATR
 * @returns {number} Score 0-100
 */
export const calculateVolatility = (candles, atr) => {
  if (!candles || candles.length < 14 || atr == null) return 50;

  const currentPrice = candles[candles.length - 1].close;
  if (currentPrice === 0) return 50;

  // ATR as percentage of price
  const atrPercent = (atr / currentPrice) * 100;

  // Map: 0% → 0 score, 1% → 25, 3% → 50, 5% → 75, 8%+ → 100
  let score;
  if (atrPercent <= 1) score = atrPercent * 25;
  else if (atrPercent <= 3) score = 25 + ((atrPercent - 1) / 2) * 25;
  else if (atrPercent <= 5) score = 50 + ((atrPercent - 3) / 2) * 25;
  else score = 75 + ((atrPercent - 5) / 3) * 25;

  return Math.round(clamp(score, 0, 100));
};
