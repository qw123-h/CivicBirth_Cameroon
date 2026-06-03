import { PrismaClient } from '@prisma/client';

import { prisma } from '../config/database';

export abstract class BaseService {
  protected constructor(protected readonly prisma: PrismaClient = prisma) {}
}
