/**
 * Find Support and Resistance levels using pivot points and price clusters.
 * @param {Array<{high: number, low: number, close: number}>} candles
 * @returns {{ support: number, resistance: number }}
 */
export const findSupportResistance = (candles) => {
  if (!candles || candles.length < 20) return { support: null, resistance: null };

  const recent = candles.slice(-50);
  const currentPrice = recent[recent.length - 1].close;

  // Collect swing lows and swing highs
  const swingLows = [];
  const swingHighs = [];

  for (let i = 2; i < recent.length - 2; i++) {
    const prev2 = recent[i - 2];
    const prev1 = recent[i - 1];
    const curr = recent[i];
    const next1 = recent[i + 1];
    const next2 = recent[i + 2];

    // Swing low: current low is lower than 2 bars on each side
    if (
      curr.low <= prev1.low &&
      curr.low <= prev2.low &&
      curr.low <= next1.low &&
      curr.low <= next2.low
    ) {
      swingLows.push(curr.low);
    }

    // Swing high: current high is higher than 2 bars on each side
    if (
      curr.high >= prev1.high &&
      curr.high >= prev2.high &&
      curr.high >= next1.high &&
      curr.high >= next2.high
    ) {
      swingHighs.push(curr.high);
    }
  }

  // Find nearest support (highest swing low below current price)
  const supports = swingLows.filter((l) => l < currentPrice).sort((a, b) => b - a);
  const support = supports.length > 0 ? supports[0] : recent.reduce((min, c) => Math.min(min, c.low), Infinity);

  // Find nearest resistance (lowest swing high above current price)
  const resistances = swingHighs.filter((h) => h > currentPrice).sort((a, b) => a - b);
  const resistance = resistances.length > 0 ? resistances[0] : recent.reduce((max, c) => Math.max(max, c.high), -Infinity);

  return {
    support: Math.round(support * 100) / 100,
    resistance: Math.round(resistance * 100) / 100,
  };
};
