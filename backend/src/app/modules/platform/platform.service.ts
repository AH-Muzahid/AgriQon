import { prisma } from '../../lib/prisma';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';
import os from 'os';
import jwt from 'jsonwebtoken';
import { env } from '../../../config/env';
import { AuditService } from '../audit/audit.service';
import { emailQueue, notificationQueue, reportQueue, accountingQueue, inventoryQueue, customerQueue, reconciliationQueue, aiQueue, searchQueue, subscriptionQueue } from '../../lib/bullmq';

export class PlatformService {
  private auditService: AuditService;

  constructor() {
    this.auditService = new AuditService();
  }

  // 1. Subscription Plans CRUD
  async listPlans() {
    return await prisma.subscriptionPlan.findMany({
      include: {
        features: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async getPlan(id: string) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: { features: true },
    });
    if (!plan) {
      throw new AppError('Subscription plan not found', httpStatus.NOT_FOUND);
    }
    return plan;
  }

  async createPlan(data: {
    code: string;
    name: string;
    price: number;
    currency?: string;
    isTrial?: boolean;
    maxUsers?: number;
    maxProducts?: number;
    maxWarehouses?: number;
    features?: string[];
  }) {
    const existing = await prisma.subscriptionPlan.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      throw new AppError(`Plan with code ${data.code} already exists`, httpStatus.BAD_REQUEST);
    }

    return await prisma.$transaction(async (tx: any) => {
      const plan = await tx.subscriptionPlan.create({
        data: {
          code: data.code,
          name: data.name,
          price: data.price,
          currency: data.currency || 'BDT',
          isTrial: data.isTrial || false,
          maxUsers: data.maxUsers,
          maxProducts: data.maxProducts,
          maxWarehouses: data.maxWarehouses,
        },
      });

      if (data.features && data.features.length > 0) {
        await tx.planFeature.createMany({
          data: data.features.map((key) => ({
            planId: plan.id,
            featureKey: key,
            value: 'true',
          })),
        });
      }

      return await tx.subscriptionPlan.findUnique({
        where: { id: plan.id },
        include: { features: true },
      });
    });
  }

  async updatePlan(id: string, data: {
    name?: string;
    price?: number;
    currency?: string;
    maxUsers?: number;
    maxProducts?: number;
    maxWarehouses?: number;
    features?: string[];
  }) {
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) {
      throw new AppError('Plan not found', httpStatus.NOT_FOUND);
    }

    return await prisma.$transaction(async (tx: any) => {
      const updated = await tx.subscriptionPlan.update({
        where: { id },
        data: {
          name: data.name,
          price: data.price,
          currency: data.currency,
          maxUsers: data.maxUsers,
          maxProducts: data.maxProducts,
          maxWarehouses: data.maxWarehouses,
        },
      });

      if (data.features !== undefined) {
        // Clear existing features and rebuild
        await tx.planFeature.deleteMany({ where: { planId: id } });
        if (data.features.length > 0) {
          await tx.planFeature.createMany({
            data: data.features.map((key) => ({
              planId: id,
              featureKey: key,
              value: 'true',
            })),
          });
        }
      }

      return await tx.subscriptionPlan.findUnique({
        where: { id },
        include: { features: true },
      });
    });
  }

  async deletePlan(id: string) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
      include: { subscriptions: true },
    });
    if (!plan) {
      throw new AppError('Plan not found', httpStatus.NOT_FOUND);
    }
    if (plan.subscriptions.length > 0) {
      throw new AppError('Cannot delete plan with active subscriptions associated', httpStatus.BAD_REQUEST);
    }

    await prisma.subscriptionPlan.delete({
      where: { id },
    });
    return { success: true };
  }

  // 2. Health Monitoring
  async getSystemHealth() {
    let dbStatus = 'UP';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (err) {
      dbStatus = 'DOWN';
    }

    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const cpuLoad = os.loadavg();

    return {
      status: dbStatus === 'UP' ? 'HEALTHY' : 'UNHEALTHY',
      database: dbStatus,
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpuCores: os.cpus().length,
        cpuLoad5Min: cpuLoad[1],
        memoryUsagePercent: Math.round(((totalMem - freeMem) / totalMem) * 100),
        freeMemoryGB: Math.round(freeMem / 1024 / 1024 / 1024 * 100) / 100,
        totalMemoryGB: Math.round(totalMem / 1024 / 1024 / 1024 * 100) / 100,
      },
    };
  }

  // 3. Queue Job Status Diagnostics
  async getQueueMetrics() {
    const queuesList = [
      { name: 'Email', queue: emailQueue },
      { name: 'Notifications', queue: notificationQueue },
      { name: 'Reports', queue: reportQueue },
      { name: 'Accounting', queue: accountingQueue },
      { name: 'Inventory', queue: inventoryQueue },
      { name: 'Customers', queue: customerQueue },
      { name: 'Reconciliation', queue: reconciliationQueue },
      { name: 'AI', queue: aiQueue },
      { name: 'Search', queue: searchQueue },
      { name: 'Subscription', queue: subscriptionQueue },
    ];

    const metrics = [];
    for (const q of queuesList) {
      try {
        const counts = await q.queue.getJobCounts();
        metrics.push({
          name: q.name,
          status: 'ACTIVE',
          active: counts.active,
          completed: counts.completed,
          failed: counts.failed,
          delayed: counts.delayed,
          waiting: counts.waiting,
        });
      } catch (err) {
        metrics.push({
          name: q.name,
          status: 'UNAVAILABLE',
          active: 0,
          completed: 0,
          failed: 0,
          delayed: 0,
          waiting: 0,
        });
      }
    }

    return metrics;
  }

  // 4. Secure Admin Impersonation
  async impersonateUser(adminUser: { id: string; email: string }, targetEmail: string) {
    const targetUser = await prisma.user.findFirst({
      where: { email: targetEmail.toLowerCase() },
    });
    if (!targetUser) {
      throw new AppError(`Target user with email ${targetEmail} not found`, httpStatus.NOT_FOUND);
    }

    if (targetUser.role === 'SUPER_ADMIN') {
      throw new AppError('SUPER_ADMIN users cannot be impersonated', httpStatus.FORBIDDEN);
    }

    // Sign temporary impersonation access token
    const token = jwt.sign(
      {
        id: targetUser.id,
        role: targetUser.role,
        email: targetUser.email,
        businessId: targetUser.businessId,
        organizationId: targetUser.organizationId,
        impersonatedBy: adminUser.email,
      },
      env.jwtSecret,
      { expiresIn: '15m' }
    );

    // Audit the impersonation attempt
    await this.auditService.log({
      businessId: targetUser.businessId || 'platform',
      userId: adminUser.id,
      action: 'PLATFORM_ADMIN_IMPERSONATION',
      entityType: 'User',
      entityId: targetUser.id,
      newData: {
        impersonatorEmail: adminUser.email,
        impersonatedEmail: targetUser.email,
        durationMinutes: 15,
      },
    });

    return {
      accessToken: token,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        businessId: targetUser.businessId,
      },
    };
  }

  // 5. Global Audit Log Listing
  async getGlobalAuditLogs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.auditLog.count(),
    ]);

    return {
      items: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
