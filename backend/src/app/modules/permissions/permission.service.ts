import { ALL_PERMISSION_KEYS, DEFAULT_ROLE_PERMISSIONS } from '../../constants/permissions';
import { prisma } from '../../lib/prisma';

export class PermissionService {
  /**
   * Get list of module permissions, action permissions, and role mappings
   */
  async getPermissionsMetadata(businessId: string) {
    // 1. Module and Action sets
    const modulesSet = new Set<string>();
    const actionsSet = new Set<string>();

    const permissions = ALL_PERMISSION_KEYS.map((p) => {
      const parts = p.key.split('.');
      const mod = parts[0];
      const act = parts[1] || 'manage';

      modulesSet.add(mod);
      actionsSet.add(act);

      return {
        key: p.key,
        module: mod,
        action: act,
        description: p.description,
      };
    });

    // 2. Fetch Custom Roles for role mappings
    const customRoles = await prisma.customRole.findMany({
      where: { businessId },
      select: { name: true, permissions: true }
    });

    // 3. Construct Role Mappings
    const roleMappings: Record<string, string[]> = {};

    // System roles mappings
    for (const [roleName, keys] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
      roleMappings[roleName] = [...keys];
    }

    // Custom roles mappings
    for (const crole of customRoles) {
      roleMappings[crole.name] = crole.permissions;
    }

    return {
      modules: Array.from(modulesSet),
      actions: Array.from(actionsSet),
      permissions,
      roleMappings,
    };
  }
}
