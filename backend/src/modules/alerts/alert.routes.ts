import { Router } from 'express';
import { alertController } from './alert.controller';
import {
  authMiddleware,
  requireAuth,
  requireRole,
} from '../../middleware/auth.middleware';

const router = Router();

// Protected routes - only for authorized roles
router.post(
  '/check-targets',
  authMiddleware,
  requireRole('NATIONAL_ADMIN'),
  alertController.checkRegionalTargets,
);

router.get(
  '/active',
  authMiddleware,
  requireAuth,
  alertController.getActiveAlerts,
);

router.patch(
  '/:id/resolve',
  authMiddleware,
  requireRole('NATIONAL_ADMIN'),
  alertController.resolveAlert,
);

export default router;