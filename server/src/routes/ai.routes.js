import { Router } from 'express';
import { aiController } from '../controllers/ai.controller.js';
import { validateSymbol } from '../middleware/validator.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/:symbol', aiLimiter, validateSymbol, aiController.getAIAnalysis);

export default router;
