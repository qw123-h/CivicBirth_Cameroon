import { Test, TestingModule } from '@nestjs/testing';
import { AgentsService } from './agents.service';
import { PrismaService } from '../../config/database';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AgentsService', () => {
  let service: AgentsService;
  let prisma: PrismaService;

  const mockAgent = {
    id: 'agent-123',
    name: 'Test Agent',
    email: 'agent@civicbirth.cm',
    phone: '+237000000000',
    region: 'Centre',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentsService,
        {
          provide: PrismaService,
          useValue: {
            agent: {
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

    service = module.get<AgentsService>(AgentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createAgent', () => {
    it('should create a new agent', async () => {
      const createDto = {
        name: 'Test Agent',
        email: 'agent@civicbirth.cm',
        phone: '+237000000000',
        region: 'Centre',
      };

      jest.spyOn(prisma.agent, 'findUnique').mockResolvedValueOnce(null);
      jest.spyOn(prisma.agent, 'create').mockResolvedValueOnce(mockAgent);

      const result = await service.createAgent(createDto);

      expect(result).toEqual(mockAgent);
      expect(prisma.agent.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if agent email exists', async () => {
      const createDto = {
        name: 'Test Agent',
        email: 'agent@civicbirth.cm',
        phone: '+237000000000',
        region: 'Centre',
      };

      jest.spyOn(prisma.agent, 'findUnique').mockResolvedValueOnce(mockAgent);

      await expect(service.createAgent(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid phone format', async () => {
      const createDto = {
        name: 'Test Agent',
        email: 'agent@civicbirth.cm',
        phone: 'invalid',
        region: 'Centre',
      };

      await expect(service.createAgent(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAgent', () => {
    it('should return agent by ID', async () => {
      jest.spyOn(prisma.agent, 'findUnique').mockResolvedValueOnce(mockAgent);

      const result = await service.getAgent('agent-123');

      expect(result).toEqual(mockAgent);
    });

    it('should throw NotFoundException if agent not found', async () => {
      jest.spyOn(prisma.agent, 'findUnique').mockResolvedValueOnce(null);

      await expect(service.getAgent('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('listAgents', () => {
    it('should return paginated agents', async () => {
      const mockAgents = [mockAgent];

      jest.spyOn(prisma.agent, 'findMany').mockResolvedValueOnce(mockAgents);
      jest.spyOn(prisma.agent, 'count').mockResolvedValueOnce(1);

      const result = await service.listAgents({ skip: 0, take: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter agents by region', async () => {
      const centreAgents = [mockAgent];

      jest.spyOn(prisma.agent, 'findMany').mockResolvedValueOnce(centreAgents);
      jest.spyOn(prisma.agent, 'count').mockResolvedValueOnce(1);

      const result = await service.listAgents({ skip: 0, take: 10, region: 'Centre' });

      expect(result.data[0].region).toBe('Centre');
    });

    it('should filter agents by active status', async () => {
      const activeAgents = [mockAgent];

      jest.spyOn(prisma.agent, 'findMany').mockResolvedValueOnce(activeAgents);
      jest.spyOn(prisma.agent, 'count').mockResolvedValueOnce(1);

      const result = await service.listAgents({ skip: 0, take: 10, isActive: true });

      expect(result.data[0].isActive).toBe(true);
    });
  });

  describe('updateAgent', () => {
    it('should update agent information', async () => {
      const updateDto = {
        phone: '+237111111111',
      };

      const updatedAgent = { ...mockAgent, ...updateDto };
      jest.spyOn(prisma.agent, 'update').mockResolvedValueOnce(updatedAgent);

      const result = await service.updateAgent('agent-123', updateDto);

      expect(result.phone).toBe('+237111111111');
    });

    it('should validate phone format on update', async () => {
      const updateDto = {
        phone: 'invalid',
      };

      await expect(service.updateAgent('agent-123', updateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteAgent', () => {
    it('should delete agent', async () => {
      jest.spyOn(prisma.agent, 'delete').mockResolvedValueOnce(mockAgent);

      const result = await service.deleteAgent('agent-123');

      expect(result).toEqual(mockAgent);
    });
  });

  describe('deactivateAgent', () => {
    it('should deactivate agent', async () => {
      const inactiveAgent = { ...mockAgent, isActive: false };

      jest.spyOn(prisma.agent, 'update').mockResolvedValueOnce(inactiveAgent);

      const result = await service.deactivateAgent('agent-123');

      expect(result.isActive).toBe(false);
    });
  });

  describe('reactivateAgent', () => {
    it('should reactivate agent', async () => {
      const activeAgent = { ...mockAgent, isActive: true };

      jest.spyOn(prisma.agent, 'update').mockResolvedValueOnce(activeAgent);

      const result = await service.reactivateAgent('agent-123');

      expect(result.isActive).toBe(true);
    });
  });

  describe('getAgentsByRegion', () => {
    it('should return agents in a specific region', async () => {
      const regionAgents = [mockAgent, { ...mockAgent, id: 'agent-456' }];

      jest.spyOn(prisma.agent, 'findMany').mockResolvedValueOnce(regionAgents);

      const result = await service.getAgentsByRegion('Centre');

      expect(result).toHaveLength(2);
      expect(result[0].region).toBe('Centre');
    });

    it('should return empty array if no agents in region', async () => {
      jest.spyOn(prisma.agent, 'findMany').mockResolvedValueOnce([]);

      const result = await service.getAgentsByRegion('Unknown');

      expect(result).toHaveLength(0);
    });
  });
});
