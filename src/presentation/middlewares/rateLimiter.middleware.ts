import rateLimit from 'express-rate-limit';
import { StatusCodes } from 'http-status-codes';
import { env } from '../../shared/config/env';

export const rateLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Muitas requisições. Tente novamente em alguns instantes.',
  },
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
  keyGenerator: (req) => {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket.remoteAddress ||
      'unknown'
    );
  },
});

export const h2hRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'O endpoint H2H é intensivo. Máximo de 5 requisições por minuto.',
  },
  statusCode: StatusCodes.TOO_MANY_REQUESTS,
});
