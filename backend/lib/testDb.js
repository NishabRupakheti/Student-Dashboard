import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

let prismaTest;

export function getTestPrismaClient() {
  if (!prismaTest) {
    prismaTest = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL,
        },
      },
    });
  }
  return prismaTest;
}

export async function setupTestDb() {
  const prisma = getTestPrismaClient();
  await prisma.$connect();
  return prisma;
}

export async function cleanupTestDb() {
  if (prismaTest) {
    // Clean all tables
    await prismaTest.task.deleteMany();
    await prismaTest.course.deleteMany();
    await prismaTest.user.deleteMany();
  }
}

export async function teardownTestDb() {
  if (prismaTest) {
    await prismaTest.$disconnect();
    prismaTest = null;
  }
}
