import { getTestPrismaClient } from '../lib/testDb.js';

describe('Example Test Suite', () => {
  let prisma;

  beforeAll(() => {
    prisma = getTestPrismaClient();
  });

  test('should connect to test database', async () => {
    const result = await prisma.$queryRaw`SELECT 1 as value`;
    expect(result[0].value).toBe(1);
  });

  test('should create a user', async () => {
    const user = await prisma.user.create({
      data: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'hashedpassword123',
      },
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });

  test('should clean database between tests', async () => {
    const users = await prisma.user.findMany();
    expect(users.length).toBe(0);
  });
});
