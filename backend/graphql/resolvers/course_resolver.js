// Course resolver functions for handling GraphQL requests

import prisma from "../../lib/prisma.js";
import { requireAuth, requireOwnership } from "../../utils/auth.js";

export const CourseResolvers = {
  Query: {
    // Get all courses (authenticated users only)
    courses: async (_, __, { req }) => {
      requireAuth(req);
      return await prisma.course.findMany({
        include: {
          user: true,
          tasks: true,
        },
      });
    },

    // Get course by ID (authenticated users only)
    course: async (_, { id }, { req }) => {
      requireAuth(req);
      return await prisma.course.findUnique({
        where: { id },
        include: {
          user: true,
          tasks: true,
        },
      });
    },

    // Get courses by user ID (authenticated users only)
    coursesByUser: async (_, { userId }, { req }) => {
      requireAuth(req);
      return await prisma.course.findMany({
        where: { userId },
        include: {
          user: true,
          tasks: true,
        },
      });
    },
  },

  Mutation: {
    // Create a new course (authenticated users only, creates for logged-in user)
    createCourse: async (_, { name, description }, { req }) => {
      const userId = requireAuth(req);
      return await prisma.course.create({
        data: {
          name,
          description,
          userId,
        },
        include: {
          user: true,
          tasks: true,
        },
      });
    },

    // Update a course (only course owner can update)
    updateCourse: async (_, { id, name, description }, { req }) => {
      requireAuth(req);
      
      // Check if course exists and user owns it
      const course = await prisma.course.findUnique({ where: { id } });
      if (!course) {
        throw new Error("Course not found");
      }
      requireOwnership(req, course.userId);

      const data = {};
      if (name !== undefined) data.name = name;
      if (description !== undefined) data.description = description;

      return await prisma.course.update({
        where: { id },
        data,
        include: {
          user: true,
          tasks: true,
        },
      });
    },

    // Delete a course (only course owner can delete)
    deleteCourse: async (_, { id }, { req }) => {
      requireAuth(req);
      
      // Check if course exists and user owns it
      const course = await prisma.course.findUnique({ where: { id } });
      if (!course) {
        throw new Error("Course not found");
      }
      requireOwnership(req, course.userId);

      return await prisma.course.delete({
        where: { id },
        include: {
          user: true,
          tasks: true,
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