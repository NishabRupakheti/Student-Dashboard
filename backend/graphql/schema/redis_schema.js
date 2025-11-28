import { gql } from "apollo-server-express";

export const RedisTypeDefs = gql`
  type Query {
    # Check Redis connection status
    redisStatus: String!,
    readRedisTestData(key: String!): String!
  }
  type Mutation {
    setRedisTestData(key: String!, value: String!): String!
  }
`;
