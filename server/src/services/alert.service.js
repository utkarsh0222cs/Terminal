import { isDatabaseConnected } from '../config/database.js';
import { ALERT_TYPES, SEVERITY } from '../config/constants.js';
import { logger } from '../utils/logger.js';

// In-memory alert store when DB is unavailable
let inMemoryAlerts = [];
let alertIdCounter = 1;

export const alertService = {
  /**
   * Check indicators against alert thresholds and generate alerts
   */
  checkAndGenerateAlerts(symbol, indicators, prevIndicators = null) {
    const newAlerts = [];

    if (!indicators) return newAlerts;

    // RSI Overbought
    if (indicators.rsi14 > 70) {
      newAlerts.push({
        symbol,
        type: ALERT_TYPES.RSI_OVERBOUGHT,
        condition: `RSI reached ${indicators.rsi14.toFixed(1)} — overbought territory`,
        triggerValue: indicators.rsi14,
        threshold: 70,
        severity: indicators.rsi14 > 80 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
      });
    }

    // RSI Oversold
    if (indicators.rsi14 < 30) {
      newAlerts.push({
        symbol,
        type: ALERT_TYPES.RSI_OVERSOLD,
        condition: `RSI dropped to ${indicators.rsi14.toFixed(1)} — oversold territory`,
        triggerValue: indicators.rsi14,
        threshold: 30,
        severity: indicators.rsi14 < 20 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
      });
    }

    // Volume Spike
    if (indicators.volumeTrend?.trend === 'spike') {
      newAlerts.push({
        symbol,
        type: ALERT_TYPES.VOLUME_SPIKE,
        condition: `Volume spike detected at ${indicators.volumeTrend.ratio}x average`,
        triggerValue: indicators.volumeTrend.ratio,
        threshold: 2.0,
        severity: SEVERITY.INFO,
      });
    }

    // Trend Change (compare with previous)
    if (prevIndicators && prevIndicators.trendClass !== indicators.trendClass) {
      const isBullishShift = indicators.trendClass === 'bullish';
      newAlerts.push({
        symbol,
        type: ALERT_TYPES.TREND_CHANGE,
        condition: `Trend changed from ${prevIndicators.trendClass} to ${indicators.trendClass}`,
        triggerValue: indicators.trendScore,
        threshold: 25,
        severity: SEVERITY.CRITICAL,
      });
    }

    return newAlerts;
  },

  async saveAlerts(alerts) {
    if (!alerts || alerts.length === 0) return;

    const timestampedAlerts = alerts.map((a) => ({
      ...a,
      triggered: true,
      triggeredAt: new Date(),
      acknowledged: false,
      createdAt: new Date(),
    }));

    if (!isDatabaseConnected()) {
      timestampedAlerts.forEach((a) => {
        a._id = `alert_${alertIdCounter++}`;
        inMemoryAlerts.unshift(a);
      });
      // Keep max 100 alerts in memory
      if (inMemoryAlerts.length > 100) inMemoryAlerts = inMemoryAlerts.slice(0, 100);
      return timestampedAlerts;
    }

    try {
      const { default: Alert } = await import('../models/Alert.js');
      const saved = await Alert.insertMany(timestampedAlerts);
      return saved;
    } catch (err) {
      logger.error('Failed to save alerts:', err.message);
      return timestampedAlerts;
    }
  },

  async getAlerts(query = {}) {
    if (!isDatabaseConnected()) {
      let filtered = [...inMemoryAlerts];
      if (query.symbol) filtered = filtered.filter((a) => a.symbol === query.symbol);
      if (query.active) filtered = filtered.filter((a) => !a.acknowledged);
      return filtered.slice(0, 50);
    }

    try {
      const { default: Alert } = await import('../models/Alert.js');
      const filter = {};
      if (query.symbol) filter.symbol = query.symbol;
      if (query.active) filter.acknowledged = false;
      return await Alert.find(filter).sort({ createdAt: -1 }).limit(50);
    } catch (err) {
      logger.error('Failed to fetch alerts:', err.message);
      return inMemoryAlerts.slice(0, 50);
    }
  },

  async acknowledgeAlert(alertId) {
    if (!isDatabaseConnected()) {
      const alert = inMemoryAlerts.find((a) => a._id === alertId);
      if (alert) alert.acknowledged = true;
      return alert;
    }

    try {
      const { default: Alert } = await import('../models/Alert.js');
      return await Alert.findByIdAndUpdate(alertId, { acknowledged: true }, { new: true });
    } catch (err) {
      logger.error('Failed to acknowledge alert:', err.message);
      return null;
    }
  },
};
