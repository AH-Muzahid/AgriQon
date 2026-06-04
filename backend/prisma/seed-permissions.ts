import { PrismaClient, BusinessRole } from '../src/generated/client';
import { ALL_PERMISSION_KEYS, DEFAULT_ROLE_PERMISSIONS } from '../src/app/constants/permissions';

const prisma = new PrismaClient();

/**
 * Seed the Permission catalog and default RolePermission mappings.
 *
 * This script is idempotent — it upserts permissions by key and
 * skips role-permission pairs that already exist.
 */
async function seedPermissions() {
  console.log('🔐 Seeding permission catalog...');

  // 1. Upsert all permission keys
  for (const { key, description } of ALL_PERMISSION_KEYS) {
    await prisma.permission.upsert({
      where: { key },
      update: { description },
      create: { key, description },
    });
  }

  console.log(`   ✅ ${ALL_PERMISSION_KEYS.length} permissions provisioned.`);

  // 2. Seed default role→permission mappings
  const roles: Array<{ role: BusinessRole; keys: readonly string[] }> = [
    { role: BusinessRole.OWNER, keys: DEFAULT_ROLE_PERMISSIONS.OWNER },
    { role: BusinessRole.MANAGER, keys: DEFAULT_ROLE_PERMISSIONS.MANAGER },
    { role: BusinessRole.STAFF, keys: DEFAULT_ROLE_PERMISSIONS.STAFF },
  ];

  for (const { role, keys } of roles) {
    let created = 0;
    for (const key of keys) {
      const permission = await prisma.permission.findUnique({ where: { key } });
      if (!permission) {
        console.warn(`   ⚠️  Permission key "${key}" not found — skipping for ${role}.`);
        continue;
      }

      // Upsert to avoid duplicate constraint violations
      await prisma.rolePermission.upsert({
        where: {
          businessRole_permissionId: {
            businessRole: role,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          businessRole: role,
          permissionId: permission.id,
        },
      });
      created++;
    }
    console.log(`   ✅ ${role}: ${created} permission mappings provisioned.`);
  }

  console.log('🔐 Permission seeding complete.');
}

export { seedPermissions };

// Allow running standalone: `npx ts-node prisma/seed-permissions.ts`
if (require.main === module) {
  seedPermissions()
    .catch((e) => {
      console.error('❌ Error seeding permissions:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
