import { prisma } from '../../config/database';
import { BaseService } from '../../core/base.service';

export interface RegionListItem {
  id: string;
  nameFr: string;
  nameEn: string;
  code: string;
  monthlyTarget: number;
}

export class RegionsService extends BaseService {
  constructor(prismaClient = prisma) {
    super(prismaClient);
  }

  async listRegions(): Promise<RegionListItem[]> {
    return this.prisma.region.findMany({
      orderBy: { nameFr: 'asc' },
      select: {
        id: true,
        nameFr: true,
        nameEn: true,
        code: true,
        monthlyTarget: true,
      },
    });
  }
}

export const regionsService = new RegionsService();
