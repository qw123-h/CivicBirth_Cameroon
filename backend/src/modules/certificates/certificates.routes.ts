import { Router } from 'express';
import { certificatesController } from './certificates.controller';
import {
  authMiddleware,
  requireAuth,
  requireRole,
} from '../../middleware/auth.middleware';
import { validateParams } from '../../middleware/validate.middleware';
import { z } from 'zod';

const router = Router();

const paramIdSchema = z.object({
  id: z.string().uuid(),
});

const paramRegistrationIdSchema = z.object({
  registrationId: z.string().uuid(),
});

router.post(
  '/:registrationId/generate',
  authMiddleware,
  requireRole('NATIONAL_ADMIN', 'MUNICIPAL_REGISTRAR'),
  validateParams(paramRegistrationIdSchema),
  certificatesController.generateCertificate,
);

router.get(
  '/',
  authMiddleware,
  requireRole('NATIONAL_ADMIN', 'REGIONAL_OFFICER', 'MUNICIPAL_REGISTRAR', 'UNICEF_MONITOR'),
  certificatesController.listCertificates,
);

router.get(
  '/:id',
  authMiddleware,
  requireAuth,
  validateParams(paramIdSchema),
  certificatesController.getCertificate,
);

router.get(
  '/:id/download',
  authMiddleware,
  requireRole('NATIONAL_ADMIN', 'REGIONAL_OFFICER', 'MUNICIPAL_REGISTRAR', 'UNICEF_MONITOR'),
  validateParams(paramIdSchema),
  certificatesController.downloadCertificate,
);

export default router;