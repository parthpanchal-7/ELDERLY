import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[Error]', err);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}
