import { gql } from "@apollo/client";

export const GET_TASKS = gql`
  query GetTasks {
    tasks {
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

export const GET_TASK = gql`
  query GetTask($id: Int!) {
    task(id: $id) {
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

export const GET_TASKS_BY_COURSE = gql`
  query GetTasksByCourse($courseId: Int!) {
    tasksByCourse(courseId: $courseId) {
      id
      title
      deadline
      completed
      createdAt
    }
  }
`;
