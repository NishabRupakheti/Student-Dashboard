// Task resolver functions for handling GraphQL requests

import prisma from "../../lib/prisma.js";

export const TaskResolvers = {
  Query: {
    // Get all tasks
    tasks: async () => {
      return await prisma.task.findMany({
        include: {
          course: true,
          user: true,
        },
      });
    },

    // Get task by ID
    task: async (_, { id }) => {
      return await prisma.task.findUnique({
        where: { id },
        include: {
          course: true,
          user: true,
        },
      });
    },

    // Get tasks by course ID
    tasksByCourse: async (_, { courseId }) => {
      return await prisma.task.findMany({
        where: { courseId },
        include: {
          course: true,
          user: true,
        },
      });
    },

    // Get tasks by user ID
    tasksByUser: async (_, { userId }) => {
      return await prisma.task.findMany({
        where: { userId },
        include: {
          course: true,
          user: true,
        },
      });
    },

    // Get completed tasks for a user
    completedTasks: async (_, { userId }) => {
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

    // Get pending (incomplete) tasks for a user
    pendingTasks: async (_, { userId }) => {
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
    // Create a new task
    createTask: async (_, { title, deadline, courseId, userId, completed }) => {
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

    // Update a task
    updateTask: async (_, { id, title, deadline, completed }) => {
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

    // Toggle task completion status
    toggleTaskCompletion: async (_, { id }) => {
      const task = await prisma.task.findUnique({
        where: { id },
      });

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

    // Delete a task
    deleteTask: async (_, { id }) => {
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