import { prisma } from '../lib/prisma';
import { BusinessRole } from '../../generated/client';
import { AppError } from '../errors/AppError';
import { logger } from '../lib/logger';

/**
 * Service to resolve permissions for a given business role.
 *
 * Currently queries the database directly via Prisma.
 * Structured so a Redis/in-memory cache layer can be added later
 * without changing the public API (callers always call getPermissionsForRole).
 */
export class PermissionService {
  /**
   * Retrieve an array of permission key strings granted to the specified
   * business role. The returned strings correspond to `Permission.key` values
   * in the database and should match the PermissionKey constants.
   *
   * @param role BusinessRole enum value (OWNER | MANAGER | STAFF)
   * @returns Array of granted permission key strings
   * @throws AppError(403) if the lookup fails (fail-closed)
   */
  static async getPermissionsForRole(role: BusinessRole): Promise<string[]> {
    try {
      const rolePerms = await prisma.rolePermission.findMany({
        where: { businessRole: role },
        select: { permission: { select: { key: true } } },
      });
      return rolePerms.map((rp: { permission: { key: string } }) => rp.permission.key);
    } catch (e) {
      logger.error('Error in getPermissionsForRole:', {
        role,
        error: e instanceof Error ? e.message : e,
        stack: e instanceof Error ? e.stack : undefined
      });
      // Fail closed – treat lookup errors as no permissions.
      throw new AppError('Permission lookup failed. Access denied.', 403);
    }
  }

  /**
   * Retrieve combined permissions (standard + custom) for a user within a business.
   */
  static async getPermissionsForUser(userId: string, businessId: string): Promise<string[]> {
    try {
      let permissions: string[] = [];

      // 1. Fetch standard role permissions
      const ubr = await prisma.userBusinessRole.findUnique({
        where: { userId_businessId: { userId, businessId } },
        select: { role: true }
      });

      if (ubr) {
        const standardPerms = await PermissionService.getPermissionsForRole(ubr.role);
        permissions = [...standardPerms];
      }

      // 2. Fetch custom roles permissions
      const customUserRoles = await prisma.userCustomRole.findMany({
        where: {
          userId,
          customRole: { businessId }
        },
        select: {
          customRole: {
            select: { permissions: true }
          }
        }
      });

      for (const cur of customUserRoles) {
        if (cur.customRole && Array.isArray(cur.customRole.permissions)) {
          permissions = [...permissions, ...cur.customRole.permissions];
        }
      }

      return Array.from(new Set(permissions));
    } catch (e) {
      logger.error('Error in getPermissionsForUser:', {
        userId,
        businessId,
        error: e instanceof Error ? e.message : e,
        stack: e instanceof Error ? e.stack : undefined
      });
      throw new AppError('Permission lookup failed. Access denied.', 403);
    }
  }
}

