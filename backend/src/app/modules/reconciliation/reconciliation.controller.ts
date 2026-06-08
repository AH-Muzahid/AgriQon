import { Request, Response } from "express";
import { ReconciliationService } from "./reconciliation.service";
import { AuthRequest } from "../../middleware/rbac.middleware";
import { AppError } from "../../errors/AppError";

export class ReconciliationController {
  private reconciliationService: ReconciliationService;

  constructor() {
    this.reconciliationService = new ReconciliationService();
  }

  /**
   * Tenant-scoped integrity check.
   * businessId is derived from the authenticated user's JWT via requireTenant —
   * never from a URL parameter, preventing cross-tenant probing.
   *
   * Route: GET /reconciliation/check
   */
  async checkTenantIntegrity(req: AuthRequest, res: Response) {
    const businessId = req.businessId;
    if (!businessId) throw new AppError("Business context required", 400);

    const results =
      await this.reconciliationService.runFullReconciliation(businessId);
    const isHealthy = results.every((r: any) => r.status !== "FAIL");

    res.json({
      success: true,
      businessId,
      isHealthy,
      results,
    });
  }

  /**
   * Platform-admin integrity check for a specific tenant identified by URL param.
   * Safe only because requirePlatformAdmin prevents non-admin callers.
   *
   * Route: GET /reconciliation/:businessId
   */
  async checkIntegrity(req: Request, res: Response) {
    const businessId = req.params.businessId;
    const results =
      await this.reconciliationService.runFullReconciliation(businessId);
    const isHealthy = results.every((r: any) => r.status !== "FAIL");

    res.json({
      success: true,
      businessId,
      isHealthy,
      results,
    });
  }

  /**
   * Platform-admin global reconciliation across all tenants.
   *
   * Route: GET /reconciliation/global
   */
  async globalCheck(_req: Request, res: Response) {
    const results = await this.reconciliationService.runGlobalReconciliation();

    res.json({
      success: true,
      results,
    });
  }

  /**
   * Platform-admin inventory drift fix.
   * businessId comes from request body (admin explicitly targets a tenant).
   *
   * Route: POST /reconciliation/fix/inventory
   */
  async fixInventory(req: Request, res: Response) {
    const { businessId, inventoryId } = req.body;
    const result = await this.reconciliationService.fixInventoryDrift(
      businessId,
      inventoryId,
    );
    res.json({
      success: true,
      message: "Inventory drift fixed successfully.",
      data: result,
    });
  }

  /**
   * Platform-admin account balance fix.
   *
   * Route: POST /reconciliation/fix/account
   */
  async fixAccount(req: Request, res: Response) {
    const { businessId, accountId } = req.body;
    const result = await this.reconciliationService.fixAccountBalance(
      businessId,
      accountId,
    );
    res.json({
      success: true,
      message: "Account balance fixed successfully.",
      data: result,
    });
  }

  /**
   * Tenant-scoped reconciliation history.
   * businessId is derived from the authenticated user's JWT via requireTenant.
   *
   * Route: GET /reconciliation/history
   */
  async getHistory(req: AuthRequest, res: Response) {
    const businessId = req.businessId;
    if (!businessId) throw new AppError("Business context required", 400);

    const history = await this.reconciliationService.getHistory(businessId);
    res.json({
      success: true,
      history,
    });
  }

  /**
   * Platform-admin outbox retry.
   *
   * Route: POST /reconciliation/fix/outbox
   */
  async retryOutbox(req: Request, res: Response) {
    const { businessId, olderThanHours } = req.body;
    const result = await this.reconciliationService.retryStaleOutboxEvents(
      businessId,
      olderThanHours,
    );
    res.json({
      success: true,
      message: "Stale outbox events identified.",
      data: result,
    });
  }
}
