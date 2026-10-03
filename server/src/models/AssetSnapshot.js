import mongoose from 'mongoose';

const assetSnapshotSchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true },
  price: Number,
  change24h: Number,
  volume24h: Number,
  high24h: Number,
  low24h: Number,
  marketCap: Number,
  indicators: {
    sma20: Number,
    sma50: Number,
    ema12: Number,
    ema26: Number,
    rsi14: Number,
    macd: {
      line: Number,
      signal: Number,
      histogram: Number,
    },
    atr14: Number,
    vwap: Number,
    momentum: Number,
    volatility: Number,
    trendScore: Number,
    trendClass: String,
    support: Number,
    resistance: Number,
  },
  timestamp: { type: Date, default: Date.now, index: true },
}, { timestamps: false });

assetSnapshotSchema.index({ symbol: 1, timestamp: -1 });
// Auto-expire after 24 hours
assetSnapshotSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model('AssetSnapshot', assetSnapshotSchema);
