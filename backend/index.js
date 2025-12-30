// here lives the express app and this is the main entry point

import dotenv from "dotenv";
dotenv.config();
import express from "express";
import ApolloServerInstance from "./graphql/server.js";
import redisClient from "./redis/redisConnection.js"; 
import { redisSession } from "./redis/redisConnection.js";

// init the express app 
const app = express();
const PORT = process.env.PORT || 4000;

// Health check endpoint for traefik
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// use the redis session middleware
app.use(redisSession);

// this will start the apollo server and apply the middleware to express app
async function startServer() {
  await ApolloServerInstance.start();
  ApolloServerInstance.applyMiddleware({ 
    app, 
    path: "/graphql",
    cors: {
      origin: 'http://localhost',
      credentials: true
    }
  });

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/graphql`);
  });
}

startServer();
