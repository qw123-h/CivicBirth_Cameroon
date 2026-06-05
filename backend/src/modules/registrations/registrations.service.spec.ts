import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationsService } from './registrations.service';
import { PrismaService } from '../../config/database';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('RegistrationsService', () => {
  let service: RegistrationsService;
  let prisma: PrismaService;

  const mockRegistration = {
    id: 'reg-123',
    childFirstName: 'John',
    childLastName: 'Doe',
    dateOfBirth: new Date('2020-01-01'),
    placeOfBirth: 'Yaoundé',
    fatherName: 'James Doe',
    motherName: 'Jane Doe',
    registrarId: 'user-123',
    status: 'PENDING',
    certificateId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCertificate = {
    id: 'cert-123',
    registrationId: 'reg-123',
    certificateNumber: 'CB-2026-001',
    issuedAt: new Date(),
    pdfUrl: 'https://example.com/cert.pdf',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationsService,
        {
          provide: PrismaService,
          useValue: {
            registration: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            certificate: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RegistrationsService>(RegistrationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createRegistration', () => {
    it('should create a new registration', async () => {
      const createDto = {
        childFirstName: 'John',
        childLastName: 'Doe',
        dateOfBirth: new Date('2020-01-01'),
        placeOfBirth: 'Yaoundé',
        fatherName: 'James Doe',
        motherName: 'Jane Doe',
      };

      jest.spyOn(prisma.registration, 'create').mockResolvedValueOnce(mockRegistration);

      const result = await service.createRegistration(createDto, 'user-123');

      expect(result).toEqual(mockRegistration);
      expect(prisma.registration.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          childFirstName: createDto.childFirstName,
          registrarId: 'user-123',
        }),
      });
    });

    it('should throw BadRequestException for invalid date', async () => {
      const createDto = {
        childFirstName: 'John',
        childLastName: 'Doe',
        dateOfBirth: new Date(Date.now() + 86400000), // Future date
        placeOfBirth: 'Yaoundé',
        fatherName: 'James Doe',
        motherName: 'Jane Doe',
      };

      await expect(service.createRegistration(createDto, 'user-123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getRegistration', () => {
    it('should return registration by ID', async () => {
      jest.spyOn(prisma.registration, 'findUnique').mockResolvedValueOnce(mockRegistration);

      const result = await service.getRegistration('reg-123');

      expect(result).toEqual(mockRegistration);
      expect(prisma.registration.findUnique).toHaveBeenCalledWith({
        where: { id: 'reg-123' },
      });
    });

    it('should throw NotFoundException if registration not found', async () => {
      jest.spyOn(prisma.registration, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.getRegistration('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('listRegistrations', () => {
    it('should return paginated registrations', async () => {
      const mockRegistrations = [mockRegistration];

      jest.spyOn(prisma.registration, 'findMany').mockResolvedValueOnce(mockRegistrations);
      jest.spyOn(prisma.registration, 'count').mockResolvedValueOnce(1);

      const result = await service.listRegistrations({ skip: 0, take: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(prisma.registration.findMany).toHaveBeenCalled();
    });

    it('should filter registrations by status', async () => {
      const mockPendingRegistrations = [{ ...mockRegistration, status: 'PENDING' }];

      jest.spyOn(prisma.registration, 'findMany').mockResolvedValueOnce(mockPendingRegistrations);
      jest.spyOn(prisma.registration, 'count').mockResolvedValueOnce(1);

      const result = await service.listRegistrations({ skip: 0, take: 10, status: 'PENDING' });

      expect(result.data[0].status).toBe('PENDING');
      expect(prisma.registration.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PENDING' }),
        })
      );
    });
  });

  describe('updateRegistration', () => {
    it('should update registration', async () => {
      const updateDto = {
        childFirstName: 'Updated',
      };

      const updatedRegistration = { ...mockRegistration, ...updateDto };
      jest.spyOn(prisma.registration, 'update').mockResolvedValueOnce(updatedRegistration);

      const result = await service.updateRegistration('reg-123', updateDto);

      expect(result.childFirstName).toBe('Updated');
      expect(prisma.registration.update).toHaveBeenCalled();
    });

    it('should prevent update of approved registration', async () => {
      const approvedRegistration = { ...mockRegistration, status: 'APPROVED' };
      jest.spyOn(prisma.registration, 'findUnique').mockResolvedValueOnce(approvedRegistration);

      await expect(service.updateRegistration('reg-123', { childFirstName: 'Updated' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteRegistration', () => {
    it('should delete registration', async () => {
      jest.spyOn(prisma.registration, 'delete').mockResolvedValueOnce(mockRegistration);

      const result = await service.deleteRegistration('reg-123');

      expect(result).toEqual(mockRegistration);
      expect(prisma.registration.delete).toHaveBeenCalledWith({
        where: { id: 'reg-123' },
      });
    });
  });

  describe('generateCertificate', () => {
    it('should generate certificate for approved registration', async () => {
      const approvedRegistration = { ...mockRegistration, status: 'APPROVED' };
      jest.spyOn(prisma.registration, 'findUnique').mockResolvedValueOnce(approvedRegistration);
      jest.spyOn(prisma.certificate, 'create').mockResolvedValueOnce(mockCertificate);

      const result = await service.generateCertificate('reg-123');

      expect(result).toHaveProperty('certificateNumber');
      expect(result.certificateNumber).toMatch(/^CB-\d{4}-\d{3}$/);
    });

    it('should throw error if registration not approved', async () => {
      jest.spyOn(prisma.registration, 'findUnique').mockResolvedValueOnce(mockRegistration);

      await expect(service.generateCertificate('reg-123')).rejects.toThrow(BadRequestException);
    });
  });

  describe('searchRegistrations', () => {
    it('should search registrations by child name', async () => {
      jest.spyOn(prisma.registration, 'findMany').mockResolvedValueOnce([mockRegistration]);
      jest.spyOn(prisma.registration, 'count').mockResolvedValueOnce(1);

      const result = await service.searchRegistrations('John', { skip: 0, take: 10 });

      expect(result.data).toHaveLength(1);
      expect(prisma.registration.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ childFirstName: expect.any(Object) }),
            ]),
          }),
        })
      );
    });
  });
});
