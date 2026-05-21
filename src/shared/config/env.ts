import 'dotenv/config';

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Variável de ambiente obrigatória não definida: ${key}`);
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function optionalInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) throw new Error(`${key} deve ser um inteiro válido, recebeu: "${raw}"`);
  return parsed;
}

export const env = {
  port: optionalInt('PORT', 3000),
  nodeEnv: optional('NODE_ENV', 'development'),
  isDev: optional('NODE_ENV', 'development') === 'development',

  apiKey: required('API_KEY'),

  rateLimitWindowMs: optionalInt('RATE_LIMIT_WINDOW_MS', 60_000),
  rateLimitMaxRequests: optionalInt('RATE_LIMIT_MAX_REQUESTS', 30),

  nbaStatsBaseUrl: optional('NBA_STATS_BASE_URL', 'https://stats.nba.com/stats'),
  nbaRequestDelayMs: optionalInt('NBA_REQUEST_DELAY_MS', 700),

  corsOrigins: optional('CORS_ORIGINS', '*')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
} as const;
