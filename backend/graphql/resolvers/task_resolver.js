// Task resolver functions for handling GraphQL requests

import prisma from "../../lib/prisma.js";
import { requireAuth, requireOwnership } from "../../utils/auth.js";

export const TaskResolvers = {
  Query: {
    // Get all tasks (authenticated users only)
    tasks: async (_, __, { req }) => {
      requireAuth(req);
      return await prisma.task.findMany({
        include: {
          course: true,
          user: true,
        },
      });
    },

    // Get task by ID (authenticated users only)
    task: async (_, { id }, { req }) => {
      requireAuth(req);
      return await prisma.task.findUnique({
        where: { id },
        include: {
          course: true,
          user: true,
        },
      });
    },

    // Get tasks by course ID (authenticated users only)
    tasksByCourse: async (_, { courseId }, { req }) => {
      requireAuth(req);
      return await prisma.task.findMany({
        where: { courseId },
        include: {
          course: true,
          user: true,
        },
      });
    },

    // Get tasks by user ID (authenticated users only)
    tasksByUser: async (_, { userId }, { req }) => {
      requireAuth(req);
      return await prisma.task.findMany({
        where: { userId },
        include: {
          course: true,
          user: true,
        },
      });
    },

    // Get completed tasks for a user (authenticated users only)
    completedTasks: async (_, { userId }, { req }) => {
      requireAuth(req);
      return await prisma.task.findMany({
        where: {
          userId,
          completed: true,
        },
        include: {
          course: true,
          user: true,
        },
      });
    },

    // Get pending (incomplete) tasks for a user (authenticated users only)
    pendingTasks: async (_, { userId }, { req }) => {
      requireAuth(req);
      return await prisma.task.findMany({
        where: {
          userId,
          completed: false,
        },
        include: {
          course: true,
          user: true,
        },
      });
    },
  },

  Mutation: {
    // Create a new task (authenticated users only, creates for logged-in user)
    createTask: async (_, { title, deadline, courseId, completed }, { req }) => {
      const userId = requireAuth(req);
      
      // Verify user owns the course
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) {
        throw new Error("Course not found");
      }
      requireOwnership(req, course.userId);

      return await prisma.task.create({
        data: {
          title,
          deadline: new Date(deadline),
          courseId,
          userId,
          completed: completed ?? false,
        },
        include: {
          course: true,
          user: true,
        },
      });
    },

    // Update a task (only task owner can update)
    updateTask: async (_, { id, title, deadline, completed }, { req }) => {
      requireAuth(req);
      
      // Check if task exists and user owns it
      const task = await prisma.task.findUnique({ where: { id } });
      if (!task) {
        throw new Error("Task not found");
      }
      requireOwnership(req, task.userId);

      const data = {};
      if (title !== undefined) data.title = title;
      if (deadline !== undefined) data.deadline = new Date(deadline);
      if (completed !== undefined) data.completed = completed;

      return await prisma.task.update({
        where: { id },
        data,
        include: {
          course: true,
          user: true,
        },
      });
    },

    // Toggle task completion status (only task owner can toggle)
    toggleTaskCompletion: async (_, { id }, { req }) => {
      requireAuth(req);
      
      const task = await prisma.task.findUnique({
        where: { id },
      });

      if (!task) {
        throw new Error("Task not found");
      }
      requireOwnership(req, task.userId);

      return await prisma.task.update({
        where: { id },
        data: {
          completed: !task.completed,
        },
        include: {
          course: true,
          user: true,
        },
      });
    },

    // Delete a task (only task owner can delete)
    deleteTask: async (_, { id }, { req }) => {
      requireAuth(req);
      
      // Check if task exists and user owns it
      const task = await prisma.task.findUnique({ where: { id } });
      if (!task) {
        throw new Error("Task not found");
      }
      requireOwnership(req, task.userId);

      return await prisma.task.delete({
        where: { id },
        include: {
          course: true,
          user: true,
        },
      });
    },
  },

  // Field resolvers for Task type
  Task: {
    course: async (parent) => {
      return await prisma.course.findUnique({
        where: { id: parent.courseId },
      });
    },
    user: async (parent) => {
      return await prisma.user.findUnique({
        where: { id: parent.userId },
      });
    },
  },
};