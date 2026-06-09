import { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/AppError';
import { Prisma } from '../../generated/client';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorMessages: any[] = [];

  let resource: string | undefined;
  let current: number | undefined;
  let limit: number | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    resource = err.resource;
    current = err.current;
    limit = err.limit;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle Prisma specific errors
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'Duplicate entry found';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found';
    }
  } else if (err.name === 'ValidationError') {
    // Handle other validation errors if any
    statusCode = 400;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(resource !== undefined ? { resource } : {}),
    ...(current !== undefined ? { current } : {}),
    ...(limit !== undefined ? { limit } : {}),
    errorMessages,
    stack: process.env.NODE_ENV === 'development' ? err?.stack : null,
  });
};

export default globalErrorHandler;
