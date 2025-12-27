import { gql } from "@apollo/client";

export const GET_COURSES = gql`
  query GetCourses {
    courses {
      id
      name
      description
      createdAt
      tasks {
        id
        completed
      }
    }
  }
`;

export const GET_COURSE = gql`
  query GetCourse($id: Int!) {
    course(id: $id) {
      id
      name
      description
      createdAt
      tasks {
        id
        title
        deadline
        completed
        createdAt
      }
    }
  }
`;
