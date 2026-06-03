import { Router } from 'express';
import { analyticsController } from './analytics.controller';
import {
  authMiddleware,
  requireAuth,
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
  requireAuth,
  analyticsController.getSDGTracker,
);

export default router;
