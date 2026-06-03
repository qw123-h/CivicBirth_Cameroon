import { Request, Response } from 'express';
import { usersService } from './users.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';

export class UsersController {
  createUser = asyncHandler(async (req: Request, res: Response) => {
    const data = req.body;
    const user = await usersService.createUser(data);

    res.status(201).json(user);
  });

  listUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(
      1,
      Math.min(100, parseInt(req.query.limit as string, 10) || 25),
    );

    const result = await usersService.listUsers(page, limit);

    res.status(200).json(result);
  });

  getUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const user = await usersService.getUser(id);

    res.status(200).json(user);
  });

  updateUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const data = req.body;

      const user = await usersService.updateUser(id, data);

      res.status(200).json(user);
    },
  );

  deactivateUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const user = await usersService.deactivateUser(id);

      res.status(200).json(user);
    },
  );

  deleteUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const result = await usersService.deleteUser(id);

      res.status(200).json(result);
    },
  );
}

export const usersController = new UsersController();
