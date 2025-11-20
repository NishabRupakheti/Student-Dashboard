// here apollo server setup gets integrated

import { ApolloServer } from "apollo-server-express";
import resolvers from "./resolvers/index.js";
import typeDefs from "./schema/index.js";


const ApolloServerInstance = new ApolloServer({
  typeDefs,
  resolvers,
});

export default ApolloServerInstance;
