import { Router } from 'express';
import { alertController } from '../controllers/alert.controller.js';

const router = Router();

router.get('/', alertController.getAlerts);
router.get('/:symbol', alertController.getAlertsBySymbol);
router.patch('/:id/acknowledge', alertController.acknowledgeAlert);

export default router;
