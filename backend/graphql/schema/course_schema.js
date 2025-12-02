// Course GraphQL schema

import { gql } from "apollo-server-express";

export const CourseTypeDefs = gql`
  type Course {
    id: Int!
    name: String!
    description: String
    userId: Int!
    user: User!
    tasks: [Task!]!
    createdAt: String!
  }

  type Task {
    id: Int!
    title: String!
    deadline: String!
    completed: Boolean!
    courseId: Int!
    userId: Int!
    course: Course!
    user: User!
    createdAt: String!
  }

  type User {
    id: Int!
    email: String!
  }

  type Query {
    # Get all courses
    courses: [Course!]!
    
    # Get a specific course by ID
    course(id: Int!): Course
    
    # Get courses by user ID
    coursesByUser(userId: Int!): [Course!]!
  }

  type Mutation {
    # Create a new course (uses logged-in user's ID)
    createCourse(
      name: String!
      description: String
    ): Course!
    
    # Update a course
    updateCourse(
      id: Int!
      name: String
      description: String
    ): Course!
    
    # Delete a course
    deleteCourse(id: Int!): Course!
  }
`;