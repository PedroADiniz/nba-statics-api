import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { authHeadersSchema } from '../validators/auth.validator';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const result = authHeadersSchema.safeParse(req.headers);

  if (!result.success) {
    const first = result.error.errors[0];
    res.status(StatusCodes.UNAUTHORIZED).json({
      status: 'error',
      message: first?.message ?? 'Não autorizado.',
    });
    return;
  }

  next();
}
