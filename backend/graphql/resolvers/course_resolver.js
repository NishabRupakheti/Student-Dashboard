// Course resolver functions for handling GraphQL requests

import prisma from "../../lib/prisma.js";

export const resolvers = {
  Query: {
    // Get all courses
    courses: async () => {
      return await prisma.course.findMany({
        include: {
          user: true,
          task: true,
        },
      });
    },

    // Get course by ID
    course: async (_, { id }) => {
      return await prisma.course.findUnique({
        where: { id },
        include: {
          user: true,
          task: true,
        },
      });
    },

    // Get courses by user ID
    coursesByUser: async (_, { userId }) => {
      return await prisma.course.findMany({
        where: { userId },
        include: {
          user: true,
          task: true,
        },
      });
    },
  },

  Mutation: {
    // Create a new course
    createCourse: async (_, { name, description, userId }) => {
      return await prisma.course.create({
        data: {
          name,
          description,
          userId,
        },
        include: {
          user: true,
          task: true,
        },
      });
    },

    // Update a course
    updateCourse: async (_, { id, name, description }) => {
      const data = {};
      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description;

      return await prisma.course.update({
        where: { id },
        data,
        include: {
          user: true,
          task: true,
        },
      });
    },

    // Delete a course
    deleteCourse: async (_, { id }) => {
      return await prisma.course.delete({
        where: { id },
        include: {
          user: true,
          task: true,
        },
      });
    },
  },

  // Field resolvers for Course type
  Course: {
    user: async (parent) => {
      return await prisma.user.findUnique({
        where: { id: parent.userId },
      });
    },
    tasks: async (parent) => {
      return await prisma.task.findMany({
        where: { courseId: parent.id },
      });
    },
  },
};