// Task GraphQL schema

import { gql } from "apollo-server-express";

export const TaskTypeDefs = gql`
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

  type Course {
    id: Int!
    name: String!
    description: String
  }

  type User {
    id: Int!
    email: String!
  }

  type Query {
    # Get all tasks
    tasks: [Task!]!
    
    # Get a specific task by ID
    task(id: Int!): Task
    
    # Get tasks by course ID
    tasksByCourse(courseId: Int!): [Task!]!
    
    # Get tasks by user ID
    tasksByUser(userId: Int!): [Task!]!
    
    # Get completed tasks
    completedTasks(userId: Int!): [Task!]!
    
    # Get pending tasks
    pendingTasks(userId: Int!): [Task!]!
  }

  type Mutation {
    # Create a new task (uses logged-in user's ID)
    createTask(
      title: String!
      deadline: String!
      courseId: Int!
      completed: Boolean
    ): Task!
    
    # Update a task
    updateTask(
      id: Int!
      title: String
      deadline: String
      completed: Boolean
    ): Task!
    
    # Toggle task completion status
    toggleTaskCompletion(id: Int!): Task!
    
    # Delete a task
    deleteTask(id: Int!): Task!
  }
`;