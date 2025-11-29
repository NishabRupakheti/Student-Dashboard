// this will handle all auth related graphql requests
import prisma from "../../lib/prisma.js";
import bcrypt from "bcryptjs";

export const AuthResolvers = {
  Query: {
    // Placeholder for future auth-related queries
    _empty: () => null,
  },

  Mutation: {
    register: async (_, { email, password, firstName, lastName }) => {
      try {
        // making sure if we have all the inputs
        if (!email || !password || !firstName || !lastName) {
          throw new Error("All fields are required");
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error("Invalid email format");
        }

        // making sure if password is strong enough (minimum 6 characters)
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters long");
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          throw new Error("User with this email already exists");
        }

        // Hash the given password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
          },
        });

        return "User registered successfully";
      } catch (error) {
        throw new Error(error.message || "Registration failed");
      }
    },
    // Placeholder for future auth-related mutations
    login: async () => {
      return "User logged in successfully";
    },
  },
};
