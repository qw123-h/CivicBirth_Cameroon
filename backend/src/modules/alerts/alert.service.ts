import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { logInfo, logWarn } from '../../config/logger';
import { BaseService } from '../../core/base.service';

export class AlertService extends BaseService {
  constructor(prismaClient = prisma) {
    super(prismaClient);
  }

  /**
   * Check regional targets and create alerts for regions below 50% of target by 20th of month
   */
  async checkRegionalTargets(): Promise<void> {
    try {
      const now = new Date();
      
      // Only run on the 20th of the month or later
      if (now.getDate() < 20) {
        logInfo('Alert check skipped: Not yet 20th of the month');
        return;
      }
      
      // Get current month start
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Get all regions with their registration counts for current month
      const regions = await this.prisma.region.findMany({
        include: {
          registrations: {
            where: {
              createdAt: {
                gte: monthStart,
              },
            },
          },
        },
      });
      
      const alertsToCreate = [];
      
      for (const region of regions) {
        const registrationCount = region.registrations.length;
        const target = region.monthlyTarget;
        const percentage = target > 0 ? (registrationCount / target) * 100 : 0;
        
        // Check if region is below 50% of target
        if (percentage < 50) {
          // Check if we already created an alert for this region this month
          const existingAlert = await this.prisma.alert.findFirst({
            where: {
              regionId: region.id,
              type: 'REGIONAL_TARGET_MISSED',
              createdAt: {
                gte: monthStart,
              },
            },
          });
          
          if (!existingAlert) {
            alertsToCreate.push({
              regionId: region.id,
              type: 'REGIONAL_TARGET_MISSED',
              message: `Region ${region.nameEn} (${region.nameFr}) has only ${registrationCount}/${target} registrations (${percentage.toFixed(1)}%) for this month, which is below the 50% threshold.`,
              severity: 'HIGH',
            });
          }
        }
      }
      
      // Create alerts
      if (alertsToCreate.length > 0) {
        const alerts = await this.prisma.alert.createMany({
          data: alertsToCreate,
        });
        
        logInfo(`Created ${alerts.count} regional target alerts`);
      } else {
        logInfo('All regions are meeting their targets or already have alerts for this month');
      }
     } catch (error) {
       logWarn('Failed to check regional targets', { error: error instanceof Error ? error.message : 'Unknown error' });
       throw new AppError(500, 'Failed to check regional targets');
     }
  }

  /**
   * Get all active alerts
   */
  async getActiveAlerts() {
    return this.prisma.alert.findMany({
      where: {
        resolved: false,
      },
      include: {
        region: {
          select: {
            id: true,
            nameFr: true,
            nameEn: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(id: string, resolvedById: string) {
    const alert = await this.prisma.alert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new AppError(404, 'Alert not found');
    }

    return this.prisma.alert.update({
      where: { id },
      data: {
        resolved: true,
        resolvedAt: new Date(),
        resolvedById,
      },
    });
  }
}

export const alertService = new AlertService();