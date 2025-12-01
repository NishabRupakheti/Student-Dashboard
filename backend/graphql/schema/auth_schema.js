// this will keep all auth related graphql schema definitions

import { gql } from "apollo-server-express";

export const AuthTypeDefs = gql`
  type Mutation {
    register(
      email: String!
      password: String!
      firstName: String!
      lastName: String!
    ): String!
    login(email: String!, password: String!): String!
    logout: String!
  }

  type Query {
    me: User
  }
`;
