import { Router } from 'express';
import { marketController } from '../controllers/market.controller.js';
import { validateSymbol, validateCandleQuery } from '../middleware/validator.js';

const router = Router();

router.get('/:symbol', validateSymbol, marketController.getMarketData);
router.get('/:symbol/candles', validateCandleQuery, marketController.getCandles);

export default router;
