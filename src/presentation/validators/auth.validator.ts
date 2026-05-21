import { z } from 'zod';
import { env } from '../../shared/config/env';

export const authHeadersSchema = z
  .object({
    'x-api-key': z.string().optional(),
    authorization: z
      .string()
      .regex(/^Bearer\s+\S+$/i, 'Authorization deve seguir o formato: Bearer <key>')
      .optional(),
  })
  .transform((headers) => {
    const key =
      headers['x-api-key'] ??
      headers['authorization']?.replace(/^Bearer\s+/i, '');
    return { key };
  })
  .refine(({ key }) => !!key, {
    message: 'Credencial ausente. Envie x-api-key ou Authorization: Bearer <key>.',
  })
  .refine(({ key }) => key === env.apiKey, {
    message: 'API key inválida.',
  });
