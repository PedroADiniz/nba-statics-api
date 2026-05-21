import { z } from 'zod';

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

export const scheduleQuerySchema = z.object({
  date: z
    .string()
    .regex(isoDate, 'date deve estar no formato YYYY-MM-DD')
    .optional()
    .default(() => new Date().toISOString().slice(0, 10)),
});

export type ScheduleQuery = z.infer<typeof scheduleQuerySchema>;
