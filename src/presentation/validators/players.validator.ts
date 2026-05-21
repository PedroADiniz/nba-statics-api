import { z } from 'zod';

function currentNBASeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const startYear = month >= 10 ? year : year - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

const seasonRegex = /^\d{4}-\d{2}$/;

export const rosterQuerySchema = z.object({
  teamId: z.string().regex(/^\d+$/, 'teamId deve ser numérico').transform(Number),
  season: z.string().regex(seasonRegex, 'season deve estar no formato YYYY-YY').optional().default(currentNBASeason()),
});

export type RosterQuery = z.infer<typeof rosterQuerySchema>;

export const playerIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'id deve ser numérico').transform(Number),
});

export type PlayerIdParam = z.infer<typeof playerIdSchema>;

export const gameLogQuerySchema = z.object({
  season: z.string().regex(seasonRegex, 'season deve estar no formato YYYY-YY').optional().default(currentNBASeason()),
});

export type GameLogQuery = z.infer<typeof gameLogQuerySchema>;

export const teamStatsQuerySchema = z.object({
  teamId: z.string().regex(/^\d+$/, 'teamId deve ser numérico').transform(Number),
  season: z.string().regex(seasonRegex, 'season deve estar no formato YYYY-YY').optional().default(currentNBASeason()),
});

export type TeamStatsQuery = z.infer<typeof teamStatsQuerySchema>;
