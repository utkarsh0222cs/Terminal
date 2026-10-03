import { clamp } from '../../utils/helpers.js';

/**
 * Momentum score based on rate of change and trend direction.
 * @param {number[]} closes - Closing prices
 * @returns {number} Score from -100 to +100
 */
export const calculateMomentum = (closes) => {
  if (!closes || closes.length < 20) return 0;

  const current = closes[closes.length - 1];

  // Rate of change over multiple periods
  const roc5 = closes.length >= 6 ? ((current - closes[closes.length - 6]) / closes[closes.length - 6]) * 100 : 0;
  const roc10 = closes.length >= 11 ? ((current - closes[closes.length - 11]) / closes[closes.length - 11]) * 100 : 0;
  const roc20 = closes.length >= 21 ? ((current - closes[closes.length - 21]) / closes[closes.length - 21]) * 100 : 0;

  // Weighted composite
  const rawScore = roc5 * 0.5 + roc10 * 0.3 + roc20 * 0.2;

  // Normalize to -100 to +100 range (±10% ROC maps to ±100)
  const normalized = (rawScore / 10) * 100;
  return Math.round(clamp(normalized, -100, 100));
};

/**
 * Volume trend analysis
 * @param {number[]} volumes - Volume data
 * @returns {{ trend: string, ratio: number }}
 */
export const calculateVolumeTrend = (volumes) => {
  if (!volumes || volumes.length < 20) return { trend: 'unknown', ratio: 1 };

  const recentAvg = volumes.slice(-5).reduce((s, v) => s + v, 0) / 5;
  const historicalAvg = volumes.slice(-20, -5).reduce((s, v) => s + v, 0) / 15;

  if (historicalAvg === 0) return { trend: 'unknown', ratio: 1 };

  const ratio = recentAvg / historicalAvg;

  let trend = 'normal';
  if (ratio > 2.0) trend = 'spike';
  else if (ratio > 1.3) trend = 'increasing';
  else if (ratio < 0.5) trend = 'drying_up';
  else if (ratio < 0.7) trend = 'decreasing';

  return { trend, ratio: Math.round(ratio * 100) / 100 };
};
