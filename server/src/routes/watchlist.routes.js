import { Router } from 'express';
import { watchlistController } from '../controllers/watchlist.controller.js';
import { validateWatchlistAdd } from '../middleware/validator.js';

const router = Router();

router.get('/', watchlistController.getWatchlist);
router.post('/', validateWatchlistAdd, watchlistController.addSymbol);
router.delete('/:symbol', watchlistController.removeSymbol);

export default router;
