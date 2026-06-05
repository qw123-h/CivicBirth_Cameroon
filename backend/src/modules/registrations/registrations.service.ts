import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import {
  CreateRegistrationInput,
  EditRegistrationInput,
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
    // Check for duplicate registration
    const existing = await this.prisma.birthRegistration.findFirst({
      where: {
        childName: data.childName,
        dob: new Date(data.dob),
        motherName: data.motherName,
      },
    });

    if (existing) {
      throw new AppError(409, 'A registration with the same child name, date of birth, and mother name already exists');
    }

    // Verify region exists
    const region = await this.prisma.region.findUnique({
      where: { id: data.regionId },
    });

    if (!region) {
      throw new AppError(400, 'Invalid region ID');
    }

     // If agent is specified, verify it exists and is active
     if (data.agentId) {
       const agent = await this.prisma.agent.findUnique({
         where: { id: data.agentId },
       });

       if (!agent) {
         throw new AppError(400, 'Invalid agent ID');
       }

       // Check if agent is active
       if (agent.status !== 'ACTIVE') {
         throw new AppError(403, 'Agent is not active and cannot submit registrations');
       }
     }

     const referenceNumber = await generateReferenceNumber();

     // Check if this is a late registration (older than 1 year)
     const dob = new Date(data.dob);
     const oneYearAgo = new Date();
     oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
     
     const isLateRegistration = dob < oneYearAgo;

     const registration = await this.prisma.birthRegistration.create({
       data: {
         referenceNumber,
         childName: data.childName,
         childSex: data.childSex,
         dob: dob,
         isLateRegistration,
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

     // Log if this is a late registration for special review
     if (isLateRegistration) {
       logInfo(`Late registration detected: ${referenceNumber} (child DOB: ${data.dob})`);
     }

     logInfo(`Birth registration created: ${referenceNumber} by user ${userId}`);

     return registration;
  }

  async listRegistrations(
    query: ListRegistrationsQuery,
    userId: string,
    userRole: string,
    userRegionId: string | null,
  ) {
    // WORLD_BANK_OBSERVER cannot view individual records
    if (userRole === 'WORLD_BANK_OBSERVER') {
      return createPaginatedResponse([], 1, 25, 0);
    }

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

  async getRegistration(id: string, userId?: string, userRole?: string, userRegionId?: string | null) {
    // WORLD_BANK_OBSERVER cannot view individual records
    if (userRole === 'WORLD_BANK_OBSERVER') {
      throw new AppError(403, 'Access denied');
    }

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

    // Rule 3: Role-based data access enforcement
    if (userRole === 'FIELD_AGENT') {
      if (registration.agentId !== userId) {
        throw new AppError(403, 'You can only view your own registrations');
      }
    } else if (userRole === 'REGIONAL_OFFICER' || userRole === 'MUNICIPAL_REGISTRAR') {
      if (registration.regionId !== userRegionId) {
        throw new AppError(403, 'You can only view registrations in your assigned region');
      }
    }
    // NATIONAL_ADMIN, UNICEF_MONITOR, WORLD_BANK_OBSERVER: no restriction

    return registration;
  }

  async updateRegistration(id: string, data: EditRegistrationInput, userId: string) {
    // Check registration exists
    const registration = await this.prisma.birthRegistration.findUnique({
      where: { id },
    });

    if (!registration) {
      throw new AppError(404, 'Registration not found');
    }

    // Check status is PENDING
    if (registration.status !== 'PENDING') {
      throw new AppError(400, 'Cannot edit a non-pending record');
    }

    // Update only allowed fields
    const updateData: any = {};
    if (data.childName !== undefined) updateData.childName = data.childName;
    if (data.motherName !== undefined) updateData.motherName = data.motherName;
    if (data.motherPhone !== undefined) updateData.motherPhone = data.motherPhone;
    if (data.fatherName !== undefined) updateData.fatherName = data.fatherName;
    if (data.fatherPhone !== undefined) updateData.fatherPhone = data.fatherPhone;
    if (data.declarantPhone !== undefined) updateData.declarantPhone = data.declarantPhone;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.birthPlace !== undefined) updateData.birthPlace = data.birthPlace;
    if (data.district !== undefined) updateData.district = data.district;
    if (data.village !== undefined) updateData.village = data.village;

    const updated = await this.prisma.birthRegistration.update({
      where: { id },
      data: updateData,
      include: {
        region: true,
        agent: true,
        validatedBy: true,
      },
    });

    logInfo(`Birth registration updated: ${id} by user ${userId}`);

    return updated;
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

  async resubmitRegistration(id: string) {
    const registration = await this.prisma.birthRegistration.findUnique({
      where: { id },
    });

    if (!registration) {
      throw new AppError(404, 'Registration not found');
    }

    if (registration.status !== 'REJECTED') {
      throw new AppError(
        400,
        `Cannot resubmit registration with status: ${registration.status}. Only REJECTED registrations can be resubmitted.`,
      );
    }

    const updated = await this.prisma.birthRegistration.update({
      where: { id },
      data: {
        status: 'PENDING',
        rejectionReason: null,
      },
      include: {
        region: true,
        agent: true,
        validatedBy: true,
      },
    });

    logInfo(`Birth registration resubmitted: ${id}`);

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