// setup a singleton test database client. 

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

let prismaTest;

export function getTestPrismaClient() { // all the test share the same client
  if (!prismaTest) {
    prismaTest = new PrismaClient({ // new prisma client instance
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL,
        },
      },
    });
  }
  return prismaTest;
}

export async function setupTestDb() { // connect to the test database
  const prisma = getTestPrismaClient();
  await prisma.$connect();
  return prisma;
}

export async function cleanupTestDb() { // clean up the test database
  if (prismaTest) {
    // Clean all tables
    await prismaTest.task.deleteMany();
    await prismaTest.course.deleteMany();
    await prismaTest.user.deleteMany();
  }
}

export async function teardownTestDb() { // disconnect the test database client
  if (prismaTest) {
    await prismaTest.$disconnect();
    prismaTest = null;
  }
}
