import { prisma } from '../../lib/prisma';
import { PaymentStatus, Prisma } from '../../../generated/client';

export class PaymentRepository {
  /**
   * Find payments matching the filter params with pagination
   */
  async findAll(params: {
    businessId: string;
    page: number;
    limit: number;
    startDate?: string;
    endDate?: string;
    status?: PaymentStatus;
    invoiceId?: string;
    customerId?: string;
  }) {
    const { businessId, page, limit, startDate, endDate, status, invoiceId, customerId } = params;
    const skip = (page - 1) * limit;
    const take = limit;

    const where: Prisma.PaymentWhereInput = {
      businessId,
      ...(status && { status }),
      ...(startDate || endDate ? {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        }
      } : {}),
      // Filter by nested order relations
      ...((invoiceId || customerId) ? {
        order: {
          ...(customerId && { customerId }),
          ...(invoiceId && {
            invoice: {
              id: invoiceId
            }
          })
        }
      } : {})
    };

    const [items, total] = await prisma.$transaction([
      prisma.payment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            include: {
              invoice: true,
              customer: true
            }
          },
          refunds: true
        }
      }),
      prisma.payment.count({ where })
    ]);

    return { items, total };
  }

  /**
   * Find a single payment by ID and tenant ID
   */
  async findById(id: string, businessId: string) {
    const payment = await prisma.payment.findFirst({
      where: { id, businessId },
      include: {
        order: {
          include: {
            invoice: true,
            customer: true
          }
        },
        refunds: true
      }
    });

    if (!payment) return null;

    // Fetch related audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        businessId,
        entityId: id,
        entityType: 'Payment'
      },
      orderBy: { createdAt: 'desc' }
    });

    return {
      ...payment,
      auditLogs
    };
  }
}
