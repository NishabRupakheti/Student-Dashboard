// this will keep all auth related graphql schema definitions

import { gql } from "apollo-server-express";

export const AuthTypeDefs = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    login(email: String!, password: String!): String!
  }
`;
