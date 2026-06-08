import fs from 'fs';
import path from 'path';

function searchFiles(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      searchFiles(filePath, fileList);
    } else if (filePath.endsWith('.ts')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allFiles = searchFiles(path.join(__dirname, '../src/app'));

const findings = {
  authUsages: [] as string[],
  roleImports: [] as string[],
  platformRoleChecks: [] as string[],
  legacyMiddleware: [] as string[]
};

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(path.join(__dirname, '../src/app'), file);

  if (content.includes('auth(') || content.includes('auth (')) {
    findings.authUsages.push(relPath);
  }

  // Look for `Role` in imports from prisma/client
  if (content.match(/import\s*\{[^}]*\bRole\b[^}]*\}\s*from\s*['"].*generated\/client['"]/)) {
    findings.roleImports.push(relPath);
  }
  
  if (content.includes('PlatformRole')) {
    findings.platformRoleChecks.push(relPath);
  }
}

console.log('--- auth() usages ---');
findings.authUsages.forEach(f => console.log(f));

console.log('\n--- Role imports ---');
findings.roleImports.forEach(f => console.log(f));

console.log('\n--- PlatformRole checks ---');
findings.platformRoleChecks.forEach(f => console.log(f));
