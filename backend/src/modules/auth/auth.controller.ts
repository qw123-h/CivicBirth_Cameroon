import { Request, Response } from 'express';
import { authService } from './auth.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { logInfo } from '../../config/logger';
import { prisma } from '../../config/database';

export class AuthController {
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    // Rule 7: Immutable audit trail — log successful login
    prisma.auditLog
      .create({
        data: {
          userId: result.user.id,
          action: 'LOGIN',
          targetTable: 'user',
          targetId: result.user.id,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        },
      })
      .catch(() => {});

    res.status(200).json(result);
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const result = await authService.refreshAccessToken(refreshToken);

    res.status(200).json(result);
  });

  getCurrentUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const source = (req as any).authSource as 'user' | 'agent' | undefined;
      const user = await authService.getCurrentUser(req.user.id, source);

      res.status(200).json({ user });
    },
  );

  logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user) {
      logInfo(`User logged out: ${req.user.email}`);

      // Rule 7: Immutable audit trail — log logout
      prisma.auditLog
        .create({
          data: {
            userId: req.user.id,
            action: 'LOGOUT',
            targetTable: 'user',
            targetId: req.user.id,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
          },
        })
        .catch(() => {});
    }

    res.status(200).json({ message: 'Logged out successfully' });
  });
}

export const authController = new AuthController();
