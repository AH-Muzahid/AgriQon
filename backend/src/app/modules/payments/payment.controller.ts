import { Request, Response } from 'express';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import httpStatus from 'http-status';
import { PaymentService } from './payment.service';

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.initiatePayment(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment initiated successfully',
    data: result,
  });
});

const handleWebhook = catchAsync(async (req: Request, res: Response) => {
  const { gateway } = req.params;
  
  // Pass the entire request body and headers to the service for verification
  const payload = {
    body: req.body,
    headers: req.headers,
    rawBody: (req as any).rawBody, // Useful if rawBody middleware is used
  };

  const result = await PaymentService.verifyAndHandleWebhook(gateway, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Webhook processed successfully',
    data: result,
  });
});

export const PaymentController = {
  initiatePayment,
  handleWebhook,
};
