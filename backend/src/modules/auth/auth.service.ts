import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import { logInfo, logWarn } from '../../config/logger';
import { BaseService } from '../../core/base.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    regionId: string | null;
  };
}

export class AuthService extends BaseService {
  constructor(prismaClient = prisma) {
    super(prismaClient);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        role: true,
        regionId: true,
        isActive: true,
      },
    });

    if (!user) {
      logWarn(`Login attempt with unknown email: ${email}`);
      throw new AppError(401, 'Invalid credentials');
    }

    if (!user.isActive) {
      logWarn(`Login attempt with inactive account: ${email}`);
      throw new AppError(403, 'Account is inactive');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      logWarn(`Failed login attempt for user: ${email}`);
      throw new AppError(401, 'Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    logInfo(`User logged in: ${email}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        regionId: user.regionId,
      },
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, config.JWT_SECRET) as { id: string };

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, isActive: true },
      });

      if (!user || !user.isActive) {
        throw new AppError(401, 'User not found or inactive');
      }

      const accessToken = this.generateAccessToken(user.id);
      return { accessToken };
    } catch (error) {
      logWarn('Refresh token error');
      throw new AppError(401, 'Invalid or expired refresh token');
    }
  }

  async getCurrentUser(
    userId: string,
  ): Promise<{
    id: string;
    email: string;
    name: string;
    role: string;
    regionId: string | null;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        regionId: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }

  private generateAccessToken(userId: string): string {
    const expiresIn = config.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'];
    return jwt.sign({ id: userId }, config.JWT_SECRET, {
      expiresIn,
    });
  }

  private generateRefreshToken(userId: string): string {
    const expiresIn = config.JWT_REFRESH_EXPIRY as jwt.SignOptions['expiresIn'];
    return jwt.sign({ id: userId }, config.JWT_SECRET, {
      expiresIn,
    });
  }
}

export const authService = new AuthService();
