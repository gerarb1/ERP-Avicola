import type { ErrorHandler } from 'hono';
import { ZodError } from 'zod';
import type { AppEnv } from '../types';

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  console.error('Error caught in handler:', err);

  if (err instanceof ZodError) {
    return c.json({
      success: false,
      error: 'Validation Error',
      details: err.errors,
    }, 422);
  }

  if (err instanceof AppError) {
    return c.json({
      success: false,
      error: err.message,
    }, err.statusCode as any);
  }

  return c.json({
    success: false,
    error: 'Internal Server Error',
    message: err.message,
  }, 500);
};
