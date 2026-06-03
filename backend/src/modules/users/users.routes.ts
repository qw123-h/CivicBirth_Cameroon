import { Router } from 'express';
import { usersController } from './users.controller';
import {
  authMiddleware,
  requireRole,
} from '../../middleware/auth.middleware';
import { validateParams, validateBody } from '../../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

const paramIdSchema = z.object({
  id: z.string().uuid(),
});

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[!@#$%^&*]/),
  role: z.enum([
    'NATIONAL_ADMIN',
    'REGIONAL_OFFICER',
    'MUNICIPAL_REGISTRAR',
    'FIELD_AGENT',
    'UNICEF_MONITOR',
    'WORLD_BANK_OBSERVER',
  ]),
  regionId: z.string().uuid().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum([
    'NATIONAL_ADMIN',
    'REGIONAL_OFFICER',
    'MUNICIPAL_REGISTRAR',
    'FIELD_AGENT',
    'UNICEF_MONITOR',
    'WORLD_BANK_OBSERVER',
  ]).optional(),
  regionId: z.string().uuid().optional(),
});

router.post(
  '/',
  authMiddleware,
  requireRole('NATIONAL_ADMIN'),
  validateBody(createUserSchema),
  usersController.createUser,
);

router.get(
  '/',
  authMiddleware,
  requireRole('NATIONAL_ADMIN'),
  usersController.listUsers,
);

router.get(
  '/:id',
  authMiddleware,
  requireRole('NATIONAL_ADMIN'),
  validateParams(paramIdSchema),
  usersController.getUser,
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole('NATIONAL_ADMIN'),
  validateParams(paramIdSchema),
  validateBody(updateUserSchema),
  usersController.updateUser,
);

router.patch(
  '/:id/deactivate',
  authMiddleware,
  requireRole('NATIONAL_ADMIN'),
  validateParams(paramIdSchema),
  usersController.deactivateUser,
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole('NATIONAL_ADMIN'),
  validateParams(paramIdSchema),
  usersController.deleteUser,
);

export default router;
