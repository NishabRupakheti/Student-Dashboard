import { getTestPrismaClient } from '../lib/testDb.js';
import { TaskResolvers } from '../graphql/resolvers/task_resolver.js';

const prisma = getTestPrismaClient();

// Helper to create mock request with session
const createMockReq = (userId = null) => ({
  session: {
    userId,
  },
});

describe('Task Resolver Tests', () => {
  let testUser;
  let testCourse;
  let mockReq;

  // Create test user and course before each test
  beforeEach(async () => {
    testUser = await prisma.user.create({
      data: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'password123',
      },
    });

    testCourse = await prisma.course.create({
      data: {
        name: 'Computer Science 101',
        description: 'Introduction to CS',
        userId: testUser.id,
      },
    });

    // Create authenticated mock request
    mockReq = createMockReq(testUser.id);
  });

  describe('Query: tasks', () => {
    test('should return all tasks', async () => {
      await prisma.task.create({
        data: {
          title: 'Assignment 1',
          deadline: new Date('2025-12-01'),
          courseId: testCourse.id,
          userId: testUser.id,
        },
      });
      await prisma.task.create({
        data: {
          title: 'Assignment 2',
          deadline: new Date('2025-12-15'),
          courseId: testCourse.id,
          userId: testUser.id,
        },
      });

      const result = await TaskResolvers.Query.tasks(null, null, { req: mockReq });

      expect(result.length).toBe(2);
      expect(result[0].title).toBe('Assignment 1');
      expect(result[1].title).toBe('Assignment 2');
      expect(result[0].course).toBeDefined();
      expect(result[0].user).toBeDefined();
    });

    test('should return empty array when no tasks exist', async () => {
      const result = await TaskResolvers.Query.tasks(null, null, { req: mockReq });
      expect(result).toEqual([]);
    });

    test('should include course and user in response', async () => {
      await prisma.task.create({
        data: {
          title: 'Test Task',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
        },
      });

      const result = await TaskResolvers.Query.tasks(null, null, { req: mockReq });

      expect(result[0].course.id).toBe(testCourse.id);
      expect(result[0].course.name).toBe('Computer Science 101');
      expect(result[0].user.id).toBe(testUser.id);
      expect(result[0].user.email).toBe('jane@example.com');
    });

    test('should throw error when not authenticated', async () => {
      const unauthReq = createMockReq(null);
      await expect(
        TaskResolvers.Query.tasks(null, null, { req: unauthReq })
      ).rejects.toThrow('Not authenticated');
    });
  });

  describe('Query: task', () => {
    test('should return a single task by ID', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Homework Assignment',
          deadline: new Date('2025-12-10'),
          courseId: testCourse.id,
          userId: testUser.id,
          completed: false,
        },
      });

      const result = await TaskResolvers.Query.task(null, { id: task.id }, { req: mockReq });

      expect(result).toBeDefined();
      expect(result.id).toBe(task.id);
      expect(result.title).toBe('Homework Assignment');
      expect(result.completed).toBe(false);
      expect(result.course).toBeDefined();
      expect(result.user).toBeDefined();
    });

    test('should return null for non-existent task', async () => {
      const result = await TaskResolvers.Query.task(null, { id: 99999 }, { req: mockReq });
      expect(result).toBeNull();
    });

    test('should include course and user relationships', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Test Task',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
        },
      });

      const result = await TaskResolvers.Query.task(null, { id: task.id }, { req: mockReq });

      expect(result.course.id).toBe(testCourse.id);
      expect(result.user.id).toBe(testUser.id);
    });

    test('should throw error when not authenticated', async () => {
      const unauthReq = createMockReq(null);
      await expect(
        TaskResolvers.Query.task(null, { id: 1 }, { req: unauthReq })
      ).rejects.toThrow('Not authenticated');
    });
  });

  describe('Query: tasksByCourse', () => {
    test('should return all tasks for a specific course', async () => {
      const anotherCourse = await prisma.course.create({
        data: {
          name: 'Math 101',
          userId: testUser.id,
        },
      });

      await prisma.task.create({
        data: {
          title: 'CS Task 1',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
        },
      });
      await prisma.task.create({
        data: {
          title: 'CS Task 2',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
        },
      });
      await prisma.task.create({
        data: {
          title: 'Math Task',
          deadline: new Date(),
          courseId: anotherCourse.id,
          userId: testUser.id,
        },
      });

      const result = await TaskResolvers.Query.tasksByCourse(null, {
        courseId: testCourse.id,
      }, { req: mockReq });

      expect(result.length).toBe(2);
      expect(result[0].title).toBe('CS Task 1');
      expect(result[1].title).toBe('CS Task 2');
      expect(result[0].course.id).toBe(testCourse.id);
    });

    test('should return empty array when course has no tasks', async () => {
      const result = await TaskResolvers.Query.tasksByCourse(null, {
        courseId: testCourse.id,
      }, { req: mockReq });
      expect(result).toEqual([]);
    });

    test('should include course and user in response', async () => {
      await prisma.task.create({
        data: {
          title: 'Test Task',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
        },
      });

      const result = await TaskResolvers.Query.tasksByCourse(null, {
        courseId: testCourse.id,
      }, { req: mockReq });

      expect(result[0].course).toBeDefined();
      expect(result[0].user).toBeDefined();
    });

    test('should throw error when not authenticated', async () => {
      const unauthReq = createMockReq(null);
      await expect(
        TaskResolvers.Query.tasksByCourse(null, { courseId: testCourse.id }, { req: unauthReq })
      ).rejects.toThrow('Not authenticated');
    });
  });

  describe('Query: tasksByUser', () => {
    test('should return all tasks for a specific user', async () => {
      const anotherUser = await prisma.user.create({
        data: {
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob@example.com',
          password: 'password123',
        },
      });

      await prisma.task.create({
        data: {
          title: 'Jane Task 1',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
        },
      });
      await prisma.task.create({
        data: {
          title: 'Jane Task 2',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
        },
      });
      await prisma.task.create({
        data: {
          title: 'Bob Task',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: anotherUser.id,
        },
      });

      const result = await TaskResolvers.Query.tasksByUser(null, {
        userId: testUser.id,
      }, { req: mockReq });

      expect(result.length).toBe(2);
      expect(result[0].title).toBe('Jane Task 1');
      expect(result[1].title).toBe('Jane Task 2');
      expect(result[0].user.id).toBe(testUser.id);
    });

    test('should return empty array when user has no tasks', async () => {
      const result = await TaskResolvers.Query.tasksByUser(null, {
        userId: testUser.id,
      }, { req: mockReq });
      expect(result).toEqual([]);
    });

    test('should include course and user in response', async () => {
      await prisma.task.create({
        data: {
          title: 'Test Task',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
        },
      });

      const result = await TaskResolvers.Query.tasksByUser(null, {
        userId: testUser.id,
      }, { req: mockReq });

      expect(result[0].course).toBeDefined();
      expect(result[0].user).toBeDefined();
    });

    test('should throw error when not authenticated', async () => {
      const unauthReq = createMockReq(null);
      await expect(
        TaskResolvers.Query.tasksByUser(null, { userId: testUser.id }, { req: unauthReq })
      ).rejects.toThrow('Not authenticated');
    });
  });

  describe('Query: completedTasks', () => {
    test('should return only completed tasks for a user', async () => {
      await prisma.task.create({
        data: {
          title: 'Completed Task 1',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
          completed: true,
        },
      });
      await prisma.task.create({
        data: {
          title: 'Completed Task 2',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
          completed: true,
        },
      });
      await prisma.task.create({
        data: {
          title: 'Pending Task',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
          completed: false,
        },
      });

      const result = await TaskResolvers.Query.completedTasks(null, {
        userId: testUser.id,
      }, { req: mockReq });

      expect(result.length).toBe(2);
      expect(result[0].title).toBe('Completed Task 1');
      expect(result[1].title).toBe('Completed Task 2');
      expect(result[0].completed).toBe(true);
      expect(result[1].completed).toBe(true);
    });

    test('should return empty array when user has no completed tasks', async () => {
      await prisma.task.create({
        data: {
          title: 'Pending Task',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
          completed: false,
        },
      });

      const result = await TaskResolvers.Query.completedTasks(null, {
        userId: testUser.id,
      }, { req: mockReq });
      expect(result).toEqual([]);
    });

    test('should include course and user in response', async () => {
      await prisma.task.create({
        data: {
          title: 'Completed Task',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
          completed: true,
        },
      });

      const result = await TaskResolvers.Query.completedTasks(null, {
        userId: testUser.id,
      }, { req: mockReq });

      expect(result[0].course).toBeDefined();
      expect(result[0].user).toBeDefined();
    });

    test('should throw error when not authenticated', async () => {
      const unauthReq = createMockReq(null);
      await expect(
        TaskResolvers.Query.completedTasks(null, { userId: testUser.id }, { req: unauthReq })
      ).rejects.toThrow('Not authenticated');
    });
  });

  describe('Query: pendingTasks', () => {
    test('should return only pending tasks for a user', async () => {
      await prisma.task.create({
        data: {
          title: 'Pending Task 1',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
          completed: false,
        },
      });
      await prisma.task.create({
        data: {
          title: 'Pending Task 2',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
          completed: false,
        },
      });
      await prisma.task.create({
        data: {
          title: 'Completed Task',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
          completed: true,
        },
      });

      const result = await TaskResolvers.Query.pendingTasks(null, {
        userId: testUser.id,
      }, { req: mockReq });

      expect(result.length).toBe(2);
      expect(result[0].title).toBe('Pending Task 1');
      expect(result[1].title).toBe('Pending Task 2');
      expect(result[0].completed).toBe(false);
      expect(result[1].completed).toBe(false);
    });

    test('should return empty array when user has no pending tasks', async () => {
      await prisma.task.create({
        data: {
          title: 'Completed Task',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
          completed: true,
        },
      });

      const result = await TaskResolvers.Query.pendingTasks(null, {
        userId: testUser.id,
      }, { req: mockReq });
      expect(result).toEqual([]);
    });

    test('should include course and user in response', async () => {
      await prisma.task.create({
        data: {
          title: 'Pending Task',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
          completed: false,
        },
      });

      const result = await TaskResolvers.Query.pendingTasks(null, {
        userId: testUser.id,
      }, { req: mockReq });

      expect(result[0].course).toBeDefined();
      expect(result[0].user).toBeDefined();
    });

    test('should throw error when not authenticated', async () => {
      const unauthReq = createMockReq(null);
      await expect(
        TaskResolvers.Query.pendingTasks(null, { userId: testUser.id }, { req: unauthReq })
      ).rejects.toThrow('Not authenticated');
    });
  });

  describe('Mutation: createTask', () => {
    test('should create a new task with all fields for authenticated user', async () => {
      const deadline = new Date('2025-12-20');
      const result = await TaskResolvers.Mutation.createTask(null, {
        title: 'New Assignment',
        deadline: deadline.toISOString(),
        courseId: testCourse.id,
        completed: false,
      }, { req: mockReq });

      expect(result).toBeDefined();
      expect(result.title).toBe('New Assignment');
      expect(new Date(result.deadline).toISOString()).toBe(deadline.toISOString());
      expect(result.courseId).toBe(testCourse.id);
      expect(result.userId).toBe(testUser.id);
      expect(result.completed).toBe(false);
      expect(result.course).toBeDefined();
      expect(result.user).toBeDefined();
    });

    test('should create a task with completed defaulting to false', async () => {
      const result = await TaskResolvers.Mutation.createTask(null, {
        title: 'Task Without Completion',
        deadline: new Date().toISOString(),
        courseId: testCourse.id,
      }, { req: mockReq });

      expect(result.completed).toBe(false);
    });

    test('should create a completed task', async () => {
      const result = await TaskResolvers.Mutation.createTask(null, {
        title: 'Completed Task',
        deadline: new Date().toISOString(),
        courseId: testCourse.id,
        completed: true,
      }, { req: mockReq });

      expect(result.completed).toBe(true);
    });

    test('should include course and user in response', async () => {
      const result = await TaskResolvers.Mutation.createTask(null, {
        title: 'Test Task',
        deadline: new Date().toISOString(),
        courseId: testCourse.id,
      }, { req: mockReq });

      expect(result.course.id).toBe(testCourse.id);
      expect(result.course.name).toBe('Computer Science 101');
      expect(result.user.id).toBe(testUser.id);
      expect(result.user.email).toBe('jane@example.com');
    });

    test('should handle date conversion correctly', async () => {
      const deadline = new Date('2025-12-31T23:59:59Z');
      const result = await TaskResolvers.Mutation.createTask(null, {
        title: 'Date Test Task',
        deadline: deadline.toISOString(),
        courseId: testCourse.id,
      }, { req: mockReq });

      expect(new Date(result.deadline).toISOString()).toBe(deadline.toISOString());
    });

    test('should throw error when not authenticated', async () => {
      const unauthReq = createMockReq(null);
      await expect(
        TaskResolvers.Mutation.createTask(null, {
          title: 'New Task',
          deadline: new Date().toISOString(),
          courseId: testCourse.id,
        }, { req: unauthReq })
      ).rejects.toThrow('Not authenticated');
    });

    test('should throw error when course not found', async () => {
      await expect(
        TaskResolvers.Mutation.createTask(null, {
          title: 'New Task',
          deadline: new Date().toISOString(),
          courseId: 99999,
        }, { req: mockReq })
      ).rejects.toThrow('Course not found');
    });

    test('should throw error when user does not own the course', async () => {
      const anotherUser = await prisma.user.create({
        data: {
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob@example.com',
          password: 'password123',
        },
      });

      const anotherCourse = await prisma.course.create({
        data: {
          name: 'Bob Course',
          userId: anotherUser.id,
        },
      });

      await expect(
        TaskResolvers.Mutation.createTask(null, {
          title: 'New Task',
          deadline: new Date().toISOString(),
          courseId: anotherCourse.id,
        }, { req: mockReq })
      ).rejects.toThrow('Not authorized');
    });
  });

  describe('Mutation: updateTask', () => {
    let task;

    beforeEach(async () => {
      task = await prisma.task.create({
        data: {
          title: 'Original Title',
          deadline: new Date('2025-12-01'),
          courseId: testCourse.id,
          userId: testUser.id,
          completed: false,
        },
      });
    });

    test('should update task title when owner', async () => {
      const result = await TaskResolvers.Mutation.updateTask(null, {
        id: task.id,
        title: 'Updated Title',
      }, { req: mockReq });

      expect(result.title).toBe('Updated Title');
      expect(result.id).toBe(task.id);
    });

    test('should update task deadline', async () => {
      const newDeadline = new Date('2025-12-15');
      const result = await TaskResolvers.Mutation.updateTask(null, {
        id: task.id,
        deadline: newDeadline.toISOString(),
      }, { req: mockReq });

      expect(new Date(result.deadline).toISOString()).toBe(newDeadline.toISOString());
    });

    test('should update task completion status', async () => {
      const result = await TaskResolvers.Mutation.updateTask(null, {
        id: task.id,
        completed: true,
      }, { req: mockReq });

      expect(result.completed).toBe(true);
    });

    test('should update multiple fields at once', async () => {
      const newDeadline = new Date('2025-12-20');
      const result = await TaskResolvers.Mutation.updateTask(null, {
        id: task.id,
        title: 'New Title',
        deadline: newDeadline.toISOString(),
        completed: true,
      }, { req: mockReq });

      expect(result.title).toBe('New Title');
      expect(new Date(result.deadline).toISOString()).toBe(newDeadline.toISOString());
      expect(result.completed).toBe(true);
    });

    test('should not update fields that are not provided', async () => {
      const originalDeadline = task.deadline;
      const result = await TaskResolvers.Mutation.updateTask(null, {
        id: task.id,
        title: 'Only Title Updated',
      }, { req: mockReq });

      expect(result.title).toBe('Only Title Updated');
      expect(result.deadline.toISOString()).toBe(originalDeadline.toISOString());
      expect(result.completed).toBe(false);
    });

    test('should include course and user in response', async () => {
      const result = await TaskResolvers.Mutation.updateTask(null, {
        id: task.id,
        title: 'Updated',
      }, { req: mockReq });

      expect(result.course).toBeDefined();
      expect(result.user).toBeDefined();
    });

    test('should throw error when not authenticated', async () => {
      const unauthReq = createMockReq(null);
      await expect(
        TaskResolvers.Mutation.updateTask(null, {
          id: task.id,
          title: 'Updated',
        }, { req: unauthReq })
      ).rejects.toThrow('Not authenticated');
    });

    test('should throw error when task not found', async () => {
      await expect(
        TaskResolvers.Mutation.updateTask(null, {
          id: 99999,
          title: 'Updated',
        }, { req: mockReq })
      ).rejects.toThrow('Task not found');
    });

    test('should throw error when user does not own the task', async () => {
      const anotherUser = await prisma.user.create({
        data: {
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob@example.com',
          password: 'password123',
        },
      });

      const anotherTask = await prisma.task.create({
        data: {
          title: 'Bob Task',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: anotherUser.id,
        },
      });

      await expect(
        TaskResolvers.Mutation.updateTask(null, {
          id: anotherTask.id,
          title: 'Hacked',
        }, { req: mockReq })
      ).rejects.toThrow('Not authorized');
    });
  });

  describe('Mutation: toggleTaskCompletion', () => {
    test('should toggle task from incomplete to complete when owner', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Toggle Test',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
          completed: false,
        },
      });

      const result = await TaskResolvers.Mutation.toggleTaskCompletion(null, {
        id: task.id,
      }, { req: mockReq });

      expect(result.completed).toBe(true);
      expect(result.id).toBe(task.id);
    });

    test('should toggle task from complete to incomplete', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Toggle Test',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
          completed: true,
        },
      });

      const result = await TaskResolvers.Mutation.toggleTaskCompletion(null, {
        id: task.id,
      }, { req: mockReq });

      expect(result.completed).toBe(false);
    });

    test('should toggle multiple times correctly', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Multiple Toggle Test',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
          completed: false,
        },
      });

      let result = await TaskResolvers.Mutation.toggleTaskCompletion(null, {
        id: task.id,
      }, { req: mockReq });
      expect(result.completed).toBe(true);

      result = await TaskResolvers.Mutation.toggleTaskCompletion(null, {
        id: task.id,
      }, { req: mockReq });
      expect(result.completed).toBe(false);

      result = await TaskResolvers.Mutation.toggleTaskCompletion(null, {
        id: task.id,
      }, { req: mockReq });
      expect(result.completed).toBe(true);
    });

    test('should include course and user in response', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Toggle Test',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
          completed: false,
        },
      });

      const result = await TaskResolvers.Mutation.toggleTaskCompletion(null, {
        id: task.id,
      }, { req: mockReq });

      expect(result.course).toBeDefined();
      expect(result.user).toBeDefined();
    });

    test('should throw error when not authenticated', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Toggle Test',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
          completed: false,
        },
      });

      const unauthReq = createMockReq(null);
      await expect(
        TaskResolvers.Mutation.toggleTaskCompletion(null, { id: task.id }, { req: unauthReq })
      ).rejects.toThrow('Not authenticated');
    });

    test('should throw error when task not found', async () => {
      await expect(
        TaskResolvers.Mutation.toggleTaskCompletion(null, { id: 99999 }, { req: mockReq })
      ).rejects.toThrow('Task not found');
    });

    test('should throw error when user does not own the task', async () => {
      const anotherUser = await prisma.user.create({
        data: {
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob@example.com',
          password: 'password123',
        },
      });

      const anotherTask = await prisma.task.create({
        data: {
          title: 'Bob Task',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: anotherUser.id,
          completed: false,
        },
      });

      await expect(
        TaskResolvers.Mutation.toggleTaskCompletion(null, { id: anotherTask.id }, { req: mockReq })
      ).rejects.toThrow('Not authorized');
    });
  });

  describe('Mutation: deleteTask', () => {
    test('should delete a task when owner', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Task to Delete',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
        },
      });

      const result = await TaskResolvers.Mutation.deleteTask(null, {
        id: task.id,
      }, { req: mockReq });

      expect(result.id).toBe(task.id);
      expect(result.title).toBe('Task to Delete');

      const deletedTask = await prisma.task.findUnique({
        where: { id: task.id },
      });
      expect(deletedTask).toBeNull();
    });

    test('should include course and user in delete response', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Task to Delete',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
        },
      });

      const result = await TaskResolvers.Mutation.deleteTask(null, {
        id: task.id,
      }, { req: mockReq });

      expect(result.course).toBeDefined();
      expect(result.user).toBeDefined();
    });

    test('should throw error when not authenticated', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Task to Delete',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
        },
      });

      const unauthReq = createMockReq(null);
      await expect(
        TaskResolvers.Mutation.deleteTask(null, { id: task.id }, { req: unauthReq })
      ).rejects.toThrow('Not authenticated');
    });

    test('should throw error when task not found', async () => {
      await expect(
        TaskResolvers.Mutation.deleteTask(null, { id: 99999 }, { req: mockReq })
      ).rejects.toThrow('Task not found');
    });

    test('should throw error when user does not own the task', async () => {
      const anotherUser = await prisma.user.create({
        data: {
          firstName: 'Bob',
          lastName: 'Johnson',
          email: 'bob@example.com',
          password: 'password123',
        },
      });

      const anotherTask = await prisma.task.create({
        data: {
          title: 'Bob Task',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: anotherUser.id,
        },
      });

      await expect(
        TaskResolvers.Mutation.deleteTask(null, { id: anotherTask.id }, { req: mockReq })
      ).rejects.toThrow('Not authorized');
    });
  });

  describe('Field Resolvers: Task.course', () => {
    test('should resolve course for a task', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Test Task',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
        },
      });

      const result = await TaskResolvers.Task.course({
        courseId: testCourse.id,
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(testCourse.id);
      expect(result.name).toBe('Computer Science 101');
    });

    test('should return null for non-existent course', async () => {
      const result = await TaskResolvers.Task.course({
        courseId: 99999,
      });

      expect(result).toBeNull();
    });
  });

  describe('Field Resolvers: Task.user', () => {
    test('should resolve user for a task', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Test Task',
          deadline: new Date(),
          courseId: testCourse.id,
          userId: testUser.id,
        },
      });

      const result = await TaskResolvers.Task.user({
        userId: testUser.id,
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(testUser.id);
      expect(result.email).toBe('jane@example.com');
      expect(result.firstName).toBe('Jane');
    });

    test('should return null for non-existent user', async () => {
      const result = await TaskResolvers.Task.user({
        userId: 99999,
      });

      expect(result).toBeNull();
    });
  });
});
