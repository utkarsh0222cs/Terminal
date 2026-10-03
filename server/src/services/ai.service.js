import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config/index.js';
import { SYSTEM_PROMPT } from '../prompts/system.prompt.js';
import { promptBuilder } from '../prompts/builder.js';
import { cache } from './cache.service.js';
import { logger } from '../utils/logger.js';

let genAI = null;
let model = null;

const initializeGemini = () => {
  if (!config.geminiApiKey || config.geminiApiKey === 'your_gemini_api_key_here') {
    logger.warn('Gemini API key not configured — AI analysis will use fallback mode');
    return false;
  }
  try {
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
    model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    });
    logger.info('Gemini AI initialized successfully');
    return true;
  } catch (err) {
    logger.error('Failed to initialize Gemini:', err.message);
    return false;
  }
};

// Initialize on module load
const geminiReady = initializeGemini();

export const aiService = {
  /**
   * Generate AI analysis for a symbol.
   * Falls back to signal-engine-only data if Gemini is unavailable.
   */
  async generateAnalysis(marketData, indicators, signals) {
    const cacheKey = `ai:${marketData.symbol}`;
    const cached = cache.get(cacheKey);
    if (cached) return { ...cached, _cached: true };

    if (!geminiReady || !model) {
      logger.warn('Gemini not available, using fallback analysis');
      return this._fallbackAnalysis(marketData, indicators, signals);
    }

    try {
      const prompt = promptBuilder.buildAnalysisPrompt(marketData, indicators, signals);
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      let aiData;
      try {
        aiData = JSON.parse(text);
      } catch (parseErr) {
        logger.error('Failed to parse Gemini JSON response:', parseErr.message);
        return this._fallbackAnalysis(marketData, indicators, signals);
      }

      // Validate required fields
      const validated = this._validateAIResponse(aiData);

      const output = {
        ...validated,
        _source: 'gemini',
        _model: 'gemini-1.5-flash',
        _timestamp: new Date().toISOString(),
      };

      cache.set(cacheKey, output, config.cache.analysisTTL);
      return output;
    } catch (err) {
      logger.error('Gemini API call failed:', err.message);
      return this._fallbackAnalysis(marketData, indicators, signals);
    }
  },

  _validateAIResponse(data) {
    return {
      summary: data.summary || 'Analysis unavailable',
      detailedAnalysis: data.detailedAnalysis || 'Detailed analysis could not be generated.',
      bullishCase: data.bullishCase || 'No bullish case identified.',
      bearishCase: data.bearishCase || 'No bearish case identified.',
      suggestedAction: data.suggestedAction || 'Wait',
      riskWarning: data.riskWarning || 'Always manage risk. Never invest more than you can afford to lose.',
      beginnerExplanation: data.beginnerExplanation || 'Market conditions are unclear at this time.',
      scenarios: {
        bullishContinuation: {
          probability: data.scenarios?.bullishContinuation?.probability || 33,
          reasoning: data.scenarios?.bullishContinuation?.reasoning || 'Insufficient data',
          confirmation: data.scenarios?.bullishContinuation?.confirmation || 'N/A',
        },
        rejectionPullback: {
          probability: data.scenarios?.rejectionPullback?.probability || 33,
          reasoning: data.scenarios?.rejectionPullback?.reasoning || 'Insufficient data',
          confirmation: data.scenarios?.rejectionPullback?.confirmation || 'N/A',
        },
        sidewaysConsolidation: {
          probability: data.scenarios?.sidewaysConsolidation?.probability || 34,
          reasoning: data.scenarios?.sidewaysConsolidation?.reasoning || 'Insufficient data',
          confirmation: data.scenarios?.sidewaysConsolidation?.confirmation || 'N/A',
        },
      },
      marketCondition: data.marketCondition || 'Ranging',
      trendBias: data.trendBias || 'Neutral',
      riskLevel: data.riskLevel || 'Medium',
    };
  },

  _fallbackAnalysis(marketData, indicators, signals) {
    const trend = indicators?.trendClass || 'sideways';
    const rsi = indicators?.rsi14;

    let summary = `${marketData.symbol} is currently trading at $${marketData.price?.toFixed(2)} with a ${marketData.change24h?.toFixed(2)}% change in 24h.`;
    if (trend === 'bullish') summary += ' Technical indicators show bullish momentum.';
    else if (trend === 'bearish') summary += ' Technical indicators suggest bearish pressure.';
    else summary += ' The market appears to be consolidating.';

    return {
      summary,
      detailedAnalysis: `Technical analysis shows trend score at ${indicators?.trendScore || 0}/100. RSI is at ${rsi?.toFixed(1) || 'N/A'}, MACD state is ${indicators?.macdState || 'unknown'}. Volume trend is ${indicators?.volumeTrend?.trend || 'unknown'}. The signal engine identifies a ${signals?.setupType || 'no-trade'} setup with ${signals?.confidence || 0}% confidence.`,
      bullishCase: signals?.bullishFactors?.join('. ') || 'No bullish factors identified.',
      bearishCase: signals?.bearishFactors?.join('. ') || 'No bearish factors identified.',
      suggestedAction: signals?.confidence > 60 ? 'Watch for confirmation' : 'Wait',
      riskWarning: 'AI analysis unavailable. This is signal-engine-only output. Always do your own research.',
      beginnerExplanation: `${marketData.symbol} is ${trend === 'bullish' ? 'generally going up' : trend === 'bearish' ? 'generally going down' : 'moving sideways'} right now. The confidence in any particular trade setup is ${signals?.confidence || 0}%.`,
      scenarios: {
        bullishContinuation: { probability: 33, reasoning: 'AI analysis unavailable — equal weight assigned', confirmation: 'N/A' },
        rejectionPullback: { probability: 33, reasoning: 'AI analysis unavailable — equal weight assigned', confirmation: 'N/A' },
        sidewaysConsolidation: { probability: 34, reasoning: 'AI analysis unavailable — equal weight assigned', confirmation: 'N/A' },
      },
      marketCondition: trend === 'bullish' ? 'Trending' : trend === 'bearish' ? 'Trending' : 'Ranging',
      trendBias: trend === 'bullish' ? 'Bullish' : trend === 'bearish' ? 'Bearish' : 'Neutral',
      riskLevel: 'Medium',
      _source: 'fallback',
      _timestamp: new Date().toISOString(),
    };
  },
};
