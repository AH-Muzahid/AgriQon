import { prisma } from '../../lib/prisma';
import { AuditService } from '../audit/audit.service';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';
import { Prisma, PaymentGateway } from '../../../generated/client';
import { GatewayFactory } from './gateways/gateway.factory';


export class BillingService {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  /**
   * Create an invoice manually or via administrative action.
   */
  async createInvoice(data: {
    businessId: string;
    subscriptionId: string;
    amount: number;
    currency?: string;
    dueDate: Date;
    changeRequestId?: string;
  }, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;

    // 1. Verify business & subscription exist
    const subscription = await db.subscription.findUnique({
      where: { id: data.subscriptionId },
    });
    if (!subscription) {
      throw new AppError('Subscription not found', httpStatus.NOT_FOUND);
    }
    if (subscription.businessId !== data.businessId) {
      throw new AppError('Subscription does not belong to the specified business', httpStatus.BAD_REQUEST);
    }

    // 2. Generate unique invoice number: INV-SUB-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-SUB-${dateStr}-${randomSuffix}`;

    // 3. Create SubscriptionInvoice
    const invoice = await db.subscriptionInvoice.create({
      data: {
        businessId: data.businessId,
        subscriptionId: data.subscriptionId,
        invoiceNumber,
        amount: data.amount,
        currency: data.currency || 'BDT',
        status: 'PENDING',
        dueDate: data.dueDate,
        changeRequestId: data.changeRequestId,
      },
    });

    // 4. Log audit event
    await this.auditService.log({
      businessId: data.businessId,
      action: 'SUBSCRIPTION_INVOICE_CREATED',
      entityType: 'SubscriptionInvoice',
      entityId: invoice.id,
      newData: invoice,
      tx,
    });

    return invoice;
  }

  /**
   * Record a payment and automatically mark the invoice paid.
   */
  async recordPayment(data: {
    businessId: string;
    invoiceId: string;
    amount: number;
    method: string;
    transactionReference?: string;
  }, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;

    // 1. Find & Validate Invoice
    const invoice = await db.subscriptionInvoice.findUnique({
      where: { id: data.invoiceId },
    });
    if (!invoice) {
      throw new AppError('Subscription invoice not found', httpStatus.NOT_FOUND);
    }
    if (invoice.businessId !== data.businessId) {
      throw new AppError('Invoice does not belong to this business context', httpStatus.BAD_REQUEST);
    }
    if (invoice.status === 'VOID') {
      throw new AppError('Cannot record payment for a voided invoice', httpStatus.BAD_REQUEST);
    }

    // 2. Start a transaction if not already in one, to record payment and update invoice state atomically
    const execute = async (client: Prisma.TransactionClient) => {
      // Map method to PaymentGateway enum
      let gatewayValue: PaymentGateway = PaymentGateway.SSLCOMMERZ;
      const methodUpper = data.method.toUpperCase();
      if (methodUpper.includes('BKASH')) {
        gatewayValue = PaymentGateway.BKASH;
      } else if (methodUpper.includes('NAGAD')) {
        gatewayValue = PaymentGateway.NAGAD;
      }

      // Record the payment entry
      const payment = await client.subscriptionPayment.create({
        data: {
          businessId: data.businessId,
          invoiceId: data.invoiceId,
          amount: data.amount,
          method: data.method,
          gateway: gatewayValue,
          transactionReference: data.transactionReference,
          status: 'VERIFIED',
        },
      });

      // Update invoice status to PAID, saving paidAt
      const updatedInvoice = await client.subscriptionInvoice.update({
        where: { id: data.invoiceId },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });

      // Log audit event
      await this.auditService.log({
        businessId: data.businessId,
        action: 'SUBSCRIPTION_PAYMENT_RECORDED',
        entityType: 'SubscriptionPayment',
        entityId: payment.id,
        newData: {
          payment,
          invoiceStatus: updatedInvoice.status,
        },
        tx: client,
      });

      return { payment, invoice: updatedInvoice };
    };

    if (tx) {
      return await execute(tx);
    } else {
      return await prisma.$transaction(async (client: Prisma.TransactionClient) => {
        return await execute(client);
      });
    }
  }

  /**
   * Create an upgrade request.
   */
  async createUpgradeRequest(data: {
    businessId: string;
    subscriptionId: string;
    requestedPlanCode: string;
  }, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;

    // 1. Verify subscription
    const subscription = await db.subscription.findUnique({
      where: { id: data.subscriptionId },
    });
    if (!subscription) {
      throw new AppError('Subscription not found', httpStatus.NOT_FOUND);
    }
    if (subscription.businessId !== data.businessId) {
      throw new AppError('Subscription does not belong to the specified business', httpStatus.BAD_REQUEST);
    }

    // 2. Validate plan code exists
    const plan = await db.subscriptionPlan.findUnique({
      where: { code: data.requestedPlanCode },
    });
    if (!plan) {
      throw new AppError(`Subscription plan ${data.requestedPlanCode} does not exist`, httpStatus.NOT_FOUND);
    }

    const price = Number(plan.price);

    const execute = async (client: Prisma.TransactionClient) => {
      // 3. Create change request record
      const request = await client.subscriptionChangeRequest.create({
        data: {
          businessId: data.businessId,
          subscriptionId: data.subscriptionId,
          type: 'UPGRADE',
          requestedPlanCode: data.requestedPlanCode,
          status: 'PENDING',
        },
      });

      // 4. Create linked invoice
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // Invoice due in 7 days
      
      const invoice = await this.createInvoice({
        businessId: data.businessId,
        subscriptionId: data.subscriptionId,
        amount: price,
        dueDate,
        changeRequestId: request.id,
      }, client);

      // 5. Log audit event
      await this.auditService.log({
        businessId: data.businessId,
        action: 'SUBSCRIPTION_UPGRADE_REQUESTED',
        entityType: 'SubscriptionChangeRequest',
        entityId: request.id,
        newData: { request, invoiceId: invoice.id },
        tx: client,
      });

      return { ...request, invoice };
    };

    if (tx) {
      return await execute(tx);
    } else {
      return await prisma.$transaction(async (client: Prisma.TransactionClient) => {
        return await execute(client);
      });
    }
  }

  /**
   * Create a renewal request.
   */
  async createRenewalRequest(data: {
    businessId: string;
    subscriptionId: string;
    requestedPlanCode: string;
  }, tx?: Prisma.TransactionClient) {
    const db = tx || prisma;

    // 1. Verify subscription
    const subscription = await db.subscription.findUnique({
      where: { id: data.subscriptionId },
    });
    if (!subscription) {
      throw new AppError('Subscription not found', httpStatus.NOT_FOUND);
    }
    if (subscription.businessId !== data.businessId) {
      throw new AppError('Subscription does not belong to the specified business', httpStatus.BAD_REQUEST);
    }

    // 2. Validate plan code exists
    const plan = await db.subscriptionPlan.findUnique({
      where: { code: data.requestedPlanCode },
    });
    if (!plan) {
      throw new AppError(`Subscription plan ${data.requestedPlanCode} does not exist`, httpStatus.NOT_FOUND);
    }

    const price = Number(plan.price);

    const execute = async (client: Prisma.TransactionClient) => {
      // 3. Create change request record
      const request = await client.subscriptionChangeRequest.create({
        data: {
          businessId: data.businessId,
          subscriptionId: data.subscriptionId,
          type: 'RENEWAL',
          requestedPlanCode: data.requestedPlanCode,
          status: 'PENDING',
        },
      });

      // 4. Create linked invoice
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // Invoice due in 7 days
      
      const invoice = await this.createInvoice({
        businessId: data.businessId,
        subscriptionId: data.subscriptionId,
        amount: price,
        dueDate,
        changeRequestId: request.id,
      }, client);

      // 5. Log audit event
      await this.auditService.log({
        businessId: data.businessId,
        action: 'SUBSCRIPTION_RENEWAL_REQUESTED',
        entityType: 'SubscriptionChangeRequest',
        entityId: request.id,
        newData: { request, invoiceId: invoice.id },
        tx: client,
      });

      return { ...request, invoice };
    };

    if (tx) {
      return await execute(tx);
    } else {
      return await prisma.$transaction(async (client: Prisma.TransactionClient) => {
        return await execute(client);
      });
    }
  }

  /**
   * Retrieve all billing components for a business.
   */
  async getBillingHistory(businessId: string) {
    const [invoices, payments, changeRequests] = await Promise.all([
      prisma.subscriptionInvoice.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subscriptionPayment.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.subscriptionChangeRequest.findMany({
        where: { businessId },
        orderBy: { requestedAt: 'desc' },
      }),
    ]);

    return {
      invoices,
      payments,
      changeRequests,
    };
  }

  /**
   * Create a payment session using a specified gateway.
   */
  async createPaymentSession(data: {
    businessId: string;
    invoiceId: string;
    gateway: PaymentGateway | string;
  }) {
    const gatewayEnum = typeof data.gateway === 'string' 
      ? data.gateway.toUpperCase() as PaymentGateway 
      : data.gateway;

    // Validate if valid gateway
    if (!Object.values(PaymentGateway).includes(gatewayEnum)) {
      throw new AppError(`Invalid payment gateway: ${data.gateway}`, httpStatus.BAD_REQUEST);
    }

    // 1. Fetch & Validate Invoice
    const invoice = await prisma.subscriptionInvoice.findUnique({
      where: { id: data.invoiceId },
    });
    if (!invoice) {
      throw new AppError('Invoice not found', httpStatus.NOT_FOUND);
    }

    // Invoice belongs to tenant
    if (invoice.businessId !== data.businessId) {
      throw new AppError('Invoice does not belong to this business context', httpStatus.BAD_REQUEST);
    }

    // Invoice status = PENDING
    if (invoice.status !== 'PENDING') {
      throw new AppError(`Cannot pay an invoice that is ${invoice.status}`, httpStatus.BAD_REQUEST);
    }

    // Amount > 0
    if (Number(invoice.amount) <= 0) {
      throw new AppError('Invoice amount must be greater than zero', httpStatus.BAD_REQUEST);
    }

    // No VERIFIED payment exists on this invoice
    const existingVerifiedPayment = await prisma.subscriptionPayment.findFirst({
      where: {
        invoiceId: invoice.id,
        status: 'VERIFIED',
      },
    });
    if (existingVerifiedPayment) {
      throw new AppError('This invoice has already been paid and verified', httpStatus.BAD_REQUEST);
    }

    // 2. Fetch business customer info
    const business = await prisma.business.findUnique({
      where: { id: data.businessId },
    });
    const customerName = business?.name || 'AgriQon Business Partner';
    const customerEmail = business?.email || 'billing@agriqon.com';

    // 3. Initiate payment session via provider
    const provider = GatewayFactory.getProvider(gatewayEnum);
    
    // Temporarily create a pending payment to get a payment ID for the provider session
    const idempotencyKey = `PAY-KEY-${invoice.id}-${gatewayEnum}-${Date.now()}`;
    const payment = await prisma.subscriptionPayment.create({
      data: {
        businessId: data.businessId,
        invoiceId: invoice.id,
        amount: invoice.amount,
        method: gatewayEnum,
        gateway: gatewayEnum,
        status: 'PENDING',
        idempotencyKey,
      },
    });

    try {
      const sessionResult = await provider.createPaymentSession({
        amount: Number(invoice.amount),
        currency: invoice.currency,
        paymentId: payment.id,
        customerName,
        customerEmail,
      });

      if (!sessionResult.success) {
        throw new AppError('Failed to create payment session from provider', httpStatus.INTERNAL_SERVER_ERROR);
      }

      // Update payment record with gateway references
      const updatedPayment = await prisma.subscriptionPayment.update({
        where: { id: payment.id },
        data: {
          gatewayPaymentId: sessionResult.gatewayReference,
        },
      });

      // 4. Log audit event
      await this.auditService.log({
        businessId: data.businessId,
        action: 'PAYMENT_SESSION_CREATED',
        entityType: 'SubscriptionPayment',
        entityId: payment.id,
        newData: {
          paymentId: payment.id,
          gateway: gatewayEnum,
          gatewayReference: sessionResult.gatewayReference,
        },
      });

      return {
        paymentUrl: sessionResult.paymentUrl,
        gatewayReference: sessionResult.gatewayReference,
        payment: updatedPayment,
      };
    } catch (error) {
      // Cleanup the created payment if session creation failed
      await prisma.subscriptionPayment.delete({
        where: { id: payment.id },
      }).catch(() => {});
      throw error;
    }
  }

  /**
   * Get transaction status for a payment.
   */
  async getPaymentStatus(paymentId: string, businessId: string) {
    const payment = await prisma.subscriptionPayment.findUnique({
      where: { id: paymentId },
      include: {
        invoice: true,
      },
    });

    if (!payment) {
      throw new AppError('Subscription payment not found', httpStatus.NOT_FOUND);
    }

    if (payment.businessId !== businessId) {
      throw new AppError('Payment does not belong to this business context', httpStatus.BAD_REQUEST);
    }

    return payment;
  }
}
