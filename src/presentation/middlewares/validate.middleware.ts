import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';

type Target = 'query' | 'params' | 'body';

export function validate(schema: ZodSchema, target: Target = 'query') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = formatZodError(result.error);
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
        status: 'error',
        message: 'Parâmetros inválidos.',
        errors,
      });
      return;
    }

    req[target] = result.data;
    next();
  };
}

function formatZodError(error: ZodError) {
  return error.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
}
