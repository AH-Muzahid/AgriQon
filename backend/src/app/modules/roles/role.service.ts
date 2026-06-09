import { RoleRepository } from './role.repository';
import { DEFAULT_ROLE_PERMISSIONS, ALL_PERMISSION_KEYS } from '../../constants/permissions';
import { AppError } from '../../errors/AppError';
import httpStatus from 'http-status';

export class RoleService {
  private roleRepository: RoleRepository;

  constructor() {
    this.roleRepository = new RoleRepository();
  }

  /**
   * Get all roles (system + custom)
   */
  async getAllRoles(businessId: string) {
    const customRoles = await this.roleRepository.findAllCustom(businessId);

    // Format system roles
    const systemRoles = Object.keys(DEFAULT_ROLE_PERMISSIONS).map((roleName) => {
      const permissions = DEFAULT_ROLE_PERMISSIONS[roleName as 'OWNER' | 'MANAGER' | 'STAFF'];
      return {
        id: `system-${roleName.toLowerCase()}`,
        name: roleName,
        description: `Built-in system role: ${roleName}`,
        isSystem: true,
        permissions,
      };
    });

    // Format custom roles
    const formattedCustom = customRoles.map((role: any) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: false,
      permissions: role.permissions,
    }));

    return [...systemRoles, ...formattedCustom];
  }

  /**
   * Create custom role
   */
  async createCustomRole(businessId: string, data: { name: string; description?: string; permissions: string[] }) {
    // 1. Prevent clashing with system role names
    const systemNames = Object.keys(DEFAULT_ROLE_PERMISSIONS).map((s) => s.toUpperCase());
    if (systemNames.includes(data.name.toUpperCase())) {
      throw new AppError('Cannot create a custom role with a reserved system role name', httpStatus.BAD_REQUEST);
    }

    // 2. Prevent duplicate custom role name in the same business
    const existing = await this.roleRepository.findByName(data.name, businessId);
    if (existing) {
      throw new AppError('Role with this name already exists in this business', httpStatus.BAD_REQUEST);
    }

    // 3. Validate permissions against system catalog
    const validKeys = new Set(ALL_PERMISSION_KEYS.map((p) => p.key));
    const invalidKeys = data.permissions.filter((p) => !validKeys.has(p as any));
    if (invalidKeys.length > 0) {
      throw new AppError(`Invalid permissions specified: ${invalidKeys.join(', ')}`, httpStatus.BAD_REQUEST);
    }

    return await this.roleRepository.create({
      businessId,
      name: data.name,
      description: data.description,
      permissions: data.permissions,
    });
  }

  /**
   * Update custom role
   */
  async updateCustomRole(id: string, businessId: string, data: { description?: string; permissions?: string[] }) {
    const role = await this.roleRepository.findById(id, businessId);
    if (!role) {
      throw new AppError('Custom role not found', httpStatus.NOT_FOUND);
    }

    if (data.permissions) {
      // Validate permissions
      const validKeys = new Set(ALL_PERMISSION_KEYS.map((p) => p.key));
      const invalidKeys = data.permissions.filter((p) => !validKeys.has(p as any));
      if (invalidKeys.length > 0) {
        throw new AppError(`Invalid permissions specified: ${invalidKeys.join(', ')}`, httpStatus.BAD_REQUEST);
      }
    }

    return await this.roleRepository.update(id, businessId, {
      description: data.description,
      permissions: data.permissions,
    });
  }

  /**
   * Delete custom role
   */
  async deleteCustomRole(id: string, businessId: string) {
    const role = await this.roleRepository.findById(id, businessId);
    if (!role) {
      throw new AppError('Custom role not found', httpStatus.NOT_FOUND);
    }

    return await this.roleRepository.delete(id, businessId);
  }
}
