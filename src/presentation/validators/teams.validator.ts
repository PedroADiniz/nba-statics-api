import { z } from 'zod';

export const teamsQuerySchema = z.object({
  conference: z.enum(['East', 'West']).optional(),
});

export const teamIdParamSchema = z.object({
  id: z.coerce.number().int().positive('ID deve ser um inteiro positivo'),
});

export type TeamsQuery = z.infer<typeof teamsQuerySchema>;
export type TeamIdParam = z.infer<typeof teamIdParamSchema>;
