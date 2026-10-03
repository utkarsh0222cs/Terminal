export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const round = (value, decimals = 2) =>
  Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const safeParseFloat = (val, fallback = 0) => {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? fallback : parsed;
};

export const percentChange = (oldVal, newVal) => {
  if (oldVal === 0) return 0;
  return ((newVal - oldVal) / oldVal) * 100;
};

export const createResponse = (data, meta = {}) => ({
  success: true,
  data,
  meta: {
    timestamp: new Date().toISOString(),
    ...meta,
  },
});

export const createErrorResponse = (message, code = 500) => ({
  success: false,
  error: { message, code },
  meta: { timestamp: new Date().toISOString() },
});
