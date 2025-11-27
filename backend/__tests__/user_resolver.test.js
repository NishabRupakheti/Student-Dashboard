import { getTestPrismaClient } from '../lib/testDb.js';
import { UserResolvers } from '../graphql/resolvers/user_resolver.js';
import bcrypt from 'bcryptjs';

const prisma = getTestPrismaClient();

describe('User Resolver Tests', () => {
  describe('Mutation: createUser', () => {
    test('should create a new user with hashed password', async () => {
      const result = await UserResolvers.Mutation.createUser(null, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.password).not.toBe('password123'); // Should be hashed
      expect(result.courses).toEqual([]);
      expect(result.tasks).toEqual([]);
      expect(result.createdAt).toBeDefined();

      // Verify password is hashed correctly
      const isValidPassword = await bcrypt.compare('password123', result.password);
      expect(isValidPassword).toBe(true);
    });

    test('should fail when creating user with duplicate email', async () => {
      await UserResolvers.Mutation.createUser(null, {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'duplicate@example.com',
        password: 'password123',
      });

      await expect(
        UserResolvers.Mutation.createUser(null, {
          firstName: 'John',
          lastName: 'Doe',
          email: 'duplicate@example.com',
          password: 'password456',
        })
      ).rejects.toThrow();
    });
  });

  describe('Mutation: updateUser', () => {
    test('should update user firstName', async () => {
      const user = await UserResolvers.Mutation.createUser(null, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const updated = await UserResolvers.Mutation.updateUser(null, {
        id: user.id,
        firstName: 'Jane',
      });

      expect(updated.id).toBe(user.id);
      expect(updated.firstName).toBe('Jane');
      expect(updated.lastName).toBe('Doe'); // Unchanged
      expect(updated.email).toBe('john@example.com'); // Unchanged
    });

    test('should update multiple fields', async () => {
      const user = await UserResolvers.Mutation.createUser(null, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const updated = await UserResolvers.Mutation.updateUser(null, {
        id: user.id,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
      });

      expect(updated.firstName).toBe('Jane');
      expect(updated.lastName).toBe('Smith');
      expect(updated.email).toBe('jane.smith@example.com');
    });

    test('should update only provided fields', async () => {
      const user = await UserResolvers.Mutation.createUser(null, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const originalPassword = user.password;

      const updated = await UserResolvers.Mutation.updateUser(null, {
        id: user.id,
        email: 'newemail@example.com',
      });

      expect(updated.email).toBe('newemail@example.com');
      expect(updated.firstName).toBe('John'); // Unchanged
      expect(updated.password).toBe(originalPassword); // Unchanged
    });

    test('should fail when updating non-existent user', async () => {
      await expect(
        UserResolvers.Mutation.updateUser(null, {
          id: 99999,
          firstName: 'Jane',
        })
      ).rejects.toThrow();
    });
  });

  describe('Mutation: deleteUser', () => {
    test('should delete an existing user', async () => {
      const user = await UserResolvers.Mutation.createUser(null, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      });

      const deleted = await UserResolvers.Mutation.deleteUser(null, {
        id: user.id,
      });

      expect(deleted.id).toBe(user.id);
      expect(deleted.email).toBe('john@example.com');

      // Verify user is actually deleted
      const users = await prisma.user.findMany({ where: { id: user.id } });
      expect(users.length).toBe(0);
    });

    test('should fail when deleting non-existent user', async () => {
      await expect(
        UserResolvers.Mutation.deleteUser(null, { id: 99999 })
      ).rejects.toThrow();
    });

    test('should cascade delete user courses and tasks', async () => {
      // Create user
      const user = await prisma.user.create({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
        },
      });

      // Create course
      const course = await prisma.course.create({
        data: {
          name: 'Math 101',
          description: 'Basic Math',
          userId: user.id,
        },
      });

      // Create task
      await prisma.task.create({
        data: {
          title: 'Homework 1',
          deadline: new Date(),
          userId: user.id,
          courseId: course.id,
        },
      });

      // Delete user
      await UserResolvers.Mutation.deleteUser(null, { id: user.id });

      // Verify cascading deletes
      const courses = await prisma.course.findMany({ where: { userId: user.id } });
      const tasks = await prisma.task.findMany({ where: { userId: user.id } });

      expect(courses.length).toBe(0);
      expect(tasks.length).toBe(0);
    });
  });

  describe('User field resolvers', () => {
    test('should resolve user courses', async () => {
      // Create user
      const user = await prisma.user.create({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
        },
      });

      // Create courses
      await prisma.course.create({
        data: { name: 'Math 101', userId: user.id },
      });
      await prisma.course.create({
        data: { name: 'Science 101', userId: user.id },
      });

      const courses = await UserResolvers.User.courses({ id: user.id });

      expect(courses.length).toBe(2);
      expect(courses[0].name).toBe('Math 101');
      expect(courses[1].name).toBe('Science 101');
    });

    test('should resolve user tasks', async () => {
      // Create user and course
      const user = await prisma.user.create({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
        },
      });

      const course = await prisma.course.create({
        data: { name: 'Math 101', userId: user.id },
      });

      // Create tasks
      await prisma.task.create({
        data: {
          title: 'Homework 1',
          deadline: new Date(),
          userId: user.id,
          courseId: course.id,
        },
      });
      await prisma.task.create({
        data: {
          title: 'Homework 2',
          deadline: new Date(),
          userId: user.id,
          courseId: course.id,
        },
      });

      const tasks = await UserResolvers.User.tasks({ id: user.id });

      expect(tasks.length).toBe(2);
      expect(tasks[0].title).toBe('Homework 1');
      expect(tasks[1].title).toBe('Homework 2');
    });

    test('should return empty arrays for user with no courses or tasks', async () => {
      const user = await prisma.user.create({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
        },
      });

      const courses = await UserResolvers.User.courses({ id: user.id });
      const tasks = await UserResolvers.User.tasks({ id: user.id });

      expect(courses).toEqual([]);
      expect(tasks).toEqual([]);
    });
  });

  describe('Course field resolver', () => {
    test('should resolve course user', async () => {
      const user = await prisma.user.create({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
        },
      });

      const course = await prisma.course.create({
        data: { name: 'Math 101', userId: user.id },
      });

      const resolvedUser = await UserResolvers.Course.user({ userId: user.id });

      expect(resolvedUser).toBeDefined();
      expect(resolvedUser.id).toBe(user.id);
      expect(resolvedUser.email).toBe('john@example.com');
    });

    test('should resolve course tasks', async () => {
      const user = await prisma.user.create({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
        },
      });

      const course = await prisma.course.create({
        data: { name: 'Math 101', userId: user.id },
      });

      await prisma.task.create({
        data: {
          title: 'Task 1',
          deadline: new Date(),
          userId: user.id,
          courseId: course.id,
        },
      });

      const tasks = await UserResolvers.Course.tasks({ id: course.id });

      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe('Task 1');
    });
  });

  describe('Task field resolvers', () => {
    test('should resolve task user', async () => {
      const user = await prisma.user.create({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
        },
      });

      const course = await prisma.course.create({
        data: { name: 'Math 101', userId: user.id },
      });

      const task = await prisma.task.create({
        data: {
          title: 'Homework 1',
          deadline: new Date(),
          userId: user.id,
          courseId: course.id,
        },
      });

      const resolvedUser = await UserResolvers.Task.user({ userId: user.id });

      expect(resolvedUser).toBeDefined();
      expect(resolvedUser.id).toBe(user.id);
    });

    test('should resolve task course', async () => {
      const user = await prisma.user.create({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
        },
      });

      const course = await prisma.course.create({
        data: { name: 'Math 101', userId: user.id },
      });

      const task = await prisma.task.create({
        data: {
          title: 'Homework 1',
          deadline: new Date(),
          userId: user.id,
          courseId: course.id,
        },
      });

      const resolvedCourse = await UserResolvers.Task.course({ courseId: course.id });

      expect(resolvedCourse).toBeDefined();
      expect(resolvedCourse.id).toBe(course.id);
      expect(resolvedCourse.name).toBe('Math 101');
    });
  });
});
