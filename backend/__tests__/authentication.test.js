import { getTestPrismaClient } from '../lib/testDb.js';
import { AuthResolvers } from '../graphql/resolvers/auth_resolver.js';
import bcrypt from 'bcryptjs';

const prisma = getTestPrismaClient();

describe('Authentication Resolver Tests', () => {
  describe('Mutation: register', () => {
    test('should register a new user successfully', async () => {
      const result = await AuthResolvers.Mutation.register(null, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result).toBe('User registered successfully');

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: 'john@example.com' },
      });

      expect(user).toBeDefined();
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.password).not.toBe('password123'); // Should be hashed

      // Verify password is hashed correctly
      const isValidPassword = await bcrypt.compare('password123', user.password);
      expect(isValidPassword).toBe(true);
    });

    test('should fail when email is missing', async () => {
      await expect(
        AuthResolvers.Mutation.register(null, {
          firstName: 'John',
          lastName: 'Doe',
          email: '',
          password: 'password123',
        })
      ).rejects.toThrow('All fields are required');
    });

    test('should fail when password is missing', async () => {
      await expect(
        AuthResolvers.Mutation.register(null, {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: '',
        })
      ).rejects.toThrow('All fields are required');
    });

    test('should fail when firstName is missing', async () => {
      await expect(
        AuthResolvers.Mutation.register(null, {
          firstName: '',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('All fields are required');
    });

    test('should fail when lastName is missing', async () => {
      await expect(
        AuthResolvers.Mutation.register(null, {
          firstName: 'John',
          lastName: '',
          email: 'john@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('All fields are required');
    });

    test('should fail with invalid email format', async () => {
      await expect(
        AuthResolvers.Mutation.register(null, {
          firstName: 'John',
          lastName: 'Doe',
          email: 'invalid-email',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid email format');
    });

    test('should fail with invalid email format (missing @)', async () => {
      await expect(
        AuthResolvers.Mutation.register(null, {
          firstName: 'John',
          lastName: 'Doe',
          email: 'invalidemail.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid email format');
    });

    test('should fail when password is too short', async () => {
      await expect(
        AuthResolvers.Mutation.register(null, {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: '12345',
        })
      ).rejects.toThrow('Password must be at least 6 characters long');
    });

    test('should fail when user with email already exists', async () => {
      // First registration
      await AuthResolvers.Mutation.register(null, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'duplicate@example.com',
        password: 'password123',
      });

      // Second registration with same email
      await expect(
        AuthResolvers.Mutation.register(null, {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'duplicate@example.com',
          password: 'password456',
        })
      ).rejects.toThrow('User with this email already exists');
    });

    test('should create multiple users with different emails', async () => {
      const result1 = await AuthResolvers.Mutation.register(null, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const result2 = await AuthResolvers.Mutation.register(null, {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'password456',
      });

      expect(result1).toBe('User registered successfully');
      expect(result2).toBe('User registered successfully');

      const users = await prisma.user.findMany();
      expect(users.length).toBe(2);
    });

    test('should hash different passwords differently', async () => {
      await AuthResolvers.Mutation.register(null, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      await AuthResolvers.Mutation.register(null, {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'password456',
      });

      const user1 = await prisma.user.findUnique({
        where: { email: 'john@example.com' },
      });

      const user2 = await prisma.user.findUnique({
        where: { email: 'jane@example.com' },
      });

      expect(user1.password).not.toBe(user2.password);
    });

    test('should accept password with exactly 6 characters', async () => {
      const result = await AuthResolvers.Mutation.register(null, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: '123456',
      });

      expect(result).toBe('User registered successfully');
    });

    test('should accept valid email with subdomain', async () => {
      const result = await AuthResolvers.Mutation.register(null, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@mail.example.com',
        password: 'password123',
      });

      expect(result).toBe('User registered successfully');
    });
  });
});
