import { SETUP_TYPES, TREND_CLASS } from '../config/constants.js';
import { clamp, round } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';

/**
 * Signal/Strategy Engine
 * Interprets computed indicators into actionable structured analysis.
 */
export const signalService = {
  /**
   * Generate full structured analysis from market data + indicators
   * @param {Object} marketData - price, change, volume, etc.
   * @param {Object} indicators - computed indicators snapshot
   * @returns {Object} Structured signal data
   */
  generateSignals(marketData, indicators) {
    if (!indicators) {
      return this._emptySignal(marketData);
    }

    const { price } = marketData;
    const bullishFactors = [];
    const bearishFactors = [];

    // --- Evaluate factors ---

    // Trend
    if (indicators.trendClass === TREND_CLASS.BULLISH) {
      bullishFactors.push(`Overall trend is bullish (score: ${indicators.trendScore})`);
    } else if (indicators.trendClass === TREND_CLASS.BEARISH) {
      bearishFactors.push(`Overall trend is bearish (score: ${indicators.trendScore})`);
    }

    // Price vs EMAs
    if (indicators.ema12 && indicators.ema26) {
      if (indicators.ema12 > indicators.ema26) {
        bullishFactors.push('EMA(12) above EMA(26) — short-term momentum is up');
      } else {
        bearishFactors.push('EMA(12) below EMA(26) — short-term momentum is down');
      }
    }

    // Price vs SMA
    if (indicators.sma20 && price > indicators.sma20) {
      bullishFactors.push('Price above SMA(20) — holding above short-term average');
    } else if (indicators.sma20) {
      bearishFactors.push('Price below SMA(20) — below short-term average');
    }

    if (indicators.sma50 && price > indicators.sma50) {
      bullishFactors.push('Price above SMA(50) — medium-term trend intact');
    } else if (indicators.sma50) {
      bearishFactors.push('Price below SMA(50) — medium-term trend broken');
    }

    // RSI
    if (indicators.rsi14 != null) {
      if (indicators.rsi14 > 70) {
        bearishFactors.push(`RSI at ${indicators.rsi14.toFixed(1)} — overbought territory`);
      } else if (indicators.rsi14 > 60) {
        bullishFactors.push(`RSI at ${indicators.rsi14.toFixed(1)} — bullish momentum`);
      } else if (indicators.rsi14 < 30) {
        bullishFactors.push(`RSI at ${indicators.rsi14.toFixed(1)} — oversold, potential bounce`);
      } else if (indicators.rsi14 < 40) {
        bearishFactors.push(`RSI at ${indicators.rsi14.toFixed(1)} — weak momentum`);
      }
    }

    // MACD
    if (indicators.macd) {
      if (indicators.macdState === 'bullish_strong') {
        bullishFactors.push('MACD bullish with positive histogram — strong upward pressure');
      } else if (indicators.macdState === 'bullish_crossover') {
        bullishFactors.push('MACD bullish crossover — potential trend shift up');
      } else if (indicators.macdState === 'bearish_strong') {
        bearishFactors.push('MACD bearish with negative histogram — strong downward pressure');
      } else if (indicators.macdState === 'bearish_crossover') {
        bearishFactors.push('MACD bearish crossover — potential trend shift down');
      }
    }

    // Volume
    if (indicators.volumeTrend) {
      if (indicators.volumeTrend.trend === 'spike') {
        bullishFactors.push(`Volume spike detected (${indicators.volumeTrend.ratio}x average) — high interest`);
      } else if (indicators.volumeTrend.trend === 'increasing') {
        bullishFactors.push('Volume increasing — building participation');
      } else if (indicators.volumeTrend.trend === 'drying_up') {
        bearishFactors.push('Volume drying up — low participation, potential exhaustion');
      }
    }

    // VWAP
    if (indicators.vwap) {
      if (price > indicators.vwap) {
        bullishFactors.push('Trading above VWAP — bullish intraday bias');
      } else {
        bearishFactors.push('Trading below VWAP — bearish intraday bias');
      }
    }

    // --- Determine setup type ---
    const setupType = this._identifySetup(price, indicators, bullishFactors.length, bearishFactors.length);

    // --- Calculate trade levels ---
    const tradeLevels = this._calculateTradeLevels(price, indicators, setupType);

    // --- Confidence score ---
    const confidence = this._calculateConfidence(indicators, bullishFactors.length, bearishFactors.length, setupType);

    // --- Invalidation ---
    const invalidation = this._getInvalidation(price, indicators, setupType);

    return {
      overallTrend: indicators.trendClass,
      bullishFactors,
      bearishFactors,
      setupType,
      entryZone: tradeLevels.entryZone,
      stopLoss: tradeLevels.stopLoss,
      takeProfit: tradeLevels.takeProfit,
      riskReward: tradeLevels.riskReward,
      confidence,
      invalidation,
    };
  },

  _identifySetup(price, ind, bullCount, bearCount) {
    // Overbought warning
    if (ind.rsi14 > 75) return SETUP_TYPES.OVERBOUGHT;
    // Oversold warning
    if (ind.rsi14 < 25) return SETUP_TYPES.OVERSOLD;

    // Breakout
    if (ind.resistance && price > ind.resistance * 0.998 && ind.volumeTrend?.trend === 'spike') {
      return SETUP_TYPES.BREAKOUT;
    }

    // Pullback setup (price pulled back to support area in an uptrend)
    if (ind.trendClass === TREND_CLASS.BULLISH && ind.support && price < ind.sma20 && price > ind.support * 0.99) {
      return SETUP_TYPES.PULLBACK;
    }

    // Reversal
    if (ind.trendClass === TREND_CLASS.BEARISH && ind.rsi14 < 35 && ind.macdState === 'bullish_crossover') {
      return SETUP_TYPES.REVERSAL;
    }
    if (ind.trendClass === TREND_CLASS.BULLISH && ind.rsi14 > 65 && ind.macdState === 'bearish_crossover') {
      return SETUP_TYPES.REVERSAL;
    }

    // Trend continuation
    if (Math.abs(ind.trendScore) > 40 && bullCount !== bearCount) {
      return SETUP_TYPES.TREND_CONTINUATION;
    }

    // No clear trade
    if (Math.abs(ind.trendScore) < 15 && Math.abs(bullCount - bearCount) <= 1) {
      return SETUP_TYPES.NO_TRADE;
    }

    return SETUP_TYPES.TREND_CONTINUATION;
  },

  _calculateTradeLevels(price, ind, setup) {
    const atr = ind.atr14 || price * 0.02;

    let entryZone, stopLoss, takeProfit, riskReward;

    if (ind.trendClass === TREND_CLASS.BULLISH || setup === SETUP_TYPES.BREAKOUT) {
      entryZone = { low: round(price - atr * 0.3, 2), high: round(price + atr * 0.1, 2) };
      stopLoss = round(price - atr * 1.5, 2);
      takeProfit = [round(price + atr * 1.5, 2), round(price + atr * 2.5, 2), round(price + atr * 4, 2)];
    } else if (ind.trendClass === TREND_CLASS.BEARISH) {
      entryZone = { low: round(price - atr * 0.1, 2), high: round(price + atr * 0.3, 2) };
      stopLoss = round(price + atr * 1.5, 2);
      takeProfit = [round(price - atr * 1.5, 2), round(price - atr * 2.5, 2), round(price - atr * 4, 2)];
    } else {
      entryZone = { low: round(price - atr * 0.2, 2), high: round(price + atr * 0.2, 2) };
      stopLoss = round(price - atr * 1.5, 2);
      takeProfit = [round(price + atr * 1, 2), round(price + atr * 2, 2)];
    }

    const risk = Math.abs(price - stopLoss);
    const reward = Math.abs(takeProfit[0] - price);
    riskReward = risk > 0 ? round(reward / risk, 2) : 0;

    return { entryZone, stopLoss, takeProfit, riskReward };
  },

  _calculateConfidence(ind, bullCount, bearCount, setup) {
    let confidence = 50;

    // Factor alignment
    const factorDiff = Math.abs(bullCount - bearCount);
    confidence += factorDiff * 5;

    // Trend strength
    confidence += Math.abs(ind.trendScore) * 0.2;

    // Volume confirmation
    if (ind.volumeTrend?.trend === 'increasing' || ind.volumeTrend?.trend === 'spike') {
      confidence += 10;
    } else if (ind.volumeTrend?.trend === 'drying_up') {
      confidence -= 15;
    }

    // Setup quality
    if (setup === SETUP_TYPES.NO_TRADE) confidence -= 20;
    if (setup === SETUP_TYPES.OVERBOUGHT || setup === SETUP_TYPES.OVERSOLD) confidence -= 10;

    // RSI extremes reduce confidence
    if (ind.rsi14 > 80 || ind.rsi14 < 20) confidence -= 10;

    return Math.round(clamp(confidence, 10, 95));
  },

  _getInvalidation(price, ind, setup) {
    if (setup === SETUP_TYPES.BREAKOUT) {
      return `Setup invalidated if price falls back below ${ind.resistance?.toFixed(2) || 'resistance'} with increased volume`;
    }
    if (ind.trendClass === TREND_CLASS.BULLISH) {
      return `Bullish thesis invalidated if price closes below ${ind.support?.toFixed(2) || 'support'} or SMA(50) at ${ind.sma50?.toFixed(2) || 'N/A'}`;
    }
    if (ind.trendClass === TREND_CLASS.BEARISH) {
      return `Bearish thesis invalidated if price closes above ${ind.resistance?.toFixed(2) || 'resistance'} or SMA(50) at ${ind.sma50?.toFixed(2) || 'N/A'}`;
    }
    return 'No clear directional thesis to invalidate — market is ranging';
  },

  _emptySignal(marketData) {
    return {
      overallTrend: 'unknown',
      bullishFactors: [],
      bearishFactors: [],
      setupType: SETUP_TYPES.NO_TRADE,
      entryZone: { low: 0, high: 0 },
      stopLoss: 0,
      takeProfit: [],
      riskReward: 0,
      confidence: 0,
      invalidation: 'Insufficient data for analysis',
    };
  },
};
