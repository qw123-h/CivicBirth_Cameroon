import { Prisma, UserRole } from '@prisma/client';

import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import bcrypt from 'bcryptjs';
import { logInfo } from '../../config/logger';
import { BaseService } from '../../core/base.service';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: string;
  regionId?: string;
}

export class UsersService extends BaseService {
  constructor(prismaClient = prisma) {
    super(prismaClient);
  }

  async createUser(data: CreateUserData) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new AppError(400, 'Email already in use');
    }

    // Validate region if provided
    if (data.regionId) {
      const region = await this.prisma.region.findUnique({
        where: { id: data.regionId },
      });

      if (!region) {
        throw new AppError(400, 'Invalid region ID');
      }
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role as any,
        regionId: data.regionId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        regionId: true,
        isActive: true,
        createdAt: true,
      },
    });

    logInfo(`User created: ${data.email}`);

    return user;
  }

  async listUsers(page: number = 1, limit: number = 25) {
    const total = await this.prisma.user.count();
    const skip = (page - 1) * limit;

    const users = await this.prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        regionId: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    });

    return {
      data: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        regionId: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        region: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }

  async updateUser(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      role: string;
      regionId: string;
    }>,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (data.email && data.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existing) {
        throw new AppError(400, 'Email already in use');
      }
    }

    if (data.regionId) {
      const region = await this.prisma.region.findUnique({
        where: { id: data.regionId },
      });

      if (!region) {
        throw new AppError(400, 'Invalid region ID');
      }
    }

    const updateData: Prisma.UserUncheckedUpdateInput = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.email !== undefined) {
      updateData.email = data.email;
    }

    if (data.role !== undefined) {
      updateData.role = data.role as UserRole;
    }

    if (data.regionId !== undefined) {
      updateData.regionId = data.regionId;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        regionId: true,
        isActive: true,
        createdAt: true,
      },
    });

    logInfo(`User updated: ${id}`);

    return updated;
  }

  async deactivateUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    logInfo(`User deactivated: ${id}`);

    return updated;
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    await this.prisma.user.delete({ where: { id } });

    logInfo(`User deleted: ${id}`);

    return { message: 'User deleted successfully' };
  }
}

export const usersService = new UsersService();
