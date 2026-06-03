import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import {
  CreateRegistrationInput,
  UpdateRegistrationInput,
  ListRegistrationsQuery,
} from './registrations.schema';
import { generateReferenceNumber } from '../../utils/referenceNumber';
import {
  parsePagination,
  calculatePagination,
  createPaginatedResponse,
} from '../../utils/pagination';
import { logInfo, logWarn } from '../../config/logger';
import { BaseService } from '../../core/base.service';

export class RegistrationsService extends BaseService {
  constructor(prismaClient = prisma) {
    super(prismaClient);
  }

  async createRegistration(
    data: CreateRegistrationInput,
    userId: string,
  ) {
    // Verify region exists
    const region = await this.prisma.region.findUnique({
      where: { id: data.regionId },
    });

    if (!region) {
      throw new AppError(400, 'Invalid region ID');
    }

    // If agent is specified, verify it exists
    if (data.agentId) {
      const agent = await this.prisma.agent.findUnique({
        where: { id: data.agentId },
      });

      if (!agent) {
        throw new AppError(400, 'Invalid agent ID');
      }
    }

    const referenceNumber = await generateReferenceNumber();

    const registration = await this.prisma.birthRegistration.create({
      data: {
        referenceNumber,
        childName: data.childName,
        childSex: data.childSex,
        dob: new Date(data.dob),
        birthPlace: data.birthPlace,
        regionId: data.regionId,
        district: data.district,
        village: data.village,
        motherName: data.motherName,
        motherPhone: data.motherPhone,
        fatherName: data.fatherName,
        fatherPhone: data.fatherPhone,
        declarantPhone: data.declarantPhone,
        agentId: data.agentId,
        channel: data.channel,
        status: 'PENDING',
        notes: data.notes,
      },
      include: {
        region: true,
        agent: true,
        validatedBy: true,
      },
    });

    logInfo(`Birth registration created: ${referenceNumber} by user ${userId}`);

    return registration;
  }

  async listRegistrations(
    query: ListRegistrationsQuery,
    userId: string,
    userRole: string,
    userRegionId: string | null,
  ) {
    const { page, limit } = parsePagination(query.page, query.limit);

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (userRole === 'FIELD_AGENT') {
      where.agent = { id: userId };
    } else if (userRole === 'REGIONAL_OFFICER' && userRegionId) {
      where.regionId = userRegionId;
    } else if (userRole === 'MUNICIPAL_REGISTRAR' && userRegionId) {
      where.regionId = userRegionId;
    }

    if (query.regionId) {
      where.regionId = query.regionId;
    }

    if (query.sex) {
      where.childSex = query.sex;
    }

    if (query.channel) {
      where.channel = query.channel;
    }

    if (query.search) {
      where.OR = [
        { referenceNumber: { contains: query.search, mode: 'insensitive' } },
        { childName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) {
        where.createdAt.gte = new Date(query.dateFrom);
      }
      if (query.dateTo) {
        where.createdAt.lte = new Date(query.dateTo);
      }
    }

    const total = await this.prisma.birthRegistration.count({ where });
    const { skip, totalPages, hasMore } = calculatePagination(total, page, limit);

    const registrations = await this.prisma.birthRegistration.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        region: true,
        agent: true,
        validatedBy: true,
        certificate: true,
      },
    });

    return createPaginatedResponse(registrations, page, limit, total);
  }

  async getRegistration(id: string) {
    const registration = await this.prisma.birthRegistration.findUnique({
      where: { id },
      include: {
        region: true,
        agent: true,
        validatedBy: true,
        certificate: true,
        auditLogs: { orderBy: { timestamp: 'desc' }, take: 10 },
      },
    });

    if (!registration) {
      throw new AppError(404, 'Registration not found');
    }

    return registration;
  }

  async validateRegistration(id: string, userId: string) {
    const registration = await this.prisma.birthRegistration.findUnique({
      where: { id },
    });

    if (!registration) {
      throw new AppError(404, 'Registration not found');
    }

    if (registration.status !== 'PENDING') {
      throw new AppError(
        400,
        `Cannot validate registration with status: ${registration.status}`,
      );
    }

    const updated = await this.prisma.birthRegistration.update({
      where: { id },
      data: {
        status: 'VALIDATED',
        validatedById: userId,
        validatedAt: new Date(),
      },
      include: {
        region: true,
        agent: true,
        validatedBy: true,
      },
    });

    logInfo(`Birth registration validated: ${id} by user ${userId}`);

    return updated;
  }

  async rejectRegistration(
    id: string,
    reason: string,
    userId: string,
  ) {
    const registration = await this.prisma.birthRegistration.findUnique({
      where: { id },
    });

    if (!registration) {
      throw new AppError(404, 'Registration not found');
    }

    if (registration.status !== 'PENDING') {
      throw new AppError(
        400,
        `Cannot reject registration with status: ${registration.status}`,
      );
    }

    const updated = await this.prisma.birthRegistration.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
      },
      include: {
        region: true,
        agent: true,
        validatedBy: true,
      },
    });

    logInfo(`Birth registration rejected: ${id} by user ${userId}`);

    return updated;
  }

  async getPublicRegistration(referenceNumber: string) {
    const registration = await this.prisma.birthRegistration.findUnique({
      where: { referenceNumber },
      select: {
        childName: true,
        childSex: true,
        dob: true,
        birthPlace: true,
        region: {
          select: { nameFr: true, nameEn: true },
        },
        createdAt: true,
        status: true,
      },
    });

    if (!registration) {
      throw new AppError(404, 'Registration not found');
    }

    return registration;
  }
}

export const registrationsService = new RegistrationsService();
