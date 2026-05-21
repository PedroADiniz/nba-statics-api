import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError, ValidationError } from '../../shared/errors/AppError';
import { logger } from '../../shared/logger/logger';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError && err.isOperational) {
    const body: Record<string, unknown> = {
      status: 'error',
      message: err.message,
    };

    if (err instanceof ValidationError && err.details) {
      body['details'] = err.details;
    }

    res.status(err.statusCode).json(body);
    return;
  }

  logger.error(`Erro inesperado: ${err.message}`, { stack: err.stack });

  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    status: 'error',
    message: 'Erro interno do servidor.',
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(StatusCodes.NOT_FOUND).json({
    status: 'error',
    message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  });
}
