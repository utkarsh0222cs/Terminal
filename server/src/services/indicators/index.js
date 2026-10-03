import { calculateSMA } from './sma.js';
import { calculateEMA } from './ema.js';
import { calculateRSI } from './rsi.js';
import { calculateMACD, getMACDState } from './macd.js';
import { calculateATR } from './atr.js';
import { calculateVWAP } from './vwap.js';
import { findSupportResistance } from './support-resistance.js';
import { calculateMomentum, calculateVolumeTrend } from './momentum.js';
import { calculateVolatility } from './volatility.js';
import { clamp } from '../../utils/helpers.js';
import config from '../../config/index.js';
import { TREND_CLASS } from '../../config/constants.js';

/**
 * Compute all indicators from candle data.
 * @param {Array<{time, open, high, low, close, volume}>} candles
 * @returns {Object} Full indicator snapshot
 */
export const computeAllIndicators = (candles) => {
  if (!candles || candles.length < 30) {
    return null;
  }

  const closes = candles.map((c) => c.close);
  const volumes = candles.map((c) => c.volume);
  const { smaPeriods, emaFast, emaSlow, rsiPeriod, macdFast, macdSlow, macdSignal, atrPeriod } = config.indicators;

  // Core indicators
  const sma20 = calculateSMA(closes, smaPeriods[0]);
  const sma50 = calculateSMA(closes, smaPeriods[1]);
  const ema12 = calculateEMA(closes, emaFast);
  const ema26 = calculateEMA(closes, emaSlow);
  const rsi14 = calculateRSI(closes, rsiPeriod);
  const macd = calculateMACD(closes, macdFast, macdSlow, macdSignal);
  const atr14 = calculateATR(candles, atrPeriod);
  const vwap = calculateVWAP(candles.slice(-50));
  const { support, resistance } = findSupportResistance(candles);
  const momentum = calculateMomentum(closes);
  const volumeTrend = calculateVolumeTrend(volumes);
  const volatility = calculateVolatility(candles, atr14);
  const macdState = getMACDState(macd);

  // Trend classification
  const { score: trendScore, class: trendClass } = classifyTrend({
    closes, sma20, sma50, ema12, ema26, rsi14, macd, momentum,
  });

  return {
    sma20: round(sma20),
    sma50: round(sma50),
    ema12: round(ema12),
    ema26: round(ema26),
    rsi14: round(rsi14),
    macd,
    macdState,
    atr14: round(atr14),
    vwap: round(vwap),
    support,
    resistance,
    momentum,
    volumeTrend,
    volatility,
    trendScore,
    trendClass,
  };
};

/**
 * Classify overall trend from indicators
 */
function classifyTrend({ closes, sma20, sma50, ema12, ema26, rsi14, macd, momentum }) {
  if (!closes || closes.length === 0) return { score: 0, class: TREND_CLASS.SIDEWAYS };

  const price = closes[closes.length - 1];
  let score = 0;

  // Price vs MAs
  if (sma20 && price > sma20) score += 15; else if (sma20) score -= 15;
  if (sma50 && price > sma50) score += 10; else if (sma50) score -= 10;
  if (ema12 && ema26 && ema12 > ema26) score += 15; else if (ema12 && ema26) score -= 15;

  // SMA slope
  if (sma20 && sma50 && sma20 > sma50) score += 10; else if (sma20 && sma50) score -= 10;

  // RSI bias
  if (rsi14 != null) {
    if (rsi14 > 60) score += 10;
    else if (rsi14 > 50) score += 5;
    else if (rsi14 < 40) score -= 10;
    else if (rsi14 < 50) score -= 5;
  }

  // MACD bias
  if (macd) {
    if (macd.histogram > 0) score += 15;
    else score -= 15;
    if (macd.line > 0) score += 5;
    else score -= 5;
  }

  // Momentum
  score += Math.round(momentum * 0.2);

  score = clamp(score, -100, 100);

  let trendClass = TREND_CLASS.SIDEWAYS;
  if (score >= 25) trendClass = TREND_CLASS.BULLISH;
  else if (score <= -25) trendClass = TREND_CLASS.BEARISH;

  return { score, class: trendClass };
}

function round(val) {
  if (val == null) return null;
  return Math.round(val * 100) / 100;
}
