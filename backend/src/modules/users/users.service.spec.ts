import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../config/database';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-123',
    email: 'user@civicbirth.cm',
    firstName: 'Test',
    lastName: 'User',
    role: 'REGISTRAR',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createDto = {
        email: 'newuser@civicbirth.cm',
        firstName: 'New',
        lastName: 'User',
        role: 'REGISTRAR',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValueOnce(mockUser);

      const result = await service.createUser(createDto);

      expect(result).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if email exists', async () => {
      const createDto = {
        email: 'user@civicbirth.cm',
        firstName: 'Test',
        lastName: 'User',
        role: 'REGISTRAR',
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(mockUser);

      await expect(service.createUser(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid email format', async () => {
      const createDto = {
        email: 'invalid-email',
        firstName: 'Test',
        lastName: 'User',
        role: 'REGISTRAR',
      };

      await expect(service.createUser(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUser', () => {
    it('should return user by ID', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(mockUser);

      const result = await service.getUser('user-123');

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.getUser('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('listUsers', () => {
    it('should return paginated users', async () => {
      const mockUsers = [mockUser];

      jest.spyOn(prisma.user, 'findMany').mockResolvedValueOnce(mockUsers);
      jest.spyOn(prisma.user, 'count').mockResolvedValueOnce(1);

      const result = await service.listUsers({ skip: 0, take: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter users by role', async () => {
      const registrarUsers = [mockUser];

      jest.spyOn(prisma.user, 'findMany').mockResolvedValueOnce(registrarUsers);
      jest.spyOn(prisma.user, 'count').mockResolvedValueOnce(1);

      const result = await service.listUsers({ skip: 0, take: 10, role: 'REGISTRAR' });

      expect(result.data[0].role).toBe('REGISTRAR');
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ role: 'REGISTRAR' }),
        })
      );
    });
  });

  describe('updateUser', () => {
    it('should update user information', async () => {
      const updateDto = {
        firstName: 'Updated',
      };

      const updatedUser = { ...mockUser, ...updateDto };
      jest.spyOn(prisma.user, 'update').mockResolvedValueOnce(updatedUser);

      const result = await service.updateUser('user-123', updateDto);

      expect(result.firstName).toBe('Updated');
    });

    it('should not allow changing email to existing email', async () => {
      const anotherUser = { ...mockUser, id: 'user-456', email: 'another@civicbirth.cm' };
      const updateDto = { email: 'another@civicbirth.cm' };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(anotherUser);

      await expect(service.updateUser('user-123', updateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteUser', () => {
    it('should delete user', async () => {
      jest.spyOn(prisma.user, 'delete').mockResolvedValueOnce(mockUser);

      const result = await service.deleteUser('user-123');

      expect(result).toEqual(mockUser);
    });

    it('should throw error if user not found', async () => {
      jest.spyOn(prisma.user, 'delete').mockRejectedValueOnce(new Error('Not found'));

      await expect(service.deleteUser('invalid')).rejects.toThrow();
    });
  });

  describe('changeUserRole', () => {
    it('should change user role', async () => {
      const updatedUser = { ...mockUser, role: 'ADMIN' };

      jest.spyOn(prisma.user, 'update').mockResolvedValueOnce(updatedUser);

      const result = await service.changeUserRole('user-123', 'ADMIN');

      expect(result.role).toBe('ADMIN');
    });

    it('should not allow downgrading ADMIN to lower role without super admin', async () => {
      const adminUser = { ...mockUser, role: 'ADMIN' };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(adminUser);

      await expect(service.changeUserRole('user-123', 'REGISTRAR', 'user-456')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user', async () => {
      const inactiveUser = { ...mockUser, isActive: false };

      jest.spyOn(prisma.user, 'update').mockResolvedValueOnce(inactiveUser);

      const result = await service.deactivateUser('user-123');

      expect(result.isActive).toBe(false);
    });
  });

  describe('activateUser', () => {
    it('should activate user', async () => {
      const activeUser = { ...mockUser, isActive: true };

      jest.spyOn(prisma.user, 'update').mockResolvedValueOnce(activeUser);

      const result = await service.activateUser('user-123');

      expect(result.isActive).toBe(true);
    });
  });
});
