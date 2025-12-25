// User resolver functions for handling GraphQL requests

import prisma from "../../lib/prisma.js";
import bcrypt from "bcryptjs";
import { requireAuth } from "../../utils/auth.js";


export const UserResolvers = {
  Query: {
    _empty: () => null,
  },

  Mutation: {
    // Create a new user (public - no auth required)
    createUser: async (_, { firstName, lastName, email, password }) => {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      return await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
        },
        include: {
          courses: true,
          tasks: true,
        },
      });
    },

    // Update an existing user (only the user themselves can update)
    updateUser: async (_, { id, firstName, lastName, email, password }, { req }) => {
      const userId = requireAuth(req);
      
      // Users can only update their own profile
      if (userId !== id) {
        throw new Error("Not authorized. You can only update your own profile.");
      }

      const data = {};
      if (firstName !== undefined) data.firstName = firstName;
      if (lastName !== undefined) data.lastName = lastName;
      if (email !== undefined) data.email = email;
      if (password !== undefined) {
        const saltRounds = 10;
        data.password = await bcrypt.hash(password, saltRounds);
      }

      return await prisma.user.update({
        where: { id },
        data,
        include: {
          courses: true,
          tasks: true,
        },
      });
    },

    // Delete a user (only the user themselves can delete their account)
    deleteUser: async (_, { id }, { req }) => {
      const userId = requireAuth(req);
      
      // Users can only delete their own account
      if (userId !== id) {
        throw new Error("Not authorized. You can only delete your own account.");
      }

      return await prisma.user.delete({
        where: { id },
        include: {
          courses: true,
          tasks: true,
        },
      });
    },
  },

  // Field resolvers for User type
  User: {
    courses: async (parent) => {
      return await prisma.course.findMany({
        where: { userId: parent.id },
      });
    },
    tasks: async (parent) => {
      return await prisma.task.findMany({
        where: { userId: parent.id },
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

  // Field resolvers for Task type
  Task: {
    user: async (parent) => {
      return await prisma.user.findUnique({
        where: { id: parent.userId },
      });
    },
    course: async (parent) => {
      return await prisma.course.findUnique({
        where: { id: parent.courseId },
      });
    },
  },
};
