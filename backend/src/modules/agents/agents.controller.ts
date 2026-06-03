import { Request, Response } from 'express';
import { agentsService } from './agents.service';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../middleware/error.middleware';

export class AgentsController {
  createAgent = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const data = req.body;
      const agent = await agentsService.createAgent(data);

      res.status(201).json(agent);
    },
  );

  listAgents = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.max(
        1,
        Math.min(100, parseInt(req.query.limit as string, 10) || 25),
      );
      const regionId = req.query.regionId as string | undefined;

      const result = await agentsService.listAgents(page, limit, regionId);

      res.status(200).json(result);
    },
  );

  getAgent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const agent = await agentsService.getAgent(id);

    res.status(200).json(agent);
  });

  updateAgent = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const data = req.body;

      const agent = await agentsService.updateAgent(id, data);

      res.status(200).json(agent);
    },
  );

  deactivateAgent = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const agent = await agentsService.deactivateAgent(id);

      res.status(200).json(agent);
    },
  );

  getAgentPerformance = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;

      const result = await agentsService.getAgentPerformance(id);

      res.status(200).json(result);
    },
  );
}

export const agentsController = new AgentsController();
