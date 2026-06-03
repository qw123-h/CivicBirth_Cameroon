import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

export type RolePermissions = Record<string, string[]>;

export const rolePermissions: RolePermissions = {
  NATIONAL_ADMIN: ['*'],
  REGIONAL_OFFICER: [
    'registrations.view_regional',
    'registrations.validate',
    'certificates.issue',
    'analytics.view_regional',
    'agents.view_regional',
  ],
  MUNICIPAL_REGISTRAR: [
    'registrations.create',
    'registrations.view_municipal',
    'registrations.validate',
    'certificates.generate',
    'certificates.issue',
    'analytics.view_municipal',
  ],
  FIELD_AGENT: [
    'registrations.create',
    'registrations.view_own',
    'certificates.view_own',
  ],
  UNICEF_MONITOR: [
    'registrations.view',
    'analytics.view',
    'agents.view',
  ],
  WORLD_BANK_OBSERVER: [
    'analytics.view',
    'registrations.view',
  ],
};

export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userRole = req.user.role;
    const permissions = rolePermissions[userRole] || [];

    if (permissions.includes('*') || permissions.includes(permission)) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden - insufficient permissions' });
    }
  };
}

export function getPermissions(role: string): string[] {
  return rolePermissions[role] || [];
}

export function hasPermission(role: string, permission: string): boolean {
  const permissions = getPermissions(role);
  return permissions.includes('*') || permissions.includes(permission);
}
