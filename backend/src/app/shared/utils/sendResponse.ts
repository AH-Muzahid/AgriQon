import { Response } from 'express';

type IResponse<T> = {
  success: boolean;
  statusCode: number;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  data?: T | null;
};

const sendResponse = <T>(res: Response, data: IResponse<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message || null,
    meta: data.meta || null,
    data: data.data || null,
  });
};

export default sendResponse;
