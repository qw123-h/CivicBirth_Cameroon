import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { BaseService } from '../../core/base.service';

export class AnalyticsService extends BaseService {
  constructor(prismaClient = prisma) {
    super(prismaClient);
  }

  async getSummary() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [
      totalAllTime,
      totalThisMonth,
      totalThisYear,
      pendingCount,
      validatedCount,
      rejectedCount,
      certificateIssuedCount,
      maleCount,
      femaleCount,
      webCount,
      ussdCount,
      smsCount,
    ] = await Promise.all([
      this.prisma.birthRegistration.count(),
      this.prisma.birthRegistration.count({
        where: { createdAt: { gte: monthStart } },
      }),
      this.prisma.birthRegistration.count({
        where: { createdAt: { gte: yearStart } },
      }),
      this.prisma.birthRegistration.count({ where: { status: 'PENDING' } }),
      this.prisma.birthRegistration.count({ where: { status: 'VALIDATED' } }),
      this.prisma.birthRegistration.count({ where: { status: 'REJECTED' } }),
      this.prisma.birthRegistration.count({
        where: { status: 'CERTIFICATE_ISSUED' },
      }),
      this.prisma.birthRegistration.count({ where: { childSex: 'MALE' } }),
      this.prisma.birthRegistration.count({ where: { childSex: 'FEMALE' } }),
      this.prisma.birthRegistration.count({ where: { channel: 'WEB' } }),
      this.prisma.birthRegistration.count({ where: { channel: 'USSD' } }),
      this.prisma.birthRegistration.count({ where: { channel: 'SMS' } }),
    ]);

    const monthlyTarget = await this.prisma.region.aggregate({
      _sum: { monthlyTarget: true },
    });

    const monthlyTargetValue = monthlyTarget._sum.monthlyTarget ?? 0;

    return {
      totalAllTime,
      totalThisMonth,
      totalThisYear,
      statusDistribution: {
        pending: pendingCount,
        validated: validatedCount,
        rejected: rejectedCount,
        certificateIssued: certificateIssuedCount,
      },
      genderDistribution: {
        male: maleCount,
        female: femaleCount,
        malePercentage: ((maleCount / (maleCount + femaleCount)) * 100).toFixed(1),
        femalePercentage: ((femaleCount / (maleCount + femaleCount)) * 100).toFixed(1),
      },
      byChannel: {
        web: webCount,
        ussd: ussdCount,
        sms: smsCount,
      },
      monthlyTarget: {
        target: monthlyTargetValue,
        achieved: totalThisMonth,
        percentage: monthlyTargetValue > 0 ? ((totalThisMonth / monthlyTargetValue) * 100).toFixed(1) : 0,
      },
    };
  }

  async getByRegion() {
    const regions = await this.prisma.region.findMany({
      include: {
        registrations: {
          where: {
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        },
      },
    });

    return regions.map((region: any) => ({
      regionCode: region.code,
      nameFr: region.nameFr,
      nameEn: region.nameEn,
      count: region.registrations.length,
      target: region.monthlyTarget,
      percentage:
        region.monthlyTarget > 0
          ? ((region.registrations.length / region.monthlyTarget) * 100).toFixed(1)
          : 0,
      status:
        region.registrations.length >= region.monthlyTarget
          ? 'on-track'
          : region.registrations.length >= region.monthlyTarget * 0.5
            ? 'at-risk'
            : 'critical',
    }));
  }

  async getByMonth(months: number = 12) {
    const data: any[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const count = await this.prisma.birthRegistration.count({
        where: {
          createdAt: {
            gte: new Date(date.getFullYear(), date.getMonth(), 1),
            lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
          },
        },
      });

      data.push({
        month: date.toISOString().substring(0, 7),
        count,
      });
    }

    return data;
  }

  async getSDGTracker() {
    // Estimated population for Cameroon regions (simplified)
    const populationEstimates: Record<string, number> = {
      'CM-AD': 1300000,
      'CM-CE': 3500000,
      'CM-ES': 800000,
      'CM-EN': 2100000,
      'CM-LT': 2800000,
      'CM-NO': 1700000,
      'CM-NW': 2000000,
      'CM-OU': 2200000,
      'CM-SU': 800000,
      'CM-SW': 1200000,
    };

    const regions = await this.prisma.region.findMany({
      include: {
        registrations: true,
      },
    });

    return regions.map((region: any) => {
      const estimatedPop = populationEstimates[region.code] || 1000000;
      const registered = region.registrations.length;
      const sdgPercentage = (registered / estimatedPop * 100).toFixed(2);

      return {
        regionCode: region.code,
        nameFr: region.nameFr,
        nameEn: region.nameEn,
        estimatedPop,
        registeredCount: registered,
        sdgPercentage: parseFloat(sdgPercentage as string),
        status:
          parseFloat(sdgPercentage as string) >= 80
            ? 'on-track'
            : parseFloat(sdgPercentage as string) >= 50
              ? 'at-risk'
              : 'critical',
      };
    });
  }
}

export const analyticsService = new AnalyticsService();
