import { Router } from 'express';
import { registrationsController } from './registrations.controller';
import {
  authMiddleware,
  requireAuth,
  requireRole,
} from '../../middleware/auth.middleware';
import { validateBody, validateParams, validateQuery } from '../../middleware/validate.middleware';
import {
  createRegistrationSchema,
  editRegistrationSchema,
  rejectRegistrationSchema,
  listRegistrationsQuerySchema,
} from './registrations.schema';
import { z } from 'zod';

const router = Router();

const paramIdSchema = z.object({
  id: z.string().uuid(),
});

const paramRefNumberSchema = z.object({
  referenceNumber: z.string(),
});

// Protected routes
router.post(
  '/',
  authMiddleware,
  requireRole('NATIONAL_ADMIN', 'MUNICIPAL_REGISTRAR', 'FIELD_AGENT'),
  validateBody(createRegistrationSchema),
  registrationsController.createRegistration,
);

router.get(
  '/',
  authMiddleware,
  requireAuth,
  validateQuery(listRegistrationsQuerySchema),
  registrationsController.listRegistrations,
);

router.get(
  '/:id',
  authMiddleware,
  requireAuth,
  validateParams(paramIdSchema),
  registrationsController.getRegistration,
);

router.patch(
  '/:id/validate',
  authMiddleware,
  requireRole('NATIONAL_ADMIN', 'REGIONAL_OFFICER', 'MUNICIPAL_REGISTRAR'),
  validateParams(paramIdSchema),
  registrationsController.validateRegistration,
);

router.patch(
  '/:id/reject',
  authMiddleware,
  requireRole('NATIONAL_ADMIN', 'REGIONAL_OFFICER', 'MUNICIPAL_REGISTRAR'),
  validateParams(paramIdSchema),
  validateBody(rejectRegistrationSchema),
  registrationsController.rejectRegistration,
);

router.patch(
  '/:id/resubmit',
  authMiddleware,
  requireRole('NATIONAL_ADMIN', 'REGIONAL_OFFICER', 'MUNICIPAL_REGISTRAR', 'FIELD_AGENT'),
  validateParams(paramIdSchema),
  registrationsController.resubmitRegistration,
);

router.patch(
  '/:id',
  authMiddleware,
  requireRole('NATIONAL_ADMIN', 'MUNICIPAL_REGISTRAR', 'FIELD_AGENT'),
  validateParams(paramIdSchema),
  validateBody(editRegistrationSchema),
  registrationsController.updateRegistration,
);

// Public route - no authentication
router.get(
  '/verify/:referenceNumber',
  validateParams(paramRefNumberSchema),
  registrationsController.getPublicRegistration,
);

export default router;
