import { prisma } from '../app/lib/prisma';
import { AccountingRepository } from '../app/modules/accounting/accounting.repository';

async function migrate() {
  const repository = new AccountingRepository();
  const businesses = await prisma.business.findMany();

  console.log(`Starting migration for ${businesses.length} businesses...`);

  const systemAccounts = [
    {
      systemType: 'CASH',
      name: 'Cash on Hand',
      code: '1010',
      type: 'ASSET'
    },
    {
      systemType: 'RECEIVABLE',
      name: 'Accounts Receivable',
      code: '1100',
      type: 'ASSET'
    },
    {
      systemType: 'INVENTORY',
      name: 'Inventory',
      code: '1200',
      type: 'ASSET'
    },
    {
      systemType: 'PAYABLE',
      name: 'Accounts Payable',
      code: '2100',
      type: 'LIABILITY'
    },
    {
      systemType: 'REVENUE',
      name: 'Sales Revenue',
      code: '4000',
      type: 'REVENUE'
    },
    {
      systemType: 'RETURNS',
      name: 'Sales Returns & Allowances',
      code: '4100',
      type: 'REVENUE'
    },
    {
      systemType: 'COGS',
      name: 'Cost of Goods Sold',
      code: '5000',
      type: 'EXPENSE'
    }
  ];

  for (const business of businesses) {
    console.log(`Processing business: ${business.name} (${business.id})`);
    
    for (const config of systemAccounts) {
      try {
        const account = await repository.getOrCreateSystemAccount(business.id, config.systemType, {
          name: config.name,
          code: config.code,
          type: config.type as any
        });
        console.log(`  - ${config.systemType}: ${account.name} (ID: ${account.id})`);
      } catch (error) {
        console.error(`  - Failed to process ${config.systemType} for business ${business.id}:`, error);
      }
    }
  }

  console.log('Migration completed.');
}

migrate()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
