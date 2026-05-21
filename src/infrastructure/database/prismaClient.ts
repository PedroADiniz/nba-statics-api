import { PrismaClient } from '@prisma/client';
import { env } from '../../shared/config/env';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prisma =
  global.__prisma ??
  new PrismaClient({
    log: env.isDev ? ['warn', 'error'] : ['error'],
  });

if (!env.isDev) {
  global.__prisma = prisma;
}

export default prisma;
