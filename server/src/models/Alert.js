import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true },
  type: { type: String, required: true },
  condition: String,
  triggered: { type: Boolean, default: true },
  triggerValue: Number,
  threshold: Number,
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
  acknowledged: { type: Boolean, default: false },
  triggeredAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

alertSchema.index({ symbol: 1, triggered: 1, createdAt: -1 });

export default mongoose.model('Alert', alertSchema);
