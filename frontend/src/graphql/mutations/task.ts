import { gql } from "@apollo/client";

export const CREATE_TASK = gql`
  mutation CreateTask(
    $title: String!
    $deadline: String!
    $courseId: Int!
    $completed: Boolean
  ) {
    createTask(
      title: $title
      deadline: $deadline
      courseId: $courseId
      completed: $completed
    ) {
      id
      title
      deadline
      completed
      courseId
      createdAt
      course {
        id
        name
      }
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask(
    $id: Int!
    $title: String
    $deadline: String
    $completed: Boolean
  ) {
    updateTask(
      id: $id
      title: $title
      deadline: $deadline
      completed: $completed
    ) {
      id
      title
      deadline
      completed
      courseId
      createdAt
    }
  }
`;

export const TOGGLE_TASK_COMPLETION = gql`
  mutation ToggleTaskCompletion($id: Int!) {
    toggleTaskCompletion(id: $id) {
      id
      completed
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: Int!) {
    deleteTask(id: $id) {
      id
      title
    }
  }
`;
