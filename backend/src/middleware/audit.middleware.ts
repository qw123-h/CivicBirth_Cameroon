import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { prisma } from '../config/database';
import { logDebug } from '../config/logger';

export interface AuditRequest extends AuthenticatedRequest {
  auditData?: {
    action: string;
    targetTable: string;
    targetId?: string;
    oldValue?: any;
    newValue?: any;
  };
}

export async function auditMiddleware(
  req: AuditRequest,
  res: Response,
  next: NextFunction,
) {
  const originalJson = res.json;

  res.json = function (data: any) {
    if (
      req.user &&
      (req.method === 'POST' ||
        req.method === 'PATCH' ||
        req.method === 'DELETE' ||
        req.path.includes('/validate') ||
        req.path.includes('/reject') ||
        req.path.includes('/export'))
    ) {
      // Map action based on request
      let action = 'CREATE';
      if (req.method === 'PATCH') action = 'UPDATE';
      if (req.method === 'DELETE') action = 'DELETE';
      if (req.path.includes('/validate')) action = 'VALIDATE';
      if (req.path.includes('/reject')) action = 'REJECT';
      if (req.path.includes('/export')) action = 'EXPORT';

      const targetTable = req.path.split('/')[2] || 'unknown';
      const targetId = req.params.id;
      const ipAddress = req.ip;
      const userAgent = req.get('user-agent');

      // Queue async audit logging
      prisma.auditLog
        .create({
          data: {
            userId: req.user.id,
            action: action as any,
            targetTable,
            targetId,
            newValue: req.method === 'POST' || req.method === 'PATCH' ? req.body : null,
            ipAddress,
            userAgent,
          },
        })
        .catch((err: unknown) => {
          logDebug('Audit log creation failed', {
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        });
    }

    return originalJson.call(this, data);
  };

  next();
}
