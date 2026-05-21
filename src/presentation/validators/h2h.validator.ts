import { z } from 'zod';

const VALID_TEAM_IDS = [
  1610612737, 1610612738, 1610612751, 1610612766, 1610612741, 1610612739,
  1610612742, 1610612743, 1610612765, 1610612744, 1610612745, 1610612754,
  1610612746, 1610612747, 1610612763, 1610612748, 1610612749, 1610612750,
  1610612740, 1610612752, 1610612760, 1610612753, 1610612755, 1610612756,
  1610612757, 1610612758, 1610612759, 1610612761, 1610612762, 1610612764,
] as const;

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido, use YYYY-MM-DD')
  .refine((val) => !isNaN(Date.parse(val)), 'Data inválida');

const teamIdSchema = z.coerce
  .number()
  .int()
  .refine((v): v is (typeof VALID_TEAM_IDS)[number] => (VALID_TEAM_IDS as readonly number[]).includes(v), {
    message: `ID de time inválido. Consulte GET /api/v1/teams para a lista completa.`,
  });

export const h2hQuerySchema = z
  .object({
    team1Id: teamIdSchema,
    team2Id: teamIdSchema,
    startDate: dateSchema,
    endDate: dateSchema,
    includeQuarters: z
      .enum(['true', 'false'])
      .optional()
      .transform((v) => v !== 'false'),
  })
  .refine((data) => data.team1Id !== data.team2Id, {
    message: 'team1Id e team2Id devem ser times diferentes.',
    path: ['team2Id'],
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'startDate deve ser anterior ou igual a endDate.',
    path: ['startDate'],
  });

export type H2HQuery = z.infer<typeof h2hQuerySchema>;
