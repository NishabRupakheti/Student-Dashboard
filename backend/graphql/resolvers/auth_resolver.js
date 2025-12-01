// this will handle all auth related graphql requests
import prisma from "../../lib/prisma.js";
import bcrypt from "bcryptjs";

export const AuthResolvers = {
  Query: {
    // Get current logged-in user from session
    me: async (_, __, { req }) => {
      if (!req.session.userId) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.session.userId },
      });

      return user;
    },
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

    login: async (_, args, { req }) => {
      try {

        const { email, password } = args;

        // Validate inputs
        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        // Compare password with stored hash
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
          throw new Error("Invalid email or password");
        }

        // Create session - store userId in session
        req.session.userId = user.id;
        req.session.createdAt = new Date().toISOString();

        // Explicitly save session to Redis and wait for completion
        return new Promise((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error("Session save error:", err);
              reject(new Error("Failed to create session: " + err.message));
            }
            resolve("Login successful");
          });
        });
      } catch (error) {
        throw new Error(error.message || "Login failed");
      }
    },

    logout: async (_, __, { req }) => {
      return new Promise((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) {
            reject(new Error("Failed to logout"));
          }
          resolve("Logout successful");
        });
      });
    },
  },
};
