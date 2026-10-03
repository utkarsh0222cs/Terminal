import { Router } from 'express';
import { analysisController } from '../controllers/analysis.controller.js';
import { validateSymbol } from '../middleware/validator.js';

const router = Router();

router.get('/:symbol', validateSymbol, analysisController.getAnalysis);

export default router;
