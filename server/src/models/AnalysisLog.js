import mongoose from 'mongoose';

const analysisLogSchema = new mongoose.Schema({
  symbol: { type: String, required: true, index: true },
  indicators: mongoose.Schema.Types.Mixed,
  signals: mongoose.Schema.Types.Mixed,
  aiAnalysis: mongoose.Schema.Types.Mixed,
  modelUsed: String,
  source: String,
  timestamp: { type: Date, default: Date.now },
}, { timestamps: false });

analysisLogSchema.index({ symbol: 1, timestamp: -1 });

export default mongoose.model('AnalysisLog', analysisLogSchema);
