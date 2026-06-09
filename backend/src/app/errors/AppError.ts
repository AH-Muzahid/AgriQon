export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;
  public resource?: string;
  public current?: number;
  public limit?: number;

  constructor(
    message: string,
    statusCode: number,
    resource?: string,
    current?: number,
    limit?: number
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.resource = resource;
    this.current = current;
    this.limit = limit;

    Error.captureStackTrace(this, this.constructor);
  }
}
