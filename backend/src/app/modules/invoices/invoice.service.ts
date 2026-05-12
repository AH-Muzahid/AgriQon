import { Prisma } from '@prisma/client';
import { InvoiceRepository } from './invoice.repository';
import { AppError } from '../../errors/AppError';

export class InvoiceService {
  constructor(private invoiceRepo: InvoiceRepository) {}

  async getAllInvoices(params: {
    businessId: string;
    customerId?: string;
    page: number;
    limit: number;
  }) {
    const skip = (params.page - 1) * params.limit;
    const { items, total } = await this.invoiceRepo.findAll({
      ...params,
      skip,
      take: params.limit,
    });

    return {
      items,
      meta: { page: params.page, limit: params.limit, total },
    };
  }

  async getInvoiceById(id: string, businessId: string) {
    const invoice = await this.invoiceRepo.findById(id, businessId);
    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }
    return invoice;
  }

  async getInvoiceByOrderId(orderId: string, businessId: string) {
    const invoice = await this.invoiceRepo.findByOrderId(orderId, businessId);
    if (!invoice) {
      throw new AppError('Invoice not found for this order', 404);
    }
    return invoice;
  }

  async updateInvoice(id: string, businessId: string, data: { dueDate?: Date; paidAmount?: number }) {
    const invoice = await this.getInvoiceById(id, businessId);

    const newPaidAmount = data.paidAmount !== undefined
      ? new Prisma.Decimal(data.paidAmount)
      : invoice.paidAmount;

    const dueAmount = invoice.totalAmount.minus(newPaidAmount);

    return await this.invoiceRepo.update(id, businessId, {
      ...(data.dueDate && { dueDate: data.dueDate }),
      paidAmount: newPaidAmount,
      dueAmount,
    });
  }
}
