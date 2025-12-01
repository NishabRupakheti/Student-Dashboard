// here apollo server setup gets integrated

import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageLocalDefault } from "apollo-server-core";
import resolvers from "./resolvers/index.js";
import typeDefs from "./schema/index.js";


const ApolloServerInstance = new ApolloServer({
  typeDefs,
  resolvers,
  // Pass req and res to GraphQL context so resolvers can access session
  context: ({ req, res }) => ({ req, res }),
  // Enable the built-in playground
  plugins: [ApolloServerPluginLandingPageLocalDefault({ embed: true })],
});

export default ApolloServerInstance;
