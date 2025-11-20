// here apollo server setup gets integrated

import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./schema/user_schema.js";
import { resolvers } from "./resolvers/user_resolvers.js";

const ApolloServerInstance = new ApolloServer({
  typeDefs,
  resolvers,
});

export default ApolloServerInstance;
