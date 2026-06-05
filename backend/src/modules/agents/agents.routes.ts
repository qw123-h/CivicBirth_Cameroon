import { Router } from 'express';
import { agentsController } from './agents.controller';
import {
  authMiddleware,
  requireRole,
} from '../../middleware/auth.middleware';
import { z } from 'zod';
import { validateParams, validateBody } from '../../middleware/validate.middleware';

const router = Router();

const paramIdSchema = z.object({
  id: z.string().uuid(),
});

const createAgentSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  regionId: z.string().uuid(),
  district: z.string().min(1),
  village: z.string().optional(),
});

const updateAgentSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  district: z.string().optional(),
  village: z.string().optional(),
  unicefCertified: z.boolean().optional(),
});

const updateAgentStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
});

router.post(
  '/',
  authMiddleware,
  requireRole('NATIONAL_ADMIN'),
  validateBody(createAgentSchema),
  agentsController.createAgent,
);

router.get(
  '/',
  authMiddleware,
  requireRole('NATIONAL_ADMIN', 'REGIONAL_OFFICER', 'UNICEF_MONITOR'),
  agentsController.listAgents,
);

router.get(
  '/me/performance',
  authMiddleware,
  requireRole('FIELD_AGENT'),
  agentsController.getMyPerformance,
);

router.get(
  '/:id',
  authMiddleware,
  validateParams(paramIdSchema),
  agentsController.getAgent,
);

router.get(
  '/:id/performance',
  authMiddleware,
  requireRole('NATIONAL_ADMIN', 'REGIONAL_OFFICER'),
  validateParams(paramIdSchema),
  agentsController.getAgentPerformance,
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole('MUNICIPAL_REGISTRAR'),
  validateParams(paramIdSchema),
  validateBody(updateAgentSchema),
  agentsController.updateAgent,
);

router.patch(
  '/:id/deactivate',
  authMiddleware,
  requireRole('MUNICIPAL_REGISTRAR'),
  validateParams(paramIdSchema),
  agentsController.deactivateAgent,
);

router.patch(
  '/:id/status',
  authMiddleware,
  requireRole('MUNICIPAL_REGISTRAR'),
  validateParams(paramIdSchema),
  validateBody(updateAgentStatusSchema),
  agentsController.updateAgentStatus,
);

router.post(
  '/:id/reset-password',
  authMiddleware,
  requireRole('MUNICIPAL_REGISTRAR'),
  validateParams(paramIdSchema),
  agentsController.resetAgentPassword,
);

export default router;