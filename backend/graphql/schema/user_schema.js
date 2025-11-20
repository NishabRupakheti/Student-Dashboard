// User GraphQL schema

import { gql } from "apollo-server-express";

export const UserTypeDefs = gql`
  type User {
    id: Int!
    firstName: String!
    lastName: String!
    email: String!
    password: String!
    courses: [Course!]!
    tasks: [Task!]!
    createdAt: String!
  }

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

  type Query {
    _empty: String
  }

  type Mutation {
    # User mutations
    createUser(
      firstName: String!
      lastName: String!
      email: String!
      password: String!
    ): User!
    
    updateUser(
      id: Int!
      firstName: String
      lastName: String
      email: String
      password: String
    ): User!
    
    deleteUser(id: Int!): User!
  }
`;
