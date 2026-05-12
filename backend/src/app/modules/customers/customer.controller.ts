import { Response } from 'express';
import catchAsync from '../../shared/utils/catchAsync';
import sendResponse from '../../shared/utils/sendResponse';
import { AuthRequest } from '../../middleware/auth.middleware';
import { CustomerService } from './customer.service';
import { CustomerRepository } from './customer.repository';

const customerRepository = new CustomerRepository();
const customerService = new CustomerService(customerRepository);

const getAllCustomers = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId!;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = req.query.search as string | undefined;

  const result = await customerService.getAllCustomers({ businessId, page, limit, search });

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Customers fetched successfully',
    meta: result.meta,
    data: result.items,
  });
});

const getCustomerById = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId!;
  const { id } = req.params;

  const result = await customerService.getCustomerById(id, businessId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Customer fetched successfully',
    data: result,
  });
});

const createCustomer = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId!;

  const result = await customerService.createCustomer(businessId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Customer created successfully',
    data: result,
  });
});

const updateCustomer = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId!;
  const { id } = req.params;

  const result = await customerService.updateCustomer(id, businessId, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Customer updated successfully',
    data: result,
  });
});

const deleteCustomer = catchAsync(async (req: AuthRequest, res: Response) => {
  const businessId = req.user!.businessId!;
  const { id } = req.params;

  const result = await customerService.deleteCustomer(id, businessId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Customer deleted successfully',
    data: result,
  });
});

export const CustomerController = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
