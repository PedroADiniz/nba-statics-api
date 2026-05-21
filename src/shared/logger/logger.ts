import { createLogger, format, transports } from 'winston';
import { env } from '../config/env';

const { combine, timestamp, errors, colorize, printf, json } = format;

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) =>
    stack ? `${ts} [${level}] ${message}\n${stack}` : `${ts} [${level}] ${message}`,
  ),
);

const prodFormat = combine(timestamp(), errors({ stack: true }), json());

export const logger = createLogger({
  level: env.isDev ? 'debug' : 'info',
  format: env.isDev ? devFormat : prodFormat,
  transports: [new transports.Console()],
  exitOnError: false,
});
