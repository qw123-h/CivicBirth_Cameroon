import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../config/database';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockUser = {
    id: '123',
    email: 'test@civicbirth.cm',
    password: 'hashed_password',
    role: 'REGISTRAR',
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date(),
  };

  const mockToken = 'valid_jwt_token';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue(mockToken),
            verify: jest.fn().mockReturnValue({ id: '123' }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginDto = { email: 'test@civicbirth.cm', password: 'password123' };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(mockUser);
      jest.spyOn(service as any, 'validatePassword').mockResolvedValueOnce(true);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe(mockToken);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto = { email: 'invalid@test.com', password: 'password' };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto = { email: 'test@civicbirth.cm', password: 'wrongpassword' };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(mockUser);
      jest.spyOn(service as any, 'validatePassword').mockResolvedValueOnce(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should register new user', async () => {
      const registerDto = {
        email: 'newuser@civicbirth.cm',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValueOnce(mockUser);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('id');
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if email already exists', async () => {
      const registerDto = {
        email: 'test@civicbirth.cm',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const result = service.verifyToken(mockToken);

      expect(result).toHaveProperty('id');
      expect(jwtService.verify).toHaveBeenCalledWith(mockToken);
    });

    it('should throw UnauthorizedException for invalid token', () => {
      jest.spyOn(jwtService, 'verify').mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.verifyToken('invalid_token')).toThrow();
    });
  });

  describe('resetPassword', () => {
    it('should reset user password', async () => {
      const resetDto = { userId: '123', newPassword: 'newpassword123' };

      jest.spyOn(prisma.user, 'update').mockResolvedValueOnce(mockUser);

      const result = await service.resetPassword(resetDto);

      expect(result).toHaveProperty('id');
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      const resetDto = { userId: 'invalid', newPassword: 'newpassword123' };

      jest.spyOn(prisma.user, 'update').mockRejectedValueOnce(new Error('Not found'));

      await expect(service.resetPassword(resetDto)).rejects.toThrow();
    });
  });
});
