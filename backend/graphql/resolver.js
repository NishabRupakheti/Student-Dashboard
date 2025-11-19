
// resolver functions for handling GraphQL requests
// import the prisma client 

import prisma from '../lib/prisma.js';

export const resolvers = {
  Query: {
    hello: async () => {
      const courses = await prisma.course.findMany();
      return `Hello! We have ${courses.length} courses available.`;
    },
  },
};