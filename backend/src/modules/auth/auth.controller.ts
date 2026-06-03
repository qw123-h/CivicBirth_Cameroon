import { Request, Response } from 'express';
import { authService } from './auth.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { logInfo } from '../../config/logger';

export class AuthController {
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

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

      const user = await authService.getCurrentUser(req.user.id);

      res.status(200).json({ user });
    },
  );

  logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user) {
      logInfo(`User logged out: ${req.user.email}`);
    }

    res.status(200).json({ message: 'Logged out successfully' });
  });
}

export const authController = new AuthController();
