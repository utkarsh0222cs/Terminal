import { alertService } from '../services/alert.service.js';
import { createResponse } from '../utils/helpers.js';

export const alertController = {
  async getAlerts(req, res, next) {
    try {
      const { symbol } = req.query;
      const active = req.query.active === 'true';
      const alerts = await alertService.getAlerts({ symbol, active });
      res.json(createResponse(alerts));
    } catch (err) {
      next(err);
    }
  },

  async getAlertsBySymbol(req, res, next) {
    try {
      const { symbol } = req.params;
      const alerts = await alertService.getAlerts({ symbol: symbol.toUpperCase() });
      res.json(createResponse(alerts));
    } catch (err) {
      next(err);
    }
  },

  async acknowledgeAlert(req, res, next) {
    try {
      const { id } = req.params;
      const alert = await alertService.acknowledgeAlert(id);
      if (!alert) {
        return res.status(404).json({ success: false, error: { message: 'Alert not found' } });
      }
      res.json(createResponse(alert));
    } catch (err) {
      next(err);
    }
  },
};
