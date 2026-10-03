import { ANALYSIS_PROMPT_TEMPLATE } from './analysis.prompt.js';

/**
 * Prompt Builder - Hydrates templates with real data.
 */
export const promptBuilder = {
  /**
   * Build analysis prompt from market data + indicators + signals
   */
  buildAnalysisPrompt(marketData, indicators, signals) {
    let prompt = ANALYSIS_PROMPT_TEMPLATE;

    const replacements = {
      symbol: marketData.symbol || 'UNKNOWN',
      price: marketData.price?.toFixed(2) || '0',
      change24h: marketData.change24h?.toFixed(2) || '0',
      volume24h: this._formatVolume(marketData.volume24h),
      high24h: marketData.high24h?.toFixed(2) || '0',
      low24h: marketData.low24h?.toFixed(2) || '0',

      // Indicators
      sma20: indicators?.sma20?.toFixed(2) || 'N/A',
      sma50: indicators?.sma50?.toFixed(2) || 'N/A',
      ema12: indicators?.ema12?.toFixed(2) || 'N/A',
      ema26: indicators?.ema26?.toFixed(2) || 'N/A',
      rsi14: indicators?.rsi14?.toFixed(1) || 'N/A',
      macdLine: indicators?.macd?.line?.toFixed(2) || 'N/A',
      macdSignal: indicators?.macd?.signal?.toFixed(2) || 'N/A',
      macdHistogram: indicators?.macd?.histogram?.toFixed(2) || 'N/A',
      macdState: indicators?.macdState || 'N/A',
      atr14: indicators?.atr14?.toFixed(2) || 'N/A',
      vwap: indicators?.vwap?.toFixed(2) || 'N/A',
      momentum: indicators?.momentum?.toString() || '0',
      volumeTrend: indicators?.volumeTrend?.trend || 'unknown',
      volumeRatio: indicators?.volumeTrend?.ratio?.toFixed(2) || '1.00',
      volatility: indicators?.volatility?.toString() || '50',
      trendScore: indicators?.trendScore?.toString() || '0',
      trendClass: indicators?.trendClass || 'sideways',
      support: indicators?.support?.toFixed(2) || 'N/A',
      resistance: indicators?.resistance?.toFixed(2) || 'N/A',

      // Signals
      setupType: signals?.setupType || 'no_trade_zone',
      overallTrend: signals?.overallTrend || 'unknown',
      bullishFactors: signals?.bullishFactors?.join('; ') || 'None identified',
      bearishFactors: signals?.bearishFactors?.join('; ') || 'None identified',
      entryLow: signals?.entryZone?.low?.toFixed(2) || '0',
      entryHigh: signals?.entryZone?.high?.toFixed(2) || '0',
      stopLoss: signals?.stopLoss?.toFixed(2) || '0',
      takeProfit: signals?.takeProfit?.map((t) => `$${t.toFixed(2)}`).join(', ') || 'N/A',
      riskReward: signals?.riskReward?.toFixed(2) || '0',
      confidence: signals?.confidence?.toString() || '0',
      invalidation: signals?.invalidation || 'N/A',
    };

    for (const [key, value] of Object.entries(replacements)) {
      prompt = prompt.replaceAll(`{{${key}}}`, value);
    }

    return prompt;
  },

  _formatVolume(vol) {
    if (!vol) return '0';
    if (vol >= 1e9) return `${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `${(vol / 1e6).toFixed(2)}M`;
    if (vol >= 1e3) return `${(vol / 1e3).toFixed(2)}K`;
    return vol.toFixed(2);
  },
};
