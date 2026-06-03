import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { logInfo } from '../../config/logger';
import { BaseService } from '../../core/base.service';

export class AgentsService extends BaseService {
  constructor(prismaClient = prisma) {
    super(prismaClient);
  }

  async createAgent(data: {
    name: string;
    phone: string;
    regionId: string;
    district: string;
    village?: string;
  }) {
    const region = await this.prisma.region.findUnique({
      where: { id: data.regionId },
    });

    if (!region) {
      throw new AppError(400, 'Invalid region ID');
    }

    // Generate 6-digit agent code
    const lastAgent = await this.prisma.agent.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { agentCode: true },
    });

    let agentCode = '000001';
    if (lastAgent) {
      const lastNum = parseInt(lastAgent.agentCode, 10);
      agentCode = String(lastNum + 1).padStart(6, '0');
    }

    const agent = await this.prisma.agent.create({
      data: {
        agentCode,
        name: data.name,
        phone: data.phone,
        regionId: data.regionId,
        district: data.district,
        village: data.village,
      },
      include: { region: true },
    });

    logInfo(`Agent created: ${agentCode}`);

    return agent;
  }

  async listAgents(page: number = 1, limit: number = 25, regionId?: string) {
    const where: any = {};

    if (regionId) {
      where.regionId = regionId;
    }

    const total = await this.prisma.agent.count({ where });
    const skip = (page - 1) * limit;

    const agents = await this.prisma.agent.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { region: true },
    });

    return {
      data: agents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAgent(id: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
      include: {
        region: true,
        registrations: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!agent) {
      throw new AppError(404, 'Agent not found');
    }

    return agent;
  }

  async updateAgent(id: string, data: Partial<{
    name: string;
    phone: string;
    district: string;
    village: string;
    unicefCertified: boolean;
  }>) {
    const agent = await this.prisma.agent.findUnique({ where: { id } });

    if (!agent) {
      throw new AppError(404, 'Agent not found');
    }

    const updated = await this.prisma.agent.update({
      where: { id },
      data,
      include: { region: true },
    });

    logInfo(`Agent updated: ${id}`);

    return updated;
  }

  async deactivateAgent(id: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id } });

    if (!agent) {
      throw new AppError(404, 'Agent not found');
    }

    const updated = await this.prisma.agent.update({
      where: { id },
      data: { status: 'INACTIVE' },
      include: { region: true },
    });

    logInfo(`Agent deactivated: ${id}`);

    return updated;
  }

  async getAgentPerformance(id: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id },
      include: {
        registrations: true,
      },
    });

    if (!agent) {
      throw new AppError(404, 'Agent not found');
    }

    const total = agent.registrations.length;
    const validated = agent.registrations.filter(
      (registration: any) =>
        registration.status === 'VALIDATED' || registration.status === 'CERTIFICATE_ISSUED',
    ).length;

    return {
      agent,
      performance: {
        totalRegistrations: total,
        validatedRegistrations: validated,
        accuracyRate: total > 0 ? (validated / total * 100).toFixed(2) : '0',
        thisMonth: agent.registrations.filter((registration: any) => {
          const now = new Date();
          const regDate = new Date(registration.createdAt);
          return (
            regDate.getMonth() === now.getMonth() &&
            regDate.getFullYear() === now.getFullYear()
          );
        }).length,
      },
    };
  }
}

export const agentsService = new AgentsService();
