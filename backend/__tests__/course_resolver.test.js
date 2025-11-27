import { getTestPrismaClient } from '../lib/testDb.js';
import { CourseResolvers } from '../graphql/resolvers/course_resolver.js';

const prisma = getTestPrismaClient();

describe('Course Resolver Tests', () => {
  let testUser;

  // Create a test user before each test suite
  beforeEach(async () => {
    testUser = await prisma.user.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      },
    });
  });

  describe('Query: courses', () => {
    test('should return all courses', async () => {
      // Create test courses
      await prisma.course.create({
        data: { name: 'Math 101', description: 'Basic Math', userId: testUser.id },
      });
      await prisma.course.create({
        data: { name: 'Science 101', description: 'Basic Science', userId: testUser.id },
      });

      const result = await CourseResolvers.Query.courses();

      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Math 101');
      expect(result[1].name).toBe('Science 101');
      expect(result[0].user).toBeDefined();
      expect(result[0].tasks).toEqual([]);
    });

    test('should return empty array when no courses exist', async () => {
      const result = await CourseResolvers.Query.courses();
      expect(result).toEqual([]);
    });

    test('should include user and tasks in response', async () => {
      const course = await prisma.course.create({
        data: { name: 'Math 101', userId: testUser.id },
      });

      await prisma.task.create({
        data: {
          title: 'Homework 1',
          deadline: new Date(),
          userId: testUser.id,
          courseId: course.id,
        },
      });

      const result = await CourseResolvers.Query.courses();

      expect(result[0].user.id).toBe(testUser.id);
      expect(result[0].tasks.length).toBe(1);
    });
  });

  describe('Query: course', () => {
    test('should return a single course by ID', async () => {
      const course = await prisma.course.create({
        data: { name: 'Math 101', description: 'Algebra', userId: testUser.id },
      });

      const result = await CourseResolvers.Query.course(null, { id: course.id });

      expect(result).toBeDefined();
      expect(result.id).toBe(course.id);
      expect(result.name).toBe('Math 101');
      expect(result.description).toBe('Algebra');
      expect(result.user).toBeDefined();
      expect(result.tasks).toEqual([]);
    });

    test('should return null for non-existent course', async () => {
      const result = await CourseResolvers.Query.course(null, { id: 99999 });
      expect(result).toBeNull();
    });

    test('should include user and tasks', async () => {
      const course = await prisma.course.create({
        data: { name: 'Math 101', userId: testUser.id },
      });

      await prisma.task.create({
        data: {
          title: 'Task 1',
          deadline: new Date(),
          userId: testUser.id,
          courseId: course.id,
        },
      });

      const result = await CourseResolvers.Query.course(null, { id: course.id });

      expect(result.user.id).toBe(testUser.id);
      expect(result.tasks.length).toBe(1);
      expect(result.tasks[0].title).toBe('Task 1');
    });
  });

  describe('Query: coursesByUser', () => {
    test('should return all courses for a specific user', async () => {
      // Create another user
      const anotherUser = await prisma.user.create({
        data: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          password: 'password456',
        },
      });

      // Create courses for both users
      await prisma.course.create({
        data: { name: 'Math 101', userId: testUser.id },
      });
      await prisma.course.create({
        data: { name: 'Science 101', userId: testUser.id },
      });
      await prisma.course.create({
        data: { name: 'History 101', userId: anotherUser.id },
      });

      const result = await CourseResolvers.Query.coursesByUser(null, {
        userId: testUser.id,
      });

      expect(result.length).toBe(2);
      expect(result[0].name).toBe('Math 101');
      expect(result[1].name).toBe('Science 101');
      expect(result[0].user.id).toBe(testUser.id);
    });

    test('should return empty array for user with no courses', async () => {
      const anotherUser = await prisma.user.create({
        data: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          password: 'password456',
        },
      });

      const result = await CourseResolvers.Query.coursesByUser(null, {
        userId: anotherUser.id,
      });

      expect(result).toEqual([]);
    });

    test('should return empty array for non-existent user', async () => {
      const result = await CourseResolvers.Query.coursesByUser(null, {
        userId: 99999,
      });

      expect(result).toEqual([]);
    });
  });

  describe('Mutation: createCourse', () => {
    test('should create a new course', async () => {
      const result = await CourseResolvers.Mutation.createCourse(null, {
        name: 'Math 101',
        description: 'Introduction to Algebra',
        userId: testUser.id,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe('Math 101');
      expect(result.description).toBe('Introduction to Algebra');
      expect(result.userId).toBe(testUser.id);
      expect(result.user).toBeDefined();
      expect(result.tasks).toEqual([]);
      expect(result.createdAt).toBeDefined();
    });

    test('should create course with null description', async () => {
      const result = await CourseResolvers.Mutation.createCourse(null, {
        name: 'Math 101',
        description: null,
        userId: testUser.id,
      });

      expect(result.name).toBe('Math 101');
      expect(result.description).toBeNull();
    });

    test('should create course without description', async () => {
      const result = await CourseResolvers.Mutation.createCourse(null, {
        name: 'Math 101',
        userId: testUser.id,
      });

      expect(result.name).toBe('Math 101');
      expect(result.description).toBeNull();
    });

    test('should fail when creating course with non-existent user', async () => {
      await expect(
        CourseResolvers.Mutation.createCourse(null, {
          name: 'Math 101',
          description: 'Algebra',
          userId: 99999,
        })
      ).rejects.toThrow();
    });
  });

  describe('Mutation: updateCourse', () => {
    test('should update course name', async () => {
      const course = await prisma.course.create({
        data: { name: 'Math 101', description: 'Algebra', userId: testUser.id },
      });

      const result = await CourseResolvers.Mutation.updateCourse(null, {
        id: course.id,
        name: 'Math 102',
      });

      expect(result.id).toBe(course.id);
      expect(result.name).toBe('Math 102');
      expect(result.description).toBe('Algebra'); // Unchanged
    });

    test('should update course description', async () => {
      const course = await prisma.course.create({
        data: { name: 'Math 101', description: 'Algebra', userId: testUser.id },
      });

      const result = await CourseResolvers.Mutation.updateCourse(null, {
        id: course.id,
        description: 'Advanced Algebra',
      });

      expect(result.id).toBe(course.id);
      expect(result.name).toBe('Math 101'); // Unchanged
      expect(result.description).toBe('Advanced Algebra');
    });

    test('should update multiple fields', async () => {
      const course = await prisma.course.create({
        data: { name: 'Math 101', description: 'Algebra', userId: testUser.id },
      });

      const result = await CourseResolvers.Mutation.updateCourse(null, {
        id: course.id,
        name: 'Math 102',
        description: 'Geometry',
      });

      expect(result.name).toBe('Math 102');
      expect(result.description).toBe('Geometry');
    });

    test('should update only provided fields', async () => {
      const course = await prisma.course.create({
        data: { name: 'Math 101', description: 'Algebra', userId: testUser.id },
      });

      const result = await CourseResolvers.Mutation.updateCourse(null, {
        id: course.id,
        name: 'Math 102',
      });

      expect(result.name).toBe('Math 102');
      expect(result.description).toBe('Algebra'); // Unchanged
      expect(result.userId).toBe(testUser.id); // Unchanged
    });

    test('should fail when updating non-existent course', async () => {
      await expect(
        CourseResolvers.Mutation.updateCourse(null, {
          id: 99999,
          name: 'Updated Course',
        })
      ).rejects.toThrow();
    });
  });

  describe('Mutation: deleteCourse', () => {
    test('should delete an existing course', async () => {
      const course = await prisma.course.create({
        data: { name: 'Math 101', userId: testUser.id },
      });

      const result = await CourseResolvers.Mutation.deleteCourse(null, {
        id: course.id,
      });

      expect(result.id).toBe(course.id);
      expect(result.name).toBe('Math 101');

      // Verify course is actually deleted
      const courses = await prisma.course.findMany({ where: { id: course.id } });
      expect(courses.length).toBe(0);
    });

    test('should fail when deleting non-existent course', async () => {
      await expect(
        CourseResolvers.Mutation.deleteCourse(null, { id: 99999 })
      ).rejects.toThrow();
    });

    test('should cascade delete course tasks', async () => {
      const course = await prisma.course.create({
        data: { name: 'Math 101', userId: testUser.id },
      });

      // Create tasks for the course
      await prisma.task.create({
        data: {
          title: 'Homework 1',
          deadline: new Date(),
          userId: testUser.id,
          courseId: course.id,
        },
      });
      await prisma.task.create({
        data: {
          title: 'Homework 2',
          deadline: new Date(),
          userId: testUser.id,
          courseId: course.id,
        },
      });

      // Delete course
      await CourseResolvers.Mutation.deleteCourse(null, { id: course.id });

      // Verify tasks are also deleted
      const tasks = await prisma.task.findMany({ where: { courseId: course.id } });
      expect(tasks.length).toBe(0);
    });
  });

  describe('Course field resolvers', () => {
    test('should resolve course user', async () => {
      const course = await prisma.course.create({
        data: { name: 'Math 101', userId: testUser.id },
      });

      const resolvedUser = await CourseResolvers.Course.user({
        userId: testUser.id,
      });

      expect(resolvedUser).toBeDefined();
      expect(resolvedUser.id).toBe(testUser.id);
      expect(resolvedUser.email).toBe('john@example.com');
    });

    test('should resolve course tasks', async () => {
      const course = await prisma.course.create({
        data: { name: 'Math 101', userId: testUser.id },
      });

      // Create tasks
      await prisma.task.create({
        data: {
          title: 'Task 1',
          deadline: new Date(),
          userId: testUser.id,
          courseId: course.id,
        },
      });
      await prisma.task.create({
        data: {
          title: 'Task 2',
          deadline: new Date(),
          userId: testUser.id,
          courseId: course.id,
        },
      });

      const tasks = await CourseResolvers.Course.tasks({ id: course.id });

      expect(tasks.length).toBe(2);
      expect(tasks[0].title).toBe('Task 1');
      expect(tasks[1].title).toBe('Task 2');
    });

    test('should return empty array for course with no tasks', async () => {
      const course = await prisma.course.create({
        data: { name: 'Math 101', userId: testUser.id },
      });

      const tasks = await CourseResolvers.Course.tasks({ id: course.id });

      expect(tasks).toEqual([]);
    });

    test('should return null for non-existent user', async () => {
      const resolvedUser = await CourseResolvers.Course.user({ userId: 99999 });
      expect(resolvedUser).toBeNull();
    });
  });
});
