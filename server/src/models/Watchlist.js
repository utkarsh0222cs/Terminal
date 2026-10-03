import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, default: 'default', index: true },
  symbols: [{ type: String }],
}, { timestamps: true });

watchlistSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model('Watchlist', watchlistSchema);
