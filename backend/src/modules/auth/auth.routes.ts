import { Router } from 'express';
import { z } from 'zod';
import { authController } from './auth.controller';
import { validateBody } from '../../middleware/validate.middleware';
import { authMiddleware, requireAuth } from '../../middleware/auth.middleware';

const router = Router();

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

router.post('/login', validateBody(loginSchema), authController.login);

router.post('/refresh', validateBody(refreshSchema), authController.refresh);

router.get(
  '/me',
  authMiddleware,
  requireAuth,
  authController.getCurrentUser,
);

router.post(
  '/logout',
  authMiddleware,
  requireAuth,
  authController.logout,
);

export default router;
