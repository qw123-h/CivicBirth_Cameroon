import { Request, Response, NextFunction } from 'express';
import { logError } from '../config/logger';
import { config } from '../config/env';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorMiddleware(
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logError('Error occurred', error);

  if (error instanceof AppError) {
    if (config.NODE_ENV === 'development') {
      return res.status(error.statusCode).json({
        error: error.message,
        statusCode: error.statusCode,
        stack: error.stack,
      });
    }

    return res.status(error.statusCode).json({
      error: error.message,
      statusCode: error.statusCode,
    });
  }

  if (config.NODE_ENV === 'development') {
    return res.status(500).json({
      error: error.message || 'Internal server error',
      statusCode: 500,
      stack: error.stack,
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    statusCode: 500,
    code: 'ERR_INTERNAL',
  });
}

export function asyncHandler<TRequest extends Request>(
  fn: (req: TRequest, res: Response, next: NextFunction) => Promise<void> | void,
) {
  return (req: TRequest, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
