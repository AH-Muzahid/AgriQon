import { Role } from '../../../generated/client';
import { Permission, ROLE_PERMISSIONS, hasPermission } from './permissions';
import { RoleRepository } from './role.repository';

export class RoleService {
  constructor(private roleRepository: RoleRepository) {}

  /**
   * Get all permissions for a specific role
   */
  async getRolePermissions(role: Role): Promise<Permission[]> {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Check if a role has a specific permission
   */
  async checkPermission(role: Role, permission: Permission): Promise<boolean> {
    return hasPermission(role, permission);
  }

  /**
   * Update a user's role
   * This should be restricted to ADMINs
   */
  async assignRoleToUser(userId: string, role: Role) {
    return await this.roleRepository.updateUserRole(userId, role);
  }

  /**
   * Get all users with a specific role
   */
  async getUsersByRole(role: Role) {
    return await this.roleRepository.findUsersByRole(role);
  }

  /**
   * Get all available roles
   */
  async getAllRoles(): Promise<string[]> {
    return Object.values(Role);
  }

  /**
   * Get all available permissions
   */
  async getAllPermissions(): Promise<string[]> {
    return Object.values(Permission);
  }
}
