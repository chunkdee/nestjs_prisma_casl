import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clean the database
  console.log('Cleaning the database...');
  // Delete all records in the database 
  await prisma.$transaction([
    prisma.note.deleteMany({}),
    prisma.activity.deleteMany({}),
    prisma.task.deleteMany({}),
    prisma.invoice.deleteMany({}),
    prisma.deal.deleteMany({}),
    prisma.quote.deleteMany({}),
    prisma.contact.deleteMany({}),
    prisma.company.deleteMany({}),
    prisma.user.deleteMany({}),
    prisma.permission.deleteMany({}),
    prisma.role.deleteMany({}),
  ]);

  // Create Roles
  console.log('Creating roles...');
  const adminRole = await prisma.role.create({
    data: {
      name: 'ADMIN',
      permissions: {
        create: [
          {
            action: 'manage',
            subject: 'all',
            fields: ['*'],
          },
        ],
      },
    },
  });

  const userRole = await prisma.role.create({
    data: {
      name: 'USER',
      permissions: {
        create: [
          {
            action: 'read',
            subject: 'User',
            fields: ['email', 'firstName', 'lastName'],
          },
          {
            action: 'manage',
            subject: 'Contact',
            fields: ['*'],
          },
        ],
      },
    },
  });

  // Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'User',
      roleId: adminRole.id,
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: await bcrypt.hash('user123', 10),
      firstName: 'Regular',
      lastName: 'User',
      roleId: userRole.id,
    },
  });

  // Create Companies
  const company1 = await prisma.company.create({
    data: {
      name: 'Acme Corp',
      website: 'www.acme.com',
      users: {
        connect: { id: adminUser.id },
      },
    },
  });

  const company2 = await prisma.company.create({
    data: {
      name: 'Tech Solutions',
      website: 'www.techsolutions.com',
      users: {
        connect: { id: regularUser.id },
      },
    },
  });

  // Create Contacts
  const contact1 = await prisma.contact.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@acme.com',
      phone: '123-456-7890',
      userId: adminUser.id,
      companyId: company1.id,
    },
  });

  // Create Notes for Contact
  await prisma.note.create({
    data: {
      content: 'Initial meeting went well',
      contactId: contact1.id,
    },
  });

  // Create Tasks
  await prisma.task.create({
    data: {
      title: 'Follow up with John',
      description: 'Discuss proposal details',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'PENDING',
      userId: adminUser.id,
    },
  });

  // Create Activities
  await prisma.activity.create({
    data: {
      type: 'MEETING',
      description: 'Initial consultation',
      date: new Date(),
      userId: adminUser.id,
      contactId: contact1.id,
    },
  });

  // Create Quotes
  await prisma.quote.create({
    data: {
      amount: 5000.0,
      status: 'PENDING',
      companyId: company1.id,
    },
  });

  // Create Deals
  await prisma.deal.create({
    data: {
      title: 'Annual Contract',
      status: 'IN_PROGRESS',
      amount: 50000.0,
      companyId: company1.id,
    },
  });

  // Create Invoices
  await prisma.invoice.create({
    data: {
      amount: 5000.0,
      status: 'PENDING',
      issuedAt: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      companyId: company1.id,
    },
  });
    console.log('Database seeded successfully!');   
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Disconnecting from the database...');
    // Disconnect from the database
    await prisma.$disconnect();
  });