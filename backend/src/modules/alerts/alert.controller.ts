import { Request, Response } from 'express';
import { alertService } from './alert.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';

export class AlertController {
  checkRegionalTargets = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      // Only allow NATIONAL_ADMIN to manually trigger this check
      if (!req.user || req.user.role !== 'NATIONAL_ADMIN') {
        res.status(403).json({ error: 'Forbidden - insufficient permissions' });
        return;
      }

      await alertService.checkRegionalTargets();
      res.status(200).json({ message: 'Regional target check completed' });
    },
  );

  getActiveAlerts = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // NATIONAL_ADMIN and REGIONAL_OFFICER can see alerts
      // UNICEF_MONITOR and WORLD_BANK_OBSERVER can also see alerts for monitoring
      const allowedRoles = ['NATIONAL_ADMIN', 'REGIONAL_OFFICER', 'UNICEF_MONITOR', 'WORLD_BANK_OBSERVER'];
      
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        res.status(403).json({ error: 'Forbidden - insufficient permissions' });
        return;
      }

      const alerts = await alertService.getActiveAlerts();
      res.status(200).json(alerts);
    },
  );

  resolveAlert = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Only NATIONAL_ADMIN can resolve alerts
      if (req.user.role !== 'NATIONAL_ADMIN') {
        res.status(403).json({ error: 'Forbidden - insufficient permissions' });
        return;
      }

      const { id } = req.params;
      const alert = await alertService.resolveAlert(id, req.user.id);
      res.status(200).json(alert);
    },
  );
}

export const alertController = new AlertController();