import { Request, Response } from 'express';
import { registrationsService } from './registrations.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';
import { CreateRegistrationInput, UpdateRegistrationInput } from './registrations.schema';

export class RegistrationsController {
  createRegistration = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const data = req.body as CreateRegistrationInput;
      const registration = await registrationsService.createRegistration(
        data,
        req.user.id,
      );

      res.status(201).json(registration);
    },
  );

  listRegistrations = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const query = req.query as any;
      const result = await registrationsService.listRegistrations(
        query,
        req.user.id,
        req.user.role,
        req.user.regionId,
      );

      res.status(200).json(result);
    },
  );

  getRegistration = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const registration = await registrationsService.getRegistration(id);

      res.status(200).json(registration);
    },
  );

  validateRegistration = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const registration = await registrationsService.validateRegistration(
        id,
        req.user.id,
      );

      res.status(200).json(registration);
    },
  );

  rejectRegistration = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const { reason } = req.body;

      const registration = await registrationsService.rejectRegistration(
        id,
        reason,
        req.user.id,
      );

      res.status(200).json(registration);
    },
  );

  getPublicRegistration = asyncHandler(async (req: Request, res: Response) => {
    const { referenceNumber } = req.params;
    const registration = await registrationsService.getPublicRegistration(referenceNumber);

    res.status(200).json(registration);
  });
}

export const registrationsController = new RegistrationsController();
