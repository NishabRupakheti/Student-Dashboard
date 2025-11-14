// here apollo server setup gets integrated

import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./schema.js";
import { resolvers } from "./resolver.js";

const ApolloServerInstance = new ApolloServer({
  typeDefs,
  resolvers,
});

export default ApolloServerInstance;
