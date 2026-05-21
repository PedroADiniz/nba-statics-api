export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} não encontrado.`, 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  public readonly details: unknown;

  constructor(message: string, details?: unknown) {
    super(message, 422);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Não autorizado.') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

export class TooManyRequestsError extends AppError {
  constructor() {
    super('Muitas requisições. Tente novamente em alguns instantes.', 429);
    this.name = 'TooManyRequestsError';
  }
}

export class ExternalApiError extends AppError {
  constructor(service: string, details?: string) {
    super(`Falha ao comunicar com ${service}${details ? ': ' + details : ''}.`, 502);
    this.name = 'ExternalApiError';
  }
}
