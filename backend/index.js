// here lives the express app and this is the main entry point

import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import ApolloServerInstance from './graphql/server.js';

const app = express();
const PORT = process.env.PORT || 4000;

async function startServer() {
  await ApolloServerInstance.start();
  ApolloServerInstance.applyMiddleware({ app, path: '/graphql' });
  
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/graphql`);
  });
}

startServer();