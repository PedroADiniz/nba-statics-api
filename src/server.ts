import { app } from './app';
import { env } from './shared/config/env';
import { logger } from './shared/logger/logger';

const server = app.listen(env.port, () => {
  logger.info(`🏀  NBA H2H API rodando em http://localhost:${env.port}`);
  logger.info(`    Ambiente : ${env.nodeEnv}`);
  logger.info(`    Endpoints:`);
  logger.info(`      GET /api/v1/health`);
  logger.info(`      GET /api/v1/teams`);
  logger.info(`      GET /api/v1/teams/:id`);
  logger.info(`      GET /api/v1/h2h?team1Id=...&team2Id=...&startDate=...&endDate=...`);
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido — encerrando servidor...');
  server.close(() => {
    logger.info('Servidor encerrado.');
    process.exit(0);
  });
});
