import prisma from '../database/prismaClient';
import { logger } from '../../shared/logger/logger';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export class PrismaGenericCacheRepository {
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await prisma.h2HCache.findUnique({ where: { cacheKey: key } });
      if (!cached) return null;

      if (new Date() > cached.expiresAt) {
        await prisma.h2HCache.delete({ where: { cacheKey: key } }).catch(() => null);
        return null;
      }

      logger.debug(`Cache HIT: ${key}`);
      return JSON.parse(cached.payload) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, data: T, ttlMs = CACHE_TTL_MS): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlMs);
    try {
      await prisma.h2HCache.upsert({
        where: { cacheKey: key },
        update: { payload: JSON.stringify(data), expiresAt },
        create: { cacheKey: key, payload: JSON.stringify(data), expiresAt },
      });
      logger.debug(`Cache SET: ${key}`);
    } catch (err) {
      logger.warn(`Falha ao salvar cache: ${err instanceof Error ? err.message : err}`);
    }
  }
}
