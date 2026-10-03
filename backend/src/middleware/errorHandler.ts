import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utilities/response.js';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error Middleware]:', err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(
      res,
      'Validation failed. Please check input parameters.',
      400,
      'VALIDATION_ERROR',
      formattedErrors
    );
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred on the server.';
  const code = err.code || 'SERVER_ERROR';

  return sendError(res, message, statusCode, code);
};
