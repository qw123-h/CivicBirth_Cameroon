import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { logWarn } from '../config/logger';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      logWarn('Validation error', { errors: result.error.flatten() });
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten(),
      });
    }

    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      logWarn('Query validation error', { errors: result.error.flatten() });
      return res.status(400).json({
        error: 'Query validation failed',
        details: result.error.flatten(),
      });
    }

    req.query = result.data as any;
    next();
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      logWarn('Params validation error', { errors: result.error.flatten() });
      return res.status(400).json({
        error: 'URL parameters validation failed',
        details: result.error.flatten(),
      });
    }

    req.params = result.data as any;
    next();
  };
}
