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

// use the redis session middleware
app.use(redisSession);


// this is a test route to check if redis session is working (REST endpoint)
app.get("/redis" , (req, res) => {
   req.session.test = "HOLA MFFFF";
   res.json({ message: "Session set in Redis", session: req.session });
});



// this will start the apollo server and apply the middleware to express app
async function startServer() {
  await ApolloServerInstance.start();
  ApolloServerInstance.applyMiddleware({ app, path: "/graphql" });

  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/graphql`);
  });
}

startServer();
