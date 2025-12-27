import { gql } from "@apollo/client";

export const CREATE_COURSE = gql`
  mutation CreateCourse($name: String!, $description: String) {
    createCourse(name: $name, description: $description) {
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

export const UPDATE_COURSE = gql`
  mutation UpdateCourse($id: Int!, $name: String, $description: String) {
    updateCourse(id: $id, name: $name, description: $description) {
      id
      name
      description
      createdAt
    }
  }
`;

export const DELETE_COURSE = gql`
  mutation DeleteCourse($id: Int!) {
    deleteCourse(id: $id) {
      id
      name
    }
  }
`;
