import { prisma } from '../lib/prisma';
import { BusinessRole } from '../../generated/client';
import { AppError } from '../errors/AppError';

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
      // Fail closed – treat lookup errors as no permissions.
      throw new AppError('Permission lookup failed. Access denied.', 403);
    }
  }
}

