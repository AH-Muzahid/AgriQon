import fs from 'fs';
import path from 'path';

function findRouteFiles(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (filePath.endsWith('.routes.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const routeFiles = findRouteFiles(path.join(__dirname, '../src/app/modules'));

let totalRoutes = 0;
let permissionProtected = 0;
let legacyAuth = 0;
let publicRoutes = 0;
let platformAdminRoutes = 0;
let authRequireAuth = 0;

const modulesCoverage: Record<string, any> = {};

for (const file of routeFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const moduleName = path.basename(path.dirname(file));
  
  if (!modulesCoverage[moduleName]) {
    modulesCoverage[moduleName] = { total: 0, perm: 0, legacy: 0, pub: 0, plat: 0, other: 0 };
  }

  // A route is usually defined like router.get(..., ...);
  // We can split the file by 'router.'
  const parts = content.split(/router\.(get|post|put|patch|delete)\(/).slice(1);
  // parts will alternate between method and the rest of the arguments
  
  for (let i = 1; i < parts.length; i += 2) {
    const routeContent = parts[i];
    
    totalRoutes++;
    modulesCoverage[moduleName].total++;
    
    if (routeContent.includes('authorizeAny') || routeContent.includes('authorizeAll')) {
      permissionProtected++;
      modulesCoverage[moduleName].perm++;
    } else if (routeContent.includes('auth(') || routeContent.includes('auth (')) {
      legacyAuth++;
      modulesCoverage[moduleName].legacy++;
    } else if (routeContent.includes('requirePlatformAdmin') || routeContent.includes('requireSuperAdmin')) {
      platformAdminRoutes++;
      modulesCoverage[moduleName].plat++;
    } else if (routeContent.includes('requireAuth')) {
      authRequireAuth++;
      modulesCoverage[moduleName].other++;
    } else {
      publicRoutes++;
      modulesCoverage[moduleName].pub++;
    }
  }
}

console.log(`Total Routes: ${totalRoutes}`);
console.log(`Permission-Protected Routes: ${permissionProtected}`);
console.log(`Legacy auth(Role...) Routes: ${legacyAuth}`);
console.log(`User-Auth Only Routes: ${authRequireAuth}`);
console.log(`Public Routes: ${publicRoutes}`);
console.log(`Platform Admin Routes: ${platformAdminRoutes}`);

console.log('\nModule-by-module coverage table:');
console.table(modulesCoverage);
