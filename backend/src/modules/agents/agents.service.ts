import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import { logInfo } from '../../config/logger';
import { BaseService } from '../../core/base.service';
import bcrypt from 'bcryptjs';

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

    // Generate unique agent code
    const maxRetries = 10;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      // Get all existing agent codes
      const existingAgents = await this.prisma.agent.findMany({
        select: { agentCode: true },
      });
      const existingCodes = new Set(existingAgents.map(a => a.agentCode));
      
      let nextNum = 1;
      // Find the highest number or next available
      for (const code of existingCodes) {
        const num = parseInt(code, 10);
        if (num >= nextNum) nextNum = num + 1;
      }
      
      // Use attempt offset to ensure uniqueness across concurrent requests
      const candidateNum = nextNum + attempt;
      const agentCode = String(candidateNum).padStart(6, '0');

      try {
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
        
        // Generate random password: name + 4 digits + special character
        const password = this.generatePassword(data.name);
        const email = `${agentCode}@civicbirth.cm`;
        
        const passwordHash = await bcrypt.hash(password, 10);
        const updatedAgent = await this.prisma.agent.update({
          where: { id: agent.id },
          data: { email, passwordHash },
          include: { region: true },
        });
        
        return { ...updatedAgent, tempPassword: password };
      } catch (error: any) {
        if (error?.code === 'P2002') {
          continue;
        }
        throw error;
      }
    }
    throw new AppError(500, 'Failed to generate unique agent code');
  }

  private generatePassword(name: string): string {
    // Extract first name (before space) and make lowercase
    const firstName = name.split(' ')[0].toLowerCase();
    
    // Generate 4 random digits
    const digits = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Choose a random special character
    const specialChars = ['!', '@', '#', '$', '%', '&', '*'];
    const special = specialChars[Math.floor(Math.random() * specialChars.length)];
    
    return `${firstName}${digits}${special}`;
  }

  async generateNewPassword(id: string) {
    const agent = await this.prisma.agent.findUnique({ where: { id } });

    if (!agent) {
      throw new AppError(404, 'Agent not found');
    }

    if (!agent.email) {
      throw new AppError(400, 'Agent has no email - cannot reset password');
    }

    // Generate new random password
    const password = this.generatePassword(agent.name);
    const passwordHash = await bcrypt.hash(password, 10);

    await this.prisma.agent.update({
      where: { id },
      data: { passwordHash },
    });

    logInfo(`Password reset for agent: ${agent.agentCode}`);
    return { agentCode: agent.agentCode, email: agent.email, tempPassword: password };
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
      include: {
        region: true,
        _count: {
          select: { registrations: true },
        },
      },
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

  async updateAgentStatus(id: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') {
    const agent = await this.prisma.agent.findUnique({ where: { id } });

    if (!agent) {
      throw new AppError(404, 'Agent not found');
    }

    const updated = await this.prisma.agent.update({
      where: { id },
      data: { status },
      include: {
        region: true,
        _count: {
          select: { registrations: true },
        },
      },
    });

    logInfo(`Agent status updated: ${id} -> ${status}`);

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

  async getMyPerformance(userId: string) {
    const total = await this.prisma.birthRegistration.count({
      where: { agentId: userId },
    });

    const validated = await this.prisma.birthRegistration.count({
      where: {
        agentId: userId,
        status: { in: ['VALIDATED', 'CERTIFICATE_ISSUED'] },
      },
    });

    const thisMonth = await this.prisma.birthRegistration.count({
      where: {
        agentId: userId,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    return {
      totalRegistrations: total,
      validatedRegistrations: validated,
      accuracyRate: total > 0 ? ((validated / total) * 100).toFixed(2) : '0',
      registrationsThisMonth: thisMonth,
    };
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
