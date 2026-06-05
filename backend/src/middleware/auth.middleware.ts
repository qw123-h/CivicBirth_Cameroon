import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { prisma } from '../config/database';
import { logDebug, logWarn } from '../config/logger';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    regionId: string | null;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, config.JWT_SECRET) as {
      id: string;
      email?: string;
      role?: string;
      regionId?: string | null;
      source?: string;
    };

    // Handle agent tokens (source === 'agent')
    if (decoded.source === 'agent') {
      const agent = await prisma.agent.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          regionId: true,
          status: true,
        },
      });

      if (!agent || agent.status !== 'ACTIVE') {
        return res.status(401).json({ error: 'Agent not found or inactive' });
      }

      (req as any).authSource = 'agent';
      req.user = {
        id: agent.id,
        email: agent.email || '',
        role: 'FIELD_AGENT',
        regionId: agent.regionId,
      };
      logDebug(`Agent authenticated: ${agent.email}`);
      next();
      return;
    }

    // Standard user token
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        regionId: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    (req as any).authSource = 'user';
    req.user = user as any;
    logDebug(`User authenticated: ${user.email}`);
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    logWarn('Auth middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden - insufficient permissions' });
    }

    next();
  };
}
