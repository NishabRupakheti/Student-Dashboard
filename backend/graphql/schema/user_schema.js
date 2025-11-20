// User GraphQL schema

import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type User {
    id: Int!
    email: String!
    password: String!
    optionalfield: String
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
      email: String!
      password: String!
      optionalfield: String
    ): User!
    
    updateUser(
      id: Int!
      email: String
      password: String
      optionalfield: String
    ): User!
    
    deleteUser(id: Int!): User!
  }
`;
