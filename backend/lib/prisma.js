import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

// In test mode, use the test database URL
const getPrismaClient = () => {
  if (process.env.NODE_ENV === 'test' && process.env.TEST_DATABASE_URL) {
    return new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL,
        },
      },
    });
  }
  return new PrismaClient();
};

export const prisma = globalForPrisma.prisma || getPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;