import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import {
  authMiddleware,
  requireAuth,
  requireRole,
} from '../../middleware/auth.middleware';

const router = Router();

router.get(
  '/summary',
  authMiddleware,
  requireAuth,
  analyticsController.getSummary,
);

router.get(
  '/by-region',
  authMiddleware,
  requireAuth,
  analyticsController.getByRegion,
);

router.get(
  '/by-month',
  authMiddleware,
  requireAuth,
  analyticsController.getByMonth,
);

router.get(
  '/sdg-tracker',
  authMiddleware,
  requireRole('NATIONAL_ADMIN', 'UNICEF_MONITOR', 'WORLD_BANK_OBSERVER'),
  analyticsController.getSDGTracker,
);

export default router;