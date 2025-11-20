// User resolver functions for handling GraphQL requests

import prisma from "../../lib/prisma.js";

export const UserResolvers = {
  Query: {
    _empty: () => null,
  },

  Mutation: {
    // Create a new user
    createUser: async (_, { firstName, lastName, email, password }) => {
      return await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password,
        },
        include: {
          courses: true,
          tasks: true,
        },
      });
    },

    // Update an existing user
    updateUser: async (_, { id, firstName, lastName, email, password }) => {
      const data = {};
      if (firstName !== undefined) data.firstName = firstName;
      if (lastName !== undefined) data.lastName = lastName;
      if (email !== undefined) data.email = email;
      if (password !== undefined) data.password = password;

      return await prisma.user.update({
        where: { id },
        data,
        include: {
          courses: true,
          tasks: true,
        },
      });
    },

    // Delete a user
    deleteUser: async (_, { id }) => {
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
