import { PrismaClient, Role, OrderStatus, PaymentStatus, MovementType, ProcessingStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // Clean existing data (Optional but recommended for a fresh seed)
  // await prisma.$executeRawUnsafe('TRUNCATE TABLE "Organization" CASCADE');

  // 1. Create Organization
  const organization = await prisma.organization.create({
    data: {
      name: 'AgriQon Global Corp',
    },
  });

  // 2. Create Businesses (Multi-tenancy)
  const businesses = [];
  for (let i = 0; i < 3; i++) {
    const business = await prisma.business.create({
      data: {
        organizationId: organization.id,
        name: faker.company.name() + (i === 0 ? ' Agriculture' : ' Agro Solutions'),
        taxNumber: faker.finance.routingNumber(),
        currency: 'BDT',
      },
    });
    businesses.push(business);
  }

  for (const business of businesses) {
    console.log(`📦 Seeding data for business: ${business.name}`);

    // 3. Create Users
    const users = [];
    const roles: Role[] = [Role.ADMIN, Role.MANAGER, Role.CASHIER, Role.ACCOUNTANT, Role.WAREHOUSE_KEEPER];
    for (const role of roles) {
      const user = await prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          password: 'password123',
          role: role,
          businessId: business.id,
        },
      });
      users.push(user);
    }

    // 4. Create Categories
    const categories = [];
    const catNames = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Equipment', 'Seeds', 'Fertilizers', 'Pesticides'];
    for (const name of catNames) {
      const category = await prisma.category.create({
        data: {
          name,
          businessId: business.id,
        },
      });
      categories.push(category);
    }

    // 5. Create Brands
    const brands = [];
    for (let i = 0; i < 8; i++) {
      const brand = await prisma.brand.create({
        data: {
          name: faker.company.name(),
          businessId: business.id,
        },
      });
      brands.push(brand);
    }

    // 6. Create Warehouses
    const warehouses = [];
    for (let i = 0; i < 3; i++) {
      const warehouse = await prisma.warehouse.create({
        data: {
          name: faker.location.city() + ' Storage ' + (i + 1),
          location: faker.location.streetAddress(),
          businessId: business.id,
        },
      });
      warehouses.push(warehouse);
    }

    // 7. Create Suppliers
    const suppliers = [];
    for (let i = 0; i < 10; i++) {
      const supplier = await prisma.supplier.create({
        data: {
          name: faker.company.name(),
          contact: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          businessId: business.id,
        },
      });
      suppliers.push(supplier);
    }

    // 8. Create Accounts (Finance)
    const accountTypes = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'];
    const accounts = [];
    for (const type of accountTypes) {
      const account = await prisma.account.create({
        data: {
          name: `${type} General Ledger`,
          type,
          code: faker.string.alphanumeric(6).toUpperCase(),
          balance: 100000,
          businessId: business.id,
        },
      });
      accounts.push(account);
    }

    // 9. Create Items (Products)
    const items = [];
    for (let i = 0; i < 40; i++) {
      const price = parseFloat(faker.commerce.price({ min: 20, max: 2000 }));
      const item = await prisma.item.create({
        data: {
          businessId: business.id,
          categoryId: categories[Math.floor(Math.random() * categories.length)].id,
          brandId: brands[Math.floor(Math.random() * brands.length)].id,
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          sku: faker.string.alphanumeric(10).toUpperCase(),
          price: price,
          costPrice: price * 0.6,
          unit: faker.helpers.arrayElement(['kg', 'pcs', 'ltr', 'bag', 'ton']),
          hasBatches: faker.datatype.boolean(0.3),
        },
      });
      items.push(item);

      // 10. Create Product Batches for some items
      let batch = null;
      if (item.hasBatches) {
        batch = await prisma.productBatch.create({
          data: {
            itemId: item.id,
            batchNumber: 'BATCH-' + faker.string.alphanumeric(5).toUpperCase(),
            expiryDate: faker.date.future(),
          },
        });
      }

      // 11. Create Inventory & Stock Movements
      for (const warehouse of warehouses) {
        const stock = faker.number.int({ min: 100, max: 1000 });
        const inventory = await prisma.inventory.create({
          data: {
            businessId: business.id,
            itemId: item.id,
            warehouseId: warehouse.id,
            batchId: batch?.id,
            availableStock: stock,
            totalStock: stock,
          },
        });

        // Initial Stock Movement
        await prisma.stockMovement.create({
          data: {
            businessId: business.id,
            inventoryId: inventory.id,
            type: 'IN',
            quantity: stock,
            reason: 'Initial Seeding',
          },
        });
      }

      // 12. Create Reviews
      const reviewCount = faker.number.int({ min: 0, max: 5 });
      for (let j = 0; j < reviewCount; j++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        await prisma.review.upsert({
          where: {
            userId_itemId: {
              userId: randomUser.id,
              itemId: item.id,
            }
          },
          update: {},
          create: {
            rating: faker.number.int({ min: 3, max: 5 }),
            comment: faker.lorem.sentence(),
            userId: randomUser.id,
            itemId: item.id,
          },
        });
      }
      
      // 13. Create Embeddings
      await prisma.embedding.create({
        data: {
          itemId: item.id,
          vector: Array.from({ length: 5 }, () => Math.random()), // Mock vector
          text: `${item.title} ${item.description}`,
        },
      });
    }

    // 14. Create Customers
    const customers = [];
    for (let i = 0; i < 30; i++) {
      const customer = await prisma.customer.create({
        data: {
          businessId: business.id,
          name: faker.person.fullName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          address: faker.location.streetAddress(),
          loyaltyPoints: faker.number.int({ min: 0, max: 500 }),
        },
      });
      customers.push(customer);
    }

    // 15. Create Orders, OrderItems, Invoices, Payments
    for (let i = 0; i < 50; i++) {
      const customer = customers[Math.floor(Math.random() * customers.length)];
      const orderItemsCount = faker.number.int({ min: 1, max: 6 });
      const selectedItems = faker.helpers.arrayElements(items, orderItemsCount);

      let total = 0;
      const orderItemsData = selectedItems.map(item => {
        const qty = faker.number.int({ min: 1, max: 8 });
        const unitPrice = Number(item.price);
        total += unitPrice * qty;
        return {
          itemId: item.id,
          quantity: qty,
          unitPrice: unitPrice,
        };
      });

      const order = await prisma.order.create({
        data: {
          businessId: business.id,
          customerId: customer.id,
          userId: users[Math.floor(Math.random() * users.length)].id,
          total: total,
          status: faker.helpers.arrayElement([OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.DELIVERED, OrderStatus.SHIPPED]),
          paymentStatus: faker.helpers.arrayElement([PaymentStatus.PENDING, PaymentStatus.PARTIAL, PaymentStatus.COMPLETED]),
          items: {
            create: orderItemsData,
          },
        },
      });

      // Stock Reservation for pending orders
      if (order.status === OrderStatus.PENDING) {
        const firstItem = orderItemsData[0];
        const inventory = await prisma.inventory.findFirst({ where: { itemId: firstItem.itemId } });
        if (inventory) {
          await prisma.stockReservation.create({
            data: {
              businessId: business.id,
              inventoryId: inventory.id,
              orderId: order.id,
              quantity: firstItem.quantity,
              expiresAt: faker.date.future(),
            },
          });
        }
      }

      if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.SHIPPED) {
        await prisma.invoice.create({
          data: {
            businessId: business.id,
            customerId: customer.id,
            orderId: order.id,
            invoiceNumber: 'INV-' + faker.string.alphanumeric(8).toUpperCase(),
            totalAmount: total,
            dueAmount: order.paymentStatus === PaymentStatus.COMPLETED ? 0 : total * 0.5,
            paidAmount: order.paymentStatus === PaymentStatus.COMPLETED ? total : total * 0.5,
          },
        });
      }

      if (order.paymentStatus !== PaymentStatus.PENDING) {
        const paymentAmount = order.paymentStatus === PaymentStatus.COMPLETED ? total : total * 0.5;
        const payment = await prisma.payment.create({
          data: {
            businessId: business.id,
            orderId: order.id,
            amount: paymentAmount,
            method: faker.helpers.arrayElement(['CASH', 'BKASH', 'NAGAD', 'BANK_TRANSFER']),
            status: PaymentStatus.COMPLETED,
            transactionId: 'TXN-' + faker.string.alphanumeric(10).toUpperCase(),
          },
        });

        // Finance: Ledger Entry for payment
        await prisma.ledgerEntry.create({
          data: {
            businessId: business.id,
            accountId: accounts.find(a => a.type === 'REVENUE')?.id || accounts[0].id,
            debit: paymentAmount,
            description: `Payment received for Order ${order.id}`,
            reference: payment.id,
          },
        });
      }
    }

    // 16. Warehouse Transfers
    for (let i = 0; i < 5; i++) {
      if (warehouses.length >= 2) {
        await prisma.warehouseTransfer.create({
          data: {
            sourceId: warehouses[0].id,
            destinationId: warehouses[1].id,
            status: faker.helpers.arrayElement(['PENDING', 'IN_TRANSIT', 'COMPLETED']),
          },
        });
      }
    }

    // 17. System Logs (AuditLog, AiLog)
    for (let i = 0; i < 20; i++) {
      await prisma.auditLog.create({
        data: {
          businessId: business.id,
          userId: users[Math.floor(Math.random() * users.length)].id,
          action: faker.helpers.arrayElement(['CREATE', 'UPDATE', 'DELETE', 'LOGIN']),
          entityType: faker.helpers.arrayElement(['ITEM', 'ORDER', 'USER', 'CUSTOMER']),
          entityId: faker.string.uuid(),
          newData: { info: 'Mock audit data' },
        },
      });

      await prisma.aiLog.create({
        data: {
          userId: users[Math.floor(Math.random() * users.length)].id,
          type: 'CHAT',
          prompt: 'How to increase crop yield?',
          response: 'You should use high-quality seeds and proper fertilizers.',
        },
      });
    }

    // 18. Webhook & Outbox
    await prisma.webhookEvent.create({
      data: {
        businessId: business.id,
        gateway: 'BKASH',
        eventType: 'PAYMENT_COMPLETED',
        payload: { txnId: 'BK123456' },
      },
    });

    await prisma.outboxEvent.create({
      data: {
        businessId: business.id,
        aggregateType: 'ORDER',
        aggregateId: faker.string.uuid(),
        eventType: 'ORDER_CREATED',
        payload: { orderId: 'ORD-999' },
      },
    });
  }

  console.log('✅ Database seeding with Large Dataset completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
