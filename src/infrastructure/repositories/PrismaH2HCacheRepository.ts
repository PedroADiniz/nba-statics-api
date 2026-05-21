import prisma from '../database/prismaClient';
import { logger } from '../../shared/logger/logger';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

export class PrismaH2HCacheRepository {
  private buildKey(team1Id: number, team2Id: number, startDate: string, endDate: string): string {
    const [a, b] = [team1Id, team2Id].sort((x, y) => x - y);
    return `h2h:${a}:${b}:${startDate}:${endDate}`;
  }

  async get<T>(team1Id: number, team2Id: number, startDate: string, endDate: string): Promise<T | null> {
    const key = this.buildKey(team1Id, team2Id, startDate, endDate);
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

  async set<T>(team1Id: number, team2Id: number, startDate: string, endDate: string, data: T): Promise<void> {
    const key = this.buildKey(team1Id, team2Id, startDate, endDate);
    const expiresAt = new Date(Date.now() + CACHE_TTL_MS);
    try {
      await prisma.h2HCache.upsert({
        where: { cacheKey: key },
        update: { payload: JSON.stringify(data), expiresAt },
        create: { cacheKey: key, payload: JSON.stringify(data), expiresAt },
      });
      logger.debug(`Cache SET: ${key} (expira em ${expiresAt.toISOString()})`);
    } catch (err) {
      logger.warn(`Falha ao salvar cache: ${err instanceof Error ? err.message : err}`);
    }
  }

  async invalidate(team1Id: number, team2Id: number, startDate: string, endDate: string): Promise<void> {
    const key = this.buildKey(team1Id, team2Id, startDate, endDate);
    await prisma.h2HCache.deleteMany({ where: { cacheKey: key } }).catch(() => null);
  }

  async purgeExpired(): Promise<number> {
    const result = await prisma.h2HCache.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    return result.count;
  }
}
