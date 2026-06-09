export class AppError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;
  public resource?: string;
  public current?: number;
  public limit?: number;
  public code?: string;
  public subscriptionStatus?: string;

  constructor(
    message: string,
    statusCode: number,
    resource?: string,
    current?: number,
    limit?: number,
    code?: string,
    subscriptionStatus?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.resource = resource;
    this.current = current;
    this.limit = limit;
    this.code = code;
    this.subscriptionStatus = subscriptionStatus;

    Error.captureStackTrace(this, this.constructor);
  }
}
