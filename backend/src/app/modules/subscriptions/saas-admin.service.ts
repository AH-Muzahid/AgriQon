import { prisma } from '../../lib/prisma';
import { AuditService } from '../audit/audit.service';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';
import { SubscriptionStatus, Prisma } from '../../../generated/client';

export class SaaSAdminService {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  /**
   * Paginated list of all tenants, subscriptions, and their usage metrics.
   * Utilizes batch queries to completely avoid N+1 query overhead.
   */
  async listTenants(params: {
    page?: number;
    limit?: number;
    planCode?: string;
    status?: SubscriptionStatus;
    search?: string;
    sortBy?: 'createdAt' | 'plan' | 'status' | 'revenue';
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = params.sortBy || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    // Build query conditions
    const where: Prisma.BusinessWhereInput = { deletedAt: null };

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.planCode || params.status) {
      where.subscription = {};
      if (params.planCode) {
        where.subscription.plan = { code: params.planCode };
      }
      if (params.status) {
        where.subscription.status = params.status;
      }
    }

    // Build sorting condition
    let orderBy: Prisma.BusinessOrderByWithRelationInput = { createdAt: sortOrder };

    if (sortBy === 'plan') {
      orderBy = {
        subscription: {
          plan: {
            code: sortOrder,
          },
        },
      };
    } else if (sortBy === 'status') {
      orderBy = {
        subscription: {
          status: sortOrder,
        },
      };
    } else if (sortBy === 'revenue') {
      orderBy = {
        subscription: {
          plan: {
            price: sortOrder,
          },
        },
      };
    }

    // 1. Fetch total count of businesses
    const total = await prisma.business.count({ where });

    // 2. Fetch businesses with subscription details
    const businesses = await prisma.business.findMany({
      where,
      skip,
      take: limit,
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
      orderBy,
    });

    const businessIds = businesses.map((b: any) => b.id);

    // 3. Batch counts to avoid N+1 queries
    const [userCounts, productCounts, warehouseCounts] = await Promise.all([
      prisma.userBusinessRole.groupBy({
        by: ['businessId'],
        where: { businessId: { in: businessIds } },
        _count: { userId: true },
      }),
      prisma.item.groupBy({
        by: ['businessId'],
        where: { businessId: { in: businessIds }, deletedAt: null },
        _count: { id: true },
      }),
      prisma.warehouse.groupBy({
        by: ['businessId'],
        where: { businessId: { in: businessIds } },
        _count: { id: true },
      }),
    ]);

    // Map counts to records for fast lookup
    const userCountMap: Record<string, number> = {};
    const productCountMap: Record<string, number> = {};
    const warehouseCountMap: Record<string, number> = {};

    userCounts.forEach((c: any) => {
      userCountMap[c.businessId] = c._count.userId;
    });
    productCounts.forEach((c: any) => {
      productCountMap[c.businessId] = c._count.id;
    });
    warehouseCounts.forEach((c: any) => {
      warehouseCountMap[c.businessId] = c._count.id;
    });

    // 4. Construct final output
    const tenants = businesses.map((b: any) => ({
      id: b.id,
      name: b.name,
      email: b.email,
      phone: b.phone,
      subscription: b.subscription ? {
        id: b.subscription.id,
        planCode: b.subscription.plan.code,
        planName: b.subscription.plan.name,
        status: b.subscription.status,
        startsAt: b.subscription.startsAt,
        expiresAt: b.subscription.expiresAt,
        graceEndsAt: b.subscription.graceEndsAt,
      } : null,
      usage: {
        users: userCountMap[b.id] || 0,
        products: productCountMap[b.id] || 0,
        warehouses: warehouseCountMap[b.id] || 0,
      },
    }));

    return {
      tenants,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin-only subscription override function.
   * Requires an override reason and logs the previous vs new state atomically.
   */
  async overrideTenantSubscription(
    businessId: string,
    data: {
      planCode?: string;
      expiresAt?: string | Date;
      status?: SubscriptionStatus;
      reason: string;
    }
  ) {
    // 1. Enforce reason validation (reject silent overrides)
    if (!data.reason || data.reason.trim() === '') {
      throw new AppError('An explicit reason must be provided for manual subscription overrides', httpStatus.BAD_REQUEST);
    }

    // 2. Fetch current subscription
    const currentSub = await prisma.subscription.findUnique({
      where: { businessId },
      include: { plan: true },
    });

    if (!currentSub) {
      throw new AppError('Tenant subscription not found', httpStatus.NOT_FOUND);
    }

    const previousValues = {
      planCode: currentSub.plan.code,
      status: currentSub.status,
      expiresAt: currentSub.expiresAt.toISOString(),
      graceEndsAt: currentSub.graceEndsAt ? currentSub.graceEndsAt.toISOString() : null,
    };

    const updateData: Prisma.SubscriptionUpdateInput = {};

    // 3. Handle target plan change if requested
    let targetPlan: any = null;
    if (data.planCode && data.planCode !== currentSub.plan.code) {
      targetPlan = await prisma.subscriptionPlan.findUnique({
        where: { code: data.planCode },
      });
      if (!targetPlan) {
        throw new AppError(`Target plan with code ${data.planCode} not found`, httpStatus.NOT_FOUND);
      }
      updateData.plan = { connect: { id: targetPlan.id } };
    }

    // 4. Update date fields & status
    if (data.expiresAt) {
      updateData.expiresAt = new Date(data.expiresAt);
    }
    if (data.status) {
      updateData.status = data.status;
      if (data.status === 'ACTIVE') {
        updateData.graceEndsAt = null;
      }
    }

    // 5. Apply database updates inside a transaction
    return await prisma.$transaction(async (tx: any) => {
      const updatedSub = await tx.subscription.update({
        where: { id: currentSub.id },
        data: updateData,
        include: { plan: true },
      });

      const newValues = {
        planCode: updatedSub.plan.code,
        status: updatedSub.status,
        expiresAt: updatedSub.expiresAt.toISOString(),
        graceEndsAt: updatedSub.graceEndsAt ? updatedSub.graceEndsAt.toISOString() : null,
      };

      // 6. Record SubscriptionEvent
      await tx.subscriptionEvent.create({
        data: {
          subscriptionId: currentSub.id,
          eventType: 'SUBSCRIPTION_MANUALLY_OVERRIDDEN',
          payload: {
            reason: data.reason,
            previousValues,
            newValues,
          },
        },
      });

      // 7. Log Platform Audit Event
      await this.auditService.log({
        businessId,
        action: 'SUBSCRIPTION_MANUAL_OVERRIDE',
        entityType: 'Subscription',
        entityId: currentSub.id,
        newData: {
          reason: data.reason,
          previousValues,
          newValues,
        },
        tx,
      });

      return updatedSub;
    });
  }

  /**
   * Retrieve manual override history for debugging and support logs.
   */
  async getOverrideHistory(businessId?: string) {
    const where: Prisma.SubscriptionEventWhereInput = {
      eventType: 'SUBSCRIPTION_MANUALLY_OVERRIDDEN',
    };
    if (businessId) {
      where.subscription = {
        businessId,
      };
    }

    const events = await prisma.subscriptionEvent.findMany({
      where,
      include: {
        subscription: {
          include: {
            business: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return events.map((e: any) => ({
      id: e.id,
      subscriptionId: e.subscriptionId,
      businessName: e.subscription.business.name,
      businessId: e.subscription.business.id,
      eventType: e.eventType,
      payload: e.payload,
      createdAt: e.createdAt,
    }));
  }
}
