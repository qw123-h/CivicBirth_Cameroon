import { Request, Response, NextFunction } from 'express';
import { logError } from '../config/logger';
import { config } from '../config/env';
import { Prisma } from '@prisma/client';


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

  // Prisma error mapping (so DB constraint errors don't become generic 500s)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint failed
    // PrismaClientKnownRequestError.code is a string, but TypeScript inference can be strict here.
    const prismaCode = (error as Prisma.PrismaClientKnownRequestError).code;

    // P2002: Unique constraint failed
    if (prismaCode === 'P2002') {
      return res.status(409).json({
        error: 'Duplicate value violates a unique constraint',
        statusCode: 409,
        code: prismaCode,
      });
    }

    // P2003: Foreign key constraint failed
    if (prismaCode === 'P2003') {
      return res.status(400).json({
        error: 'Invalid reference value (foreign key constraint)',
        statusCode: 400,
        code: prismaCode,
      });
    }

    return res.status(400).json({
      error: 'Database request failed',
      statusCode: 400,
      code: prismaCode,
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
