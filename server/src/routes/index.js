import { Router } from 'express';
import marketRoutes from './market.routes.js';
import analysisRoutes from './analysis.routes.js';
import aiRoutes from './ai.routes.js';
import watchlistRoutes from './watchlist.routes.js';
import alertRoutes from './alert.routes.js';
import { createResponse } from '../utils/helpers.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json(createResponse({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }));
});

router.use('/market', marketRoutes);
router.use('/analysis', analysisRoutes);
router.use('/ai-analysis', aiRoutes);
router.use('/watchlist', watchlistRoutes);
router.use('/alerts', alertRoutes);

export default router;
