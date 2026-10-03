import { calculateEMA } from './ema.js';

/**
 * MACD - Moving Average Convergence Divergence
 * @param {number[]} data - Array of closing prices
 * @param {number} fastPeriod - Fast EMA period (default 12)
 * @param {number} slowPeriod - Slow EMA period (default 26)
 * @param {number} signalPeriod - Signal EMA period (default 9)
 * @returns {{ line: number, signal: number, histogram: number }}
 */
export const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  if (!data || data.length < slowPeriod + signalPeriod) return null;

  // Build full MACD line series
  const multiplierFast = 2 / (fastPeriod + 1);
  const multiplierSlow = 2 / (slowPeriod + 1);

  let emaFast = data.slice(0, fastPeriod).reduce((s, v) => s + v, 0) / fastPeriod;
  let emaSlow = data.slice(0, slowPeriod).reduce((s, v) => s + v, 0) / slowPeriod;

  const macdLine = [];

  for (let i = slowPeriod; i < data.length; i++) {
    emaFast = (data[i] - emaFast) * multiplierFast + emaFast;
    emaSlow = (data[i] - emaSlow) * multiplierSlow + emaSlow;
    macdLine.push(emaFast - emaSlow);
  }

  if (macdLine.length < signalPeriod) return null;

  // Signal line = EMA of MACD line
  const multiplierSignal = 2 / (signalPeriod + 1);
  let signal = macdLine.slice(0, signalPeriod).reduce((s, v) => s + v, 0) / signalPeriod;

  for (let i = signalPeriod; i < macdLine.length; i++) {
    signal = (macdLine[i] - signal) * multiplierSignal + signal;
  }

  const line = macdLine[macdLine.length - 1];
  const histogram = line - signal;

  return {
    line: Math.round(line * 100) / 100,
    signal: Math.round(signal * 100) / 100,
    histogram: Math.round(histogram * 100) / 100,
  };
};

/**
 * MACD State description
 */
export const getMACDState = (macd) => {
  if (!macd) return 'unknown';
  if (macd.histogram > 0 && macd.line > 0) return 'bullish_strong';
  if (macd.histogram > 0 && macd.line <= 0) return 'bullish_crossover';
  if (macd.histogram < 0 && macd.line < 0) return 'bearish_strong';
  if (macd.histogram < 0 && macd.line >= 0) return 'bearish_crossover';
  return 'neutral';
};
