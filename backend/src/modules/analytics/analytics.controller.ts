import { Request, Response } from 'express';
import { analyticsService } from './analytics.service';
import { asyncHandler } from '../../middleware/error.middleware';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class AnalyticsController {
  getSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const summary = await analyticsService.getSummary();

    res.status(200).json(summary);
  });

  getByRegion = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const data = await analyticsService.getByRegion();

      res.status(200).json(data);
    },
  );

  getByMonth = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const months = parseInt(req.query.months as string, 10) || 12;
      const data = await analyticsService.getByMonth(
        Math.max(1, Math.min(60, months)),
      );

      res.status(200).json(data);
    },
  );

  getSDGTracker = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const data = await analyticsService.getSDGTracker();

      res.status(200).json(data);
    },
  );
}

export const analyticsController = new AnalyticsController();
